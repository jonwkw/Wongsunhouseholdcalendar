import type { DragEvent } from 'react'

// HTML5 drag-and-drop quirks handled in one place:
// - some browsers only carry 'text/plain', so write the payload under both types
// - dragleave fires when entering a child element, so callers use leavesTarget()

export function setDragPayload(e: DragEvent, payload: unknown) {
  const s = JSON.stringify(payload)
  e.dataTransfer.setData('application/json', s)
  e.dataTransfer.setData('text/plain', s)
  e.dataTransfer.effectAllowed = 'copyMove'
}

export function getDragPayload<T>(e: DragEvent): T | null {
  const s = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain')
  if (!s) return null
  try {
    return JSON.parse(s) as T
  } catch {
    return null
  }
}

/** True only when the pointer actually left the drop target (not moved onto a child) */
export function leavesTarget(e: DragEvent): boolean {
  return !(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node | null)
}
