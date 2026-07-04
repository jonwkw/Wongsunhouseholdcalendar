import { useEffect, useState } from 'react'
import { fetchForecast } from './weather'
import type { DayForecast } from './weather'

// Module-level cache so the Today view and the Weather tab share one fetch.
let cached: DayForecast[] | null = null
let inflight: Promise<DayForecast[]> | null = null

async function getForecast(force = false): Promise<DayForecast[]> {
  if (cached && !force) return cached
  if (!inflight || force) {
    inflight = fetchForecast()
      .then((days) => {
        cached = days
        return days
      })
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

export function useForecast() {
  const [days, setDays] = useState<DayForecast[] | null>(cached)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!cached)

  const refresh = (force = false) => {
    setLoading(true)
    setError(null)
    getForecast(force)
      .then(setDays)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load weather'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { days, error, loading, refresh }
}
