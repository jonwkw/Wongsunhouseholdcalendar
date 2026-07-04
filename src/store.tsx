import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppData, Member } from './types'
import { seedData, DEFAULT_CHECKLIST } from './data/seed'

// Stage 1 persistence: localStorage on this device.
// Stage 2 swaps `load`/`persist` for a synced backend without touching the UI.
const STORAGE_KEY = 'wongsun-household-v1'

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
  return {
    ...data,
    menuEntries: (data.menuEntries ?? []).map((m) => ({
      ...m,
      memberIds: m.memberIds ?? [],
      // 'snack' split into snack-am / snack-pm rows
      slot: (m.slot as string) === 'snack' ? 'snack-am' : m.slot,
    })),
    kidChecklist: data.kidChecklist ?? DEFAULT_CHECKLIST,
    kidChecks: data.kidChecks ?? {},
    starDays: data.starDays ?? [],
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
}

const StoreContext = createContext<AppStore | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load)

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
    }),
    [data, update, resetAll],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useApp(): AppStore {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useApp must be used within StoreProvider')
  return ctx
}
