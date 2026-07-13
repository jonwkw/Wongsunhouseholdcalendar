import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppData, Member } from './types'
import { seedData, DEFAULT_CHECKLIST, SAMPLE_DISHES } from './data/seed'
import { getSyncConfig, saveSyncConfig, pullRemote, pushRemote } from './utils/sync'
import type { SyncConfig } from './utils/sync'
import { todayKey, addDays } from './utils/dates'

// Stage 1 persistence: localStorage on this device.
// Stage 2 (family sync): the same data is mirrored to a shared Firestore
// document when a sync config is connected — last write wins, polled sync.
const STORAGE_KEY = 'wongsun-household-v2'
const LOCK_KEY = 'wongsun-locked'
const STAMP_KEY = 'wongsun-stamp'
const PULL_INTERVAL = 8000
const PUSH_DEBOUNCE = 1200

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return migrate(JSON.parse(raw) as AppData)
  } catch {
    // corrupted storage — fall through to seed
  }
  return seedData()
}

/** Backfill fields added since the data was saved */
function migrate(data: AppData): AppData {
  // v3: top up the dish library once with samples across cuisines/food types,
  // and backfill type/cuisine on early dishes saved before those fields existed
  const version = data.version ?? 2
  let dishes = (data.dishes ?? []).map((dish) => {
    const sample = SAMPLE_DISHES.find((s) => s.id === dish.id)
    return sample ? { ...dish, foodType: dish.foodType ?? sample.foodType, cuisine: dish.cuisine ?? sample.cuisine } : dish
  })
  // v4: the family asked for a clean slate — wipe sample-era activities,
  // dishes and planned meals once. Members, reminders and Rosco's data stay.
  const wipe = version < 4
  if (wipe) dishes = []
  // v5: reset Rosco's rocket to 4 of 5 fuel cells on the first rocket
  // (family request) — keep his most recent real star days where possible
  let starDays = data.starDays ?? []
  let bonusFuel = data.bonusFuel ?? 0
  if (version < 5) {
    starDays = starDays.slice(-4)
    let pad = 1
    while (starDays.length < 4) {
      starDays = [addDays(todayKey(), -pad), ...starDays]
      pad++
    }
    bonusFuel = 0
  }
  // v6: undo one super bonus (family request) — tank sits fresh on rocket 2
  if (version < 6) {
    bonusFuel = Math.max(0, bonusFuel - 1)
  }
  // v7: (short-lived) one completed day equalled one launch
  if (version < 7) {
    const oldLaunches = Math.floor((starDays.length + bonusFuel) / 5)
    starDays = starDays.slice(-oldLaunches)
    bonusFuel = 0
  }
  // v8: back to the 5-tank gauge (one tank per completed day, five per
  // lift-off) — rebuild each v7 launch as five tank-days
  if (version < 8) {
    const launchesV7 = starDays.length + bonusFuel
    const hadToday = starDays.includes(todayKey())
    const rebuilt: string[] = []
    for (let i = 0; i < launchesV7 * 5; i++) {
      rebuilt.unshift(addDays(todayKey(), hadToday ? -i : -(i + 1)))
    }
    starDays = rebuilt
    bonusFuel = 0
  }
  // v9: two tanks on the house — Rosco starts the new gauge at 2/5 🎁
  if (version < 9) {
    bonusFuel += 2
  }
  return {
    ...data,
    version: Math.max(version, 9),
    dishes,
    activityTemplates: wipe ? [] : (data.activityTemplates ?? []),
    // snack rows retired — the menu is back to three meals
    menuEntries: wipe
      ? []
      : (data.menuEntries ?? [])
          .map((m) => ({ ...m, memberIds: m.memberIds ?? [] }))
          .filter((m) => !(m.slot as string).startsWith('snack')),
    // backfill Chinese text on checklist items stored before it existed
    kidChecklist: (data.kidChecklist ?? DEFAULT_CHECKLIST).map((c) => ({
      ...c,
      textZh: c.textZh ?? DEFAULT_CHECKLIST.find((d) => d.id === c.id)?.textZh,
    })),
    kidChecks: data.kidChecks ?? {},
    kidSkips: data.kidSkips ?? {},
    // completed challenges are keyed per specific challenge ("word:2");
    // early entries stored just the type — treat those as the day's first
    kidChallenges: Object.fromEntries(
      Object.entries(data.kidChallenges ?? {}).map(([k, v]) => [
        k,
        (v ?? []).map((x) => (x.includes(':') ? x : `${x}:0`)),
      ]),
    ),
    starDays,
    bonusFuel,
    // school timetable cancelled (holidays) — remove the seeded series everywhere
    activities: wipe ? [] : (data.activities ?? []).filter((a) => a.id !== 'a-school'),
    // requests retired — everything on the board is a reminder now
    boardItems: (data.boardItems ?? []).map((b) => ({ ...b, kind: 'reminder' as const })),
    // day reminders retired — plain notes only (reminders live on the board)
    dayNotes: (data.dayNotes ?? []).map((n) => ({ ...n, kind: 'note' as const })),
  }
}

