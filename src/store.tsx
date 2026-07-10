import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppData, Member } from './types'
import { seedData, DEFAULT_CHECKLIST, SAMPLE_DISHES } from './data/seed'

// Stage 1 persistence: localStorage on this device.
// Stage 2 swaps `load`/`persist` for a synced backend without touching the UI.
// v2: fresh start with the real family names and minimal sample data.
const STORAGE_KEY = 'wongsun-household-v2'
const LOCK_KEY = 'wongsun-locked'

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
  if (version < 3) {
    const have = new Set(dishes.map((d) => d.name.toLowerCase()))
    dishes = [...dishes, ...SAMPLE_DISHES.filter((s) => !have.has(s.name.toLowerCase()))]
  }
  return {
    ...data,
    version: Math.max(version, 3),
    dishes,
    // snack rows retired — the menu is back to three meals
    menuEntries: (data.menuEntries ?? [])
      .map((m) => ({ ...m, memberIds: m.memberIds ?? [] }))
      .filter((m) => !(m.slot as string).startsWith('snack')),
    // backfill Chinese text on checklist items stored before it existed
    kidChecklist: (data.kidChecklist ?? DEFAULT_CHECKLIST).map((c) => ({
      ...c,
      textZh: c.textZh ?? DEFAULT_CHECKLIST.find((d) => d.id === c.id)?.textZh,
    })),
    kidChecks: data.kidChecks ?? {},
    starDays: data.starDays ?? [],
    // school timetable cancelled (holidays) — remove the seeded series everywhere
    activities: (data.activities ?? []).filter((a) => a.id !== 'a-school'),
    // requests retired — everything on the board is a reminder now
    boardItems: (data.boardItems ?? []).map((b) => ({ ...b, kind: 'reminder' as const })),
    // day reminders retired — plain notes only (reminders live on the board)
    dayNotes: (data.dayNotes ?? []).map((n) => ({ ...n, kind: 'note' as const })),
  }
}

function persist(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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
}

const StoreContext = createContext<AppStore | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load)
  const [locked, setLockedState] = useState(() => localStorage.getItem(LOCK_KEY) === '1')

  const setLocked = useCallback((v: boolean) => {
    localStorage.setItem(LOCK_KEY, v ? '1' : '0')
    setLockedState(v)
  }, [])

  useEffect(() => persist(data), [data])

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setData((prev) => fn(prev))
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
    }),
    [data, update, resetAll, locked, setLocked],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useApp(): AppStore {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useApp must be used within StoreProvider')
  return ctx
}
