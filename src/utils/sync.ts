// Stage 2: family sync via Google Firestore's REST API (no SDK, no server).
// The whole household document is stored as one JSON blob with a timestamp;
// last write wins. Each device polls for changes and pushes its own edits.
//
// The family creates one free Firebase project (one-time, ~5 minutes), and
// every device connects with the same "setup code": the project's apiKey +
// projectId plus a long random familyId that acts as the shared secret.

import type { AppData } from '../types'

export interface SyncConfig {
  apiKey: string
  projectId: string
  familyId: string
}

const CONFIG_KEY = 'wongsun-sync'

export function getSyncConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as SyncConfig
    if (c.apiKey && c.projectId && c.familyId) return c
  } catch {
    // corrupted — treat as unconfigured
  }
  return null
}

export function saveSyncConfig(c: SyncConfig | null) {
  if (c) localStorage.setItem(CONFIG_KEY, JSON.stringify(c))
  else localStorage.removeItem(CONFIG_KEY)
}

/** The shareable setup code is just the config, base64-encoded */
export function makeSetupCode(c: SyncConfig): string {
  return btoa(JSON.stringify(c))
}

/** Accepts a base64 setup code OR raw JSON pasted from the Firebase console */
export function parseSetupCode(text: string): Partial<SyncConfig> | null {
  const tryParse = (s: string): Partial<SyncConfig> | null => {
    try {
      const o = JSON.parse(s)
      return typeof o === 'object' && o ? o : null
    } catch {
      return null
    }
  }
  const trimmed = text.trim()
  const direct = tryParse(trimmed)
  if (direct) return direct
  try {
    return tryParse(atob(trimmed))
  } catch {
    return null
  }
}

function docUrl(c: SyncConfig): string {
  return (
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(c.projectId)}` +
    `/databases/(default)/documents/families/${encodeURIComponent(c.familyId)}` +
    `?key=${encodeURIComponent(c.apiKey)}`
  )
}

export interface RemoteDoc {
  data: AppData
  stamp: number
}

/** Fetch the family document. null = does not exist yet. Throws on failure. */
export async function pullRemote(c: SyncConfig): Promise<RemoteDoc | null> {
  const res = await fetch(docUrl(c))
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`sync pull failed (${res.status})`)
  const doc = await res.json()
  const json = doc?.fields?.json?.stringValue
  const stamp = Number(doc?.fields?.stamp?.integerValue ?? 0)
  if (!json) return null
  return { data: JSON.parse(json) as AppData, stamp }
}

/** Write the whole household document (creates it if missing). */
export async function pushRemote(c: SyncConfig, data: AppData, stamp: number): Promise<void> {
  const body = JSON.stringify({
    fields: {
      json: { stringValue: JSON.stringify(data) },
      stamp: { integerValue: String(stamp) },
    },
  })
  const res = await fetch(docUrl(c), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
  if (!res.ok) throw new Error(`sync push failed (${res.status})`)
}
