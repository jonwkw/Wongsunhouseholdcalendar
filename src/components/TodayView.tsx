import { useApp } from '../store'
import { activitiesOn, addDays, longDate, prettyTime, relativeLabel, todayKey } from '../utils/dates'
import { useForecast } from '../utils/useForecast'
import { weatherEmoji } from '../utils/weather'
import { Legend, MemberChips, tagColor } from './shared'
import { NoteChip } from './Timetable'

/** Default landing view: weather, then today + the next 2 days at a glance. */
export function TodayView({ goTo }: { goTo: (tab: string) => void }) {
  const { data } = useApp()
  const { days: forecast, error, loading, refresh } = useForecast()
  const today = todayKey()
  const daySpan = [today, addDays(today, 1), addDays(today, 2)]

  const openBoard = data.boardItems.filter((b) => b.status === 'open')

  return (
    <div className="today-page">
      <div className="page-head">
        <h2 className="today-title">{longDate(today)}</h2>
        <Legend />
      </div>

      {forecast ? (
        <div className="weather-strip">
          {forecast.map((d, i) => (
            <div key={d.date || i} className={`weather-mini ${i === 0 ? 'today' : ''}`}>
              <div className="weather-mini-top">
                <strong>{i === 0 ? 'Today' : d.dayLabel}</strong>
                <span className="weather-emoji-sm">{weatherEmoji(d.summary)}</span>
                {d.low !== undefined && d.high !== undefined && (
                  <span className="weather-mini-temp">{d.low}°–{d.high}°</span>
                )}
              </div>
              <div className="weather-mini-summary">{d.summary}</div>
              {d.reminders[0] && <div className="weather-reminder">{d.reminders[0]}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="weather-strip-note">
          {loading ? (
            '🌤️ Loading the weather…'
          ) : (
            <>
              🌤️ Weather unavailable{error ? ` (${error})` : ''}.{' '}
              <button className="linklike" onClick={() => refresh(true)}>Try again</button>
            </>
          )}
        </div>
      )}

      <div className="today-columns">
        {daySpan.map((date, i) => {
          const acts = activitiesOn(data.activities, date)
          const notes = data.dayNotes.filter((n) => n.date === date)
          const meals = data.menuEntries.filter((m) => m.date === date)
          const boardDue = openBoard.filter((b) => b.forDate === date)

          return (
            <div key={date} className={`today-col ${i === 0 ? 'primary' : ''}`}>
              <div className="today-col-head">
                <h3>{relativeLabel(date)}</h3>
              </div>

              <div className="today-section">
                <h4>🗓️ Activities</h4>
                {acts.length === 0 && <p className="hint">Nothing planned.</p>}
                {acts.map((a) => (
                  <div
                    key={a.id}
                    className="today-activity"
                    style={{ borderLeft: `4px solid ${tagColor(a.memberIds, data.members)}`, paddingLeft: 8 }}
                  >
                    <span className="card-emoji">{a.emoji}</span>
                    <div className="today-activity-body">
                      <span className="card-title">{a.title}</span>
                      <span className="card-time">
                        {a.time ? prettyTime(a.time) : ''}
                        {a.endTime ? `–${prettyTime(a.endTime)}` : ''}
                        {a.location ? ` · 📍 ${a.location}` : ''}
                      </span>
                    </div>
                    <MemberChips memberIds={a.memberIds} size={20} everyone />
                  </div>
                ))}
              </div>

              {notes.length > 0 && (
                <div className="today-section">
                  <h4>📝 Notes &amp; reminders</h4>
                  {notes.map((n) => (
                    <NoteChip key={n.id} note={n} />
                  ))}
                </div>
              )}

              <div className="today-section">
                <h4>🍽️ Menu</h4>
                {meals.length === 0 && (
                  <p className="hint">
                    Not planned yet — <button className="linklike" onClick={() => goTo('menu')}>add to menu</button>
                  </p>
                )}
                {meals.map((m) => (
                  <div
                    key={m.id}
                    className="today-meal"
                    style={{ borderLeft: `4px solid ${tagColor(m.memberIds, data.members)}`, paddingLeft: 8 }}
                  >
                    <span>{m.emoji}</span>
                    <span className="menu-entry-name">
                      <em>{m.slot}:</em> {m.dishName}
                    </span>
                    <MemberChips memberIds={m.memberIds} size={16} everyone />
                  </div>
                ))}
              </div>

              {boardDue.length > 0 && (
                <div className="today-section">
                  <h4>📌 Due from the board</h4>
                  {boardDue.map((b) => (
                    <div key={b.id} className="today-board-item">
                      {b.kind === 'request' ? '🙋' : '📌'} {b.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {openBoard.length > 0 && (
        <button className="today-board-summary" onClick={() => goTo('board')}>
          📌 {openBoard.length} open item{openBoard.length > 1 ? 's' : ''} on the Family Board →
        </button>
      )}
    </div>
  )
}
