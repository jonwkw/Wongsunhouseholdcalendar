import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppData, Member } from './types'
import { seedData } from './data/seed'

// Stage 1 persistence: localStorage on this device.
// Stage 2 swaps `load`/`persist` for a synced backend without touching the UI.
const STORAGE_KEY = 'wongsun-household-v1'
const CURRENT_MEMBER_KEY = 'wongsun-current-member'

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AppData
  } catch {
    // corrupted storage — fall through to seed
  }
  return seedData()
}

function persist(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

interface AppStore {
  data: AppData
  /** Apply a change to the data; the result is persisted immediately. */
  update: (fn: (data: AppData) => AppData) => void
  currentMember: Member
  setCurrentMemberId: (id: string) => void
  memberById: (id?: string) => Member | undefined
  resetAll: () => void
}

const StoreContext = createContext<AppStore | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load)
  const [currentMemberId, setCurrentMemberId] = useState<string>(
    () => localStorage.getItem(CURRENT_MEMBER_KEY) ?? '',
  )

  useEffect(() => persist(data), [data])
  useEffect(() => localStorage.setItem(CURRENT_MEMBER_KEY, currentMemberId), [currentMemberId])

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setData((prev) => fn(prev))
  }, [])

  const resetAll = useCallback(() => {
    setData(seedData())
  }, [])

  const store = useMemo<AppStore>(() => {
    const currentMember = data.members.find((m) => m.id === currentMemberId) ?? data.members[0]
    return {
      data,
      update,
      currentMember,
      setCurrentMemberId,
      memberById: (id) => data.members.find((m) => m.id === id),
      resetAll,
    }
  }, [data, currentMemberId, update, resetAll])

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useApp(): AppStore {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useApp must be used within StoreProvider')
  return ctx
}
