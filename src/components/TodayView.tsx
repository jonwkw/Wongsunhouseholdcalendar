import { useApp } from '../store'
import { activitiesOn, addDays, longDate, prettyTime, relativeLabel, todayKey, weekdayName } from '../utils/dates'
import { useForecast } from '../utils/useForecast'
import { weatherEmoji } from '../utils/weather'
import { t } from '../i18n'
import type { TKey } from '../i18n'
import { Legend, MemberChips, tagColor } from './shared'
import { NoteChip } from './Timetable'
import { FamilyBoard } from './FamilyBoard'

const PERIOD_KEYS = ['morning', 'afternoon', 'evening', 'overnight']

/** Default landing view: weather, today + the next 2 days, and the family board. */
export function TodayView({ goTo }: { goTo: (tab: string) => void }) {
  const { data, memberById } = useApp()
  const { days: forecast, error, loading, refresh } = useForecast()
  const today = todayKey()
  const daySpan = [today, addDays(today, 1), addDays(today, 2)]

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
                <strong>{i === 0 ? t('today') : d.dayLabel}</strong>
                <span className="weather-emoji-sm">{weatherEmoji(d.summary)}</span>
                {d.low !== undefined && d.high !== undefined && (
                  <span className="weather-mini-temp">{d.low}°–{d.high}°</span>
                )}
              </div>
              {d.periods && d.periods.length > 0 ? (
                <div className="weather-periods">
                  {d.periods.map((p) => (
                    <div key={p.label} className="weather-period">
                      <span className="weather-period-label">
                        {PERIOD_KEYS.includes(p.label) ? t(p.label as TKey) : p.label}
                      </span>
                      <span>{weatherEmoji(p.summary)}</span>
                      <span className="weather-period-text">{p.summary}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="weather-mini-summary">{d.summary}</div>
              )}
              {d.reminders[0] && <div className="weather-reminder">{t(d.reminders[0] as TKey)}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="weather-strip-note">
          {loading ? (
            t('loadingWeather')
          ) : (
            <>
              {t('weatherUnavailable')}{error ? ` (${error})` : ''}.{' '}
              <button className="linklike" onClick={() => refresh(true)}>{t('tryAgain')}</button>
            </>
          )}
        </div>
      )}

      <div className="today-columns">
        {daySpan.map((date, i) => {
          const acts = activitiesOn(data.activities, date)
          const notes = data.dayNotes.filter((n) => n.date === date)
          const meals = data.menuEntries.filter((m) => m.date === date)
          const boardDue = data.boardItems.filter((b) => b.status === 'open' && b.forDate === date)

          return (
            <div key={date} className={`today-col ${i === 0 ? 'primary' : ''}`}>
              <div className="today-col-head">
                <div>
                  <h3>{relativeLabel(date)}</h3>
                  <span className="today-col-weekday">{weekdayName(date)}</span>
                </div>
              </div>

              <div className="today-section">
                <h4>{t('activities')}</h4>
                {acts.length === 0 && <p className="hint">{t('nothingPlanned')}</p>}
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
                      {a.notes && <span className="card-time">📝 {a.notes}</span>}
                    </div>
                    <MemberChips memberIds={a.memberIds} everyone />
                  </div>
                ))}
              </div>

              {notes.length > 0 && (
                <div className="today-section">
                  <h4>{t('notesReminders')}</h4>
                  {notes.map((n) => (
                    <NoteChip key={n.id} note={n} />
                  ))}
                </div>
              )}

              <div className="today-section">
                <h4>{t('menuHeading')}</h4>
                {meals.length === 0 && (
                  <p className="hint">
                    {t('notPlannedYet')} <button className="linklike" onClick={() => goTo('menu')}>{t('addToMenuLink')}</button>
                  </p>
                )}
                {meals.map((m) => (
                  <div
                    key={m.id}
                    className="today-meal"
                    style={{ borderLeft: `4px solid ${tagColor(m.memberIds, data.members)}`, paddingLeft: 8 }}
                  >
                    <span>{m.emoji}</span>
                    <span className="menu-entry-name">{m.dishName}</span>
                    <MemberChips memberIds={m.memberIds} />
                  </div>
                ))}
              </div>

              {boardDue.length > 0 && (
                <div className="today-section">
                  <h4>{t('dueFromBoard')}</h4>
                  {boardDue.map((b) => {
                    const assigned = memberById(b.assignedToId)
                    return (
                      <div key={b.id} className="today-board-item">
                        {b.kind === 'request' ? '🙋' : '📌'} {b.text}
                        {assigned && (
                          <span className="name-pill" style={{ borderColor: assigned.color, background: assigned.color + '1e', color: assigned.color }}>
                            {assigned.name}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="today-board">
        <FamilyBoard />
      </div>
    </div>
  )
}
