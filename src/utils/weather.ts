// Singapore weather via NEA / data.gov.sg open APIs (free, no API key).

export interface PeriodForecast {
  label: string
  summary: string
}

export interface DayForecast {
  date: string
  dayLabel: string
  summary: string
  low?: number
  high?: number
  reminders: string[]
  /** Morning / afternoon / evening breakdown — only available for today */
  periods?: PeriodForecast[]
}

const FOUR_DAY_URL = 'https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook'
const TODAY_URL = 'https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast'

/**
 * Friendly, actionable reminders derived from the forecast text.
 * Returns i18n keys (wx_*) so they render in the chosen language.
 */
export function remindersFor(summary: string, high?: number): string[] {
  const s = summary.toLowerCase()
  const out: string[] = []
  if (s.includes('thundery')) out.push('wx_thunder')
  else if (s.includes('rain') || s.includes('shower')) out.push('wx_umbrella')
  if (s.includes('haz')) out.push('wx_haze')
  if (high !== undefined && high >= 34) out.push('wx_veryhot')
  else if (high !== undefined && high >= 32) out.push('wx_warm')
  if (out.length === 0 && (s.includes('fair') || s.includes('sunny') || s.includes('partly cloudy'))) {
    out.push('wx_nice')
  }
  return out
}

export function weatherEmoji(summary: string): string {
  const s = summary.toLowerCase()
  if (s.includes('thundery')) return '⛈️'
  if (s.includes('heavy')) return '🌧️'
  if (s.includes('shower') || s.includes('rain')) return '🌦️'
  if (s.includes('cloudy')) return '⛅'
  if (s.includes('fair') || s.includes('sunny')) return '☀️'
  if (s.includes('haz')) return '🌫️'
  if (s.includes('wind')) return '💨'
  return '🌤️'
}

interface RawForecast {
  timestamp?: string
  day?: string
  forecast?: { summary?: string; text?: string }
  temperature?: { low?: number; high?: number }
}

/** Fetch today's forecast + next 3 days. Throws on network/API failure. */
export async function fetchForecast(): Promise<DayForecast[]> {
  const [todayRes, fourDayRes] = await Promise.all([
    fetch(TODAY_URL).then((r) => r.json()),
    fetch(FOUR_DAY_URL).then((r) => r.json()),
  ])

  const days: DayForecast[] = []

  const todayRecord = todayRes?.data?.records?.[0]
  if (todayRecord?.general) {
    const g = todayRecord.general
    const summary: string = g.forecast?.text ?? g.forecast?.summary ?? 'No forecast'
    const low = g.temperature?.low
    const high = g.temperature?.high

    // NEA's 24h forecast comes in ~6-hour periods; label each by its start hour.
    // Labels are i18n keys (morning/afternoon/evening/overnight) or raw NEA text.
    const periods: PeriodForecast[] = []
    for (const p of todayRecord.periods ?? []) {
      // NEA timestamps are Singapore-local (+08:00) — read the hour straight
      // from the string so a device in another timezone doesn't shift labels
      const startHour = Number(/T(\d{2}):/.exec(p?.timePeriod?.start ?? '')?.[1] ?? NaN)
      const label = isNaN(startHour)
        ? p?.timePeriod?.text ?? ''
        : startHour < 6
          ? 'overnight'
          : startHour < 12
            ? 'morning'
            : startHour < 18
              ? 'afternoon'
              : 'evening'
      const text = p?.regions?.central?.text ?? p?.regions?.central?.code
      if (label && text) periods.push({ label, summary: text })
    }

    days.push({
      date: todayRecord.date ?? '',
      dayLabel: 'Today',
      summary,
      low,
      high,
      reminders: remindersFor(summary, high),
      periods: periods.slice(0, 3),
    })
  }

  const outlook: RawForecast[] = fourDayRes?.data?.records?.[0]?.forecasts ?? []
  for (const f of outlook) {
    const summary = f.forecast?.summary ?? f.forecast?.text ?? 'No forecast'
    // The 4-day outlook's first entry can duplicate today; keep only future days.
    const date = (f.timestamp ?? '').slice(0, 10)
    if (days[0] && date && date <= days[0].date) continue
    days.push({
      date,
      dayLabel: f.day ?? date,
      summary,
      low: f.temperature?.low,
      high: f.temperature?.high,
      reminders: remindersFor(summary, f.temperature?.high),
    })
    if (days.length >= 4) break
  }

  if (days.length === 0) throw new Error('Weather service returned no data')
  return days
}
