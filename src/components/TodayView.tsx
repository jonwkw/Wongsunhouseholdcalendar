import { useState } from 'react'
import { useApp } from '../store'
import type { Activity, Member } from '../types'
import { activitiesOn, addDays, longDate, prettyTime, relativeLabel, todayKey, weekdayName } from '../utils/dates'
import { useForecast } from '../utils/useForecast'
import { weatherEmoji } from '../utils/weather'
import { t } from '../i18n'
import type { TKey } from '../i18n'
import { MemberChips, tagColor, EVERYONE_COLOR } from './shared'
import { MemberFace } from './avatars'
import { NoteChip } from './Timetable'
import { ActivityModal } from './ActivityModal'
import { FamilyBoard } from './FamilyBoard'

const PERIOD_KEYS = ['morning', 'afternoon', 'evening', 'overnight']

function ActivityRow({ a, members, onEdit }: { a: Activity; members: Member[]; onEdit?: () => void }) {
  return (
    <div
      className={`today-activity v2 ${onEdit ? 'editable' : ''}`}
      style={{ borderLeft: `4px solid ${tagColor(a.memberIds, members)}` }}
      onClick={onEdit}
    >
      {a.time && (
        <div className="time-big">
          {prettyTime(a.time)}
          {a.endTime ? ` – ${prettyTime(a.endTime)}` : ''}
        </div>
      )}
      <div className="today-activity-main">
        {a.emoji && <span className="card-emoji">{a.emoji}</span>}
        <span className="card-title">{a.title}</span>
      </div>
      {(a.location || a.notes) && (
        <div className="today-activity-extra">
          {a.location && <span>📍 {a.location}</span>}
          {a.notes && <span>📝 {a.notes}</span>}
        </div>
      )}
    </div>
  )
}

/** Default landing view: weather, a big Today, smaller next two days, and reminders. */
export function TodayView({ goTo }: { goTo: (tab: string) => void }) {
  const { data, memberById, locked } = useApp()
  const { days: forecast, error, loading, refresh } = useForecast()
  const today = todayKey()
  const daySpan = [today, addDays(today, 1), addDays(today, 2)]
  const [editing, setEditing] = useState<{ activity: Activity; date: string } | null>(null)

  return (
    <div className="today-page">
      <h2 className="today-title">🏡 {longDate(today)}</h2>

      {forecast ? (
        <div className="weather-strip three">
          {forecast.slice(0, 3).map((d, i) => (
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
          const isMain = i === 0

          // On the big Today column, group activities by person
          const everyoneActs = acts.filter((a) => a.memberIds.length === 0)
          const memberActs = data.members
            .map((m) => ({ member: m, list: acts.filter((a) => a.memberIds.includes(m.id)) }))
            .filter((x) => x.list.length > 0)

          return (
            <div key={date} className={`today-col ${isMain ? 'primary' : 'mini'}`}>
              <div className="today-col-head">
                <h3>
                  {relativeLabel(date)} <span className="today-col-weekday">· {weekdayName(date)}</span>
                </h3>
              </div>

              {notes.length > 0 && (
                <div className="today-section notes-top">
                  {notes.map((n) => (
                    <NoteChip key={n.id} note={n} />
                  ))}
                </div>
              )}

              {isMain ? (
                <>
                  {acts.length === 0 && <p className="hint">{t('nothingPlanned')} 🎈</p>}
                  {everyoneActs.length > 0 && (
                    <div className="person-section" style={{ borderColor: EVERYONE_COLOR }}>
                      <div className="person-head">
                        <span className="person-everyone">🌈</span>
                        <strong>{t('everyone')}</strong>
                      </div>
                      {everyoneActs.map((a) => (
                        <ActivityRow key={a.id} a={a} members={data.members} onEdit={locked ? undefined : () => setEditing({ activity: a, date })} />
                      ))}
                    </div>
                  )}
                  {memberActs.map(({ member, list }) => (
                    <div key={member.id} className="person-section" style={{ borderColor: member.color }}>
                      <div className="person-head">
                        <MemberFace member={member} size={30} />
                        <strong>{member.name}</strong>
                      </div>
                      {list.map((a) => (
                        <ActivityRow key={a.id} a={a} members={data.members} onEdit={locked ? undefined : () => setEditing({ activity: a, date })} />
                      ))}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {acts.length === 0 && <p className="hint">{t('nothingPlanned')}</p>}
                  {acts.map((a) => (
                    <div
                      key={a.id}
                      className={`today-activity mini ${locked ? '' : 'editable'}`}
                      style={{ borderLeft: `4px solid ${tagColor(a.memberIds, data.members)}`, paddingLeft: 8 }}
                      onClick={locked ? undefined : () => setEditing({ activity: a, date })}
                    >
                      {a.time && <div className="time-big small">{prettyTime(a.time)}</div>}
                      <div className="today-activity-body">
                        <span className="card-title">{a.emoji ? `${a.emoji} ` : ''}{a.title}</span>
                        <MemberChips memberIds={a.memberIds} everyone />
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div className="today-section">
                <h4>{t('menuHeading')}</h4>
                {meals.length === 0 && (
                  <p className="hint">
                    {t('notPlannedYet')} <button className="linklike" onClick={() => goTo('menu')}>{t('addToMenuLink')}</button>
                  </p>
                )}
                {meals.map((m) => (
                  <div key={m.id} className="today-meal" style={{ borderLeft: `4px solid ${tagColor(m.memberIds, data.members)}`, paddingLeft: 8 }}>
                    <span>{m.emoji}</span>
                    <span className="menu-entry-name">{m.dishName}</span>
                    <MemberChips memberIds={m.memberIds} />
                  </div>
                ))}
              </div>

              {boardDue.length > 0 && (
                <div className="today-section">
                  {boardDue.map((b) => {
                    const assigned = memberById(b.assignedToId)
                    return (
                      <div key={b.id} className="today-board-item">
                        📌 {b.text}
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

      {editing && (
        <ActivityModal activity={editing.activity} date={editing.date} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
