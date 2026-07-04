import { useApp } from '../store'
import { activitiesOn, addDays, longDate, prettyTime, relativeLabel, todayKey } from '../utils/dates'
import { useForecast } from '../utils/useForecast'
import { weatherEmoji } from '../utils/weather'
import { Avatar, MemberChips } from './shared'
import { NoteChip } from './Timetable'

/** Default landing view: today + the next 2 days at a glance. */
export function TodayView({ goTo }: { goTo: (tab: string) => void }) {
  const { data, memberById } = useApp()
  const { days: forecast } = useForecast()
  const today = todayKey()
  const daySpan = [today, addDays(today, 1), addDays(today, 2)]

  const openBoard = data.boardItems.filter((b) => b.status === 'open')

  return (
    <div className="today-page">
      <h2 className="today-title">{longDate(today)}</h2>

      {forecast && forecast[0] && (
        <button className="today-weather" onClick={() => goTo('weather')}>
          <span className="weather-emoji-sm">{weatherEmoji(forecast[0].summary)}</span>
          <span>
            <strong>{forecast[0].summary}</strong>
            {forecast[0].low !== undefined && ` · ${forecast[0].low}°–${forecast[0].high}°C`}
          </span>
          {forecast[0].reminders[0] && <span className="today-weather-reminder">{forecast[0].reminders[0]}</span>}
        </button>
      )}

      <div className="today-columns">
        {daySpan.map((date, i) => {
          const acts = activitiesOn(data.activities, date)
          const notes = data.dayNotes.filter((n) => n.date === date)
          const meals = data.menuEntries.filter((m) => m.date === date)
          const dayForecast = forecast?.[i]
          const boardDue = openBoard.filter((b) => b.forDate === date)

          return (
            <div key={date} className={`today-col ${i === 0 ? 'primary' : ''}`}>
              <div className="today-col-head">
                <h3>{relativeLabel(date)}</h3>
                {dayForecast && i > 0 && (
                  <span title={dayForecast.summary}>{weatherEmoji(dayForecast.summary)}</span>
                )}
              </div>

              <div className="today-section">
                <h4>🗓️ Activities</h4>
                {acts.length === 0 && <p className="hint">Nothing planned.</p>}
                {acts.map((a) => (
                  <div key={a.id} className="today-activity">
                    <span className="card-emoji">{a.emoji}</span>
                    <div className="today-activity-body">
                      <span className="card-title">{a.title}</span>
                      <span className="card-time">
                        {a.time ? prettyTime(a.time) : ''}
                        {a.endTime ? `–${prettyTime(a.endTime)}` : ''}
                        {a.location ? ` · 📍 ${a.location}` : ''}
                      </span>
                    </div>
                    <MemberChips memberIds={a.memberIds} size={20} />
                  </div>
                ))}
              </div>

              {(notes.length > 0) && (
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
                {meals.map((m) => {
                  const by = memberById(m.byMemberId)
                  return (
                    <div key={m.id} className="today-meal">
                      <span>{m.emoji}</span>
                      <span className="menu-entry-name">
                        <em>{m.slot}:</em> {m.dishName}
                      </span>
                      {by && <Avatar member={by} size={16} />}
                    </div>
                  )
                })}
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
