import { useForecast } from '../utils/useForecast'
import { weatherEmoji } from '../utils/weather'

export function Weather() {
  const { days, error, loading, refresh } = useForecast()

  return (
    <div className="weather-page">
      <div className="page-head">
        <h2>🌤️ Weather — today &amp; next 3 days</h2>
        <button className="btn subtle" onClick={() => refresh(true)} disabled={loading}>
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>
      <p className="hint">Live forecast for Singapore from NEA (data.gov.sg).</p>

      {error && (
        <div className="weather-error">
          😕 Couldn't load the forecast ({error}).{' '}
          <button className="btn subtle" onClick={() => refresh(true)}>Try again</button>
        </div>
      )}

      {days && (
        <div className="weather-cards">
          {days.map((d, i) => (
            <div key={d.date || i} className={`weather-card ${i === 0 ? 'today' : ''}`}>
              <div className="weather-day">{i === 0 ? 'Today' : d.dayLabel}</div>
              <div className="weather-emoji">{weatherEmoji(d.summary)}</div>
              <div className="weather-summary">{d.summary}</div>
              {d.low !== undefined && d.high !== undefined && (
                <div className="weather-temp">
                  {d.low}°–{d.high}°C
                </div>
              )}
              {d.reminders.map((r) => (
                <div key={r} className="weather-reminder">{r}</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
