import type { Activity } from '../types'

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey(): string {
  return toKey(new Date())
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

/** Monday of the week containing the given date */
export function mondayOf(key: string): string {
  const d = fromKey(key)
  const shift = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - shift)
  return toKey(d)
}

export function weekDays(mondayKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(mondayKey, i))
}

export function prettyDate(key: string): string {
  const d = fromKey(key)
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
}

export function longDate(key: string): string {
  const d = fromKey(key)
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

export function relativeLabel(key: string): string {
  const today = todayKey()
  if (key === today) return 'Today'
  if (key === addDays(today, 1)) return 'Tomorrow'
  return prettyDate(key)
}

export function prettyTime(t?: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const suffix = h < 12 ? 'am' : 'pm'
  const hh = h % 12 === 0 ? 12 : h % 12
  return m ? `${hh}:${String(m).padStart(2, '0')}${suffix}` : `${hh}${suffix}`
}

/** Does this activity happen on the given date? */
export function occursOn(a: Activity, dateKey: string): boolean {
  if (a.exceptions.includes(dateKey)) return false
  if (a.date) return a.date === dateKey
  if (!a.recurrence) return false
  const { days, from, until } = a.recurrence
  if (dateKey < from) return false
  if (until && dateKey > until) return false
  return days.includes(fromKey(dateKey).getDay())
}

export function activitiesOn(activities: Activity[], dateKey: string): Activity[] {
  return activities
    .filter((a) => occursOn(a, dateKey))
    .sort((x, y) => (x.time ?? '99') < (y.time ?? '99') ? -1 : 1)
}