function persist(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadStamp(): number {
  return Number(localStorage.getItem(STAMP_KEY) ?? 0)
}

function saveStamp(n: number) {
  localStorage.setItem(STAMP_KEY, String(n))
}

export type SyncState = 'off' | 'ok' | 'syncing' | 'error'

export interface SyncStatus {
  config: SyncConfig | null
  state: SyncState
  lastSync: number | null
  error?: string
  /** Connect this device; adopts the family's remote data if it's newer */
  connect: (config: SyncConfig) => Promise<void>
  disconnect: () => void
}

interface AppStore {
  data: AppData
  /** Apply a change to the data; the result is persisted immediately. */
  update: (fn: (data: AppData) => AppData) => void
  memberById: (id?: string) => Member | undefined
  resetAll: () => void
  /** Kid lock: when true, editing UI is hidden across the app */
  locked: boolean
  setLocked: (v: boolean) => void
  sync: SyncStatus
}

const StoreContext = createContext<AppStore | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load)
  const [locked, setLockedState] = useState(() => localStorage.getItem(LOCK_KEY) === '1')
  const [syncConfig, setSyncConfig] = useState<SyncConfig | null>(getSyncConfig)
  const [syncState, setSyncState] = useState<SyncState>(syncConfig ? 'syncing' : 'off')
  const [lastSync, setLastSync] = useState<number | null>(null)
  const [syncError, setSyncError] = useState<string | undefined>()

  // refs so the polling loop always sees current values without re-arming
  const dataRef = useRef(data)
  dataRef.current = data
  const configRef = useRef(syncConfig)
  configRef.current = syncConfig
  const stampRef = useRef(loadStamp())
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setLocked = useCallback((v: boolean) => {
    localStorage.setItem(LOCK_KEY, v ? '1' : '0')
    setLockedState(v)
  }, [])

  useEffect(() => persist(data), [data])

  const doPush = useCallback(async () => {
    const config = configRef.current
    if (!config) return
    try {
      setSyncState('syncing')
      await pushRemote(config, dataRef.current, stampRef.current)
      setSyncState('ok')
      setSyncError(undefined)
      setLastSync(Date.now())
    } catch (e) {
      setSyncState('error')
      setSyncError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  /** Local edit: bump the stamp and push soon (debounced while typing) */
  const update = useCallback((fn: (d: AppData) => AppData) => {
    setData((prev) => fn(prev))
    stampRef.current = Date.now()
    saveStamp(stampRef.current)
    if (configRef.current) {
      if (pushTimer.current) clearTimeout(pushTimer.current)
      pushTimer.current = setTimeout(doPush, PUSH_DEBOUNCE)
    }
  }, [doPush])

  // poll for remote edits from the rest of the family
  useEffect(() => {
    if (!syncConfig) return
    let stopped = false
    const tick = async () => {
      const config = configRef.current
      if (!config || stopped) return
      try {
        const remote = await pullRemote(config)
        if (stopped) return
        if (remote && remote.stamp > stampRef.current) {
          stampRef.current = remote.stamp
          saveStamp(remote.stamp)
          setData(migrate(remote.data))
        }
        setSyncState('ok')
        setSyncError(undefined)
        setLastSync(Date.now())
      } catch (e) {
        if (!stopped) {
          setSyncState('error')
          setSyncError(e instanceof Error ? e.message : String(e))
        }
      }
    }
    tick()
    const id = setInterval(tick, PULL_INTERVAL)
    return () => {
      stopped = true
      clearInterval(id)
    }
  }, [syncConfig])

  const connect = useCallback(async (config: SyncConfig) => {
    saveSyncConfig(config)
    setSyncConfig(config)
    setSyncState('syncing')
    try {
      const remote = await pullRemote(config)
      if (remote && remote.stamp > stampRef.current) {
        // the family already has newer data — adopt it
        stampRef.current = remote.stamp
        saveStamp(remote.stamp)
        setData(migrate(remote.data))
      } else {
        // first device (or ours is newest) — publish what we have
        stampRef.current = Date.now()
        saveStamp(stampRef.current)
        await pushRemote(config, dataRef.current, stampRef.current)
      }
      setSyncState('ok')
      setSyncError(undefined)
      setLastSync(Date.now())
    } catch (e) {
      setSyncState('error')
      setSyncError(e instanceof Error ? e.message : String(e))
      throw e
    }
  }, [])

  const disconnect = useCallback(() => {
    saveSyncConfig(null)
    setSyncConfig(null)
    setSyncState('off')
    setSyncError(undefined)
  }, [])

  const resetAll = useCallback(() => {
    setData(seedData())
  }, [])

  const store = useMemo<AppStore>(
    () => ({
      data,
      update,
      memberById: (id) => data.members.find((m) => m.id === id),
      resetAll,
      locked,
      setLocked,
      sync: { config: syncConfig, state: syncState, lastSync, error: syncError, connect, disconnect },
    }),
    [data, update, resetAll, locked, setLocked, syncConfig, syncState, lastSync, syncError, connect, disconnect],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useApp(): AppStore {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useApp must be used within StoreProvider')
  return ctx
}
