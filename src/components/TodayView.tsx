import { useRef, useState } from 'react'
import { useApp } from '../store'
import type { Activity, Member } from '../types'
import { activitiesOn, addDays, longDate, prettyTime, relativeLabel, todayKey, weekdayName } from '../utils/dates'
import { useForecast } from '../utils/useForecast'
import { weatherEmoji } from '../utils/weather'
import { t, getLang } from '../i18n'
import type { TKey } from '../i18n'
import { MemberChips, tagColor, EVERYONE_COLOR } from './shared'
import { MemberFace } from './avatars'
import { NoteChip } from './Timetable'
import { ActivityModal } from './ActivityModal'
import { FamilyBoard } from './FamilyBoard'

const PERIOD_KEYS = ['morning', 'afternoon', 'evening', 'overnight']
const DAYS_AHEAD = 7

function ActivityRow({ a, members, onEdit, onDelete }: { a: Activity; members: Member[]; onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div
      className={`today-activity v2 ${onEdit ? 'editable' : ''}`}
      style={{ borderLeft: `4px solid ${tagColor(a.memberIds, members)}` }}
      onClick={onEdit}
    >
      {onDelete && (
        <button
          className="icon-btn tiny act-x"
          title={t('remove')}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          ✕
        </button>
      )}
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

/** Landing view: one big day at a time — swipe or tap chips to move between days. */
export function TodayView({ goTo }: { goTo: (tab: string) => void }) {
  const { data, update, memberById, locked } = useApp()
  const { days: forecast, error, loading, refresh } = useForecast()
  const today = todayKey()
  const [offset, setOffset] = useState(0)
  const [editing, setEditing] = useState<{ activity: Activity | null; date: string } | null>(null)
  const touchX = useRef<number | null>(null)

  const date = addDays(today, offset)
  const chips = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i))
  const acts = activitiesOn(data.activities, date)
  const notes = data.dayNotes.filter((n) => n.date === date)
  const meals = data.menuEntries.filter((m) => m.date === date)
  const boardDue = data.boardItems.filter((b) => b.status === 'open' && b.forDate === date)
  const dayForecast = offset < 3 ? forecast?.[offset] : undefined

  const everyoneActs = acts.filter((a) => a.memberIds.length === 0)
  const memberActs = data.members
    .map((m) => ({ member: m, list: acts.filter((a) => a.memberIds.includes(m.id)) }))
    .filter((x) => x.list.length > 0)

  // ✕ on a card: one-offs are deleted; recurring activities just skip this day
  const removeFromDay = (a: Activity) => {
    update((d) => ({
      ...d,
      activities: a.recurrence
        ? d.activities.map((x) => (x.id === a.id ? { ...x, exceptions: [...x.exceptions, date] } : x))
        : d.activities.filter((x) => x.id !== a.id),
    }))
  }

  const swipeStart = (x: number) => {
    touchX.current = x
  }
  const swipeEnd = (x: number) => {
    if (touchX.current === null) return
    const dx = x - touchX.current
    touchX.current = null
    if (Math.abs(dx) < 60) return
    if (dx < 0) setOffset((o) => Math.min(o + 1, DAYS_AHEAD - 1))
    else setOffset((o) => Math.max(o - 1, 0))
  }

  return (
    <div className="today-page">
      <h2 className="today-title">🏡 {longDate(today)}</h2>

      <div className="day-chips">
        <button className="icon-btn" onClick={() => setOffset((o) => Math.max(o - 1, 0))} disabled={offset === 0}>
          ◀
        </button>
        {chips.map((d, i) => (
          <button
            key={d}
            className={`day-chip ${i === offset ? 'on' : ''}`}
            onClick={() => setOffset(i)}
          >
            <span className="day-chip-label">{i <= 1 ? relativeLabel(d) : weekdayName(d)}</span>
            <span className="day-chip-date">{d.slice(8)}/{d.slice(5, 7)}</span>
          </button>
        ))}
        <button
          className="icon-btn"
          onClick={() => setOffset((o) => Math.min(o + 1, DAYS_AHEAD - 1))}
          disabled={offset === DAYS_AHEAD - 1}
        >
          ▶
        </button>
      </div>

      <div
        className="today-single"
        onTouchStart={(e) => swipeStart(e.touches[0].clientX)}
        onTouchEnd={(e) => swipeEnd(e.changedTouches[0].clientX)}
      >
        <div className={`today-col primary single ${offset === 0 ? 'is-today' : ''}`}>
          <div className="today-col-head">
            <h3>
              {relativeLabel(date)} <span className="today-col-weekday">· {weekdayName(date)}</span>
            </h3>
            {!locked && (
              <div className="day-add-btns">
                <button className="btn primary" onClick={() => setEditing({ activity: null, date })}>
                  {t('addActivityBtn')}
                </button>
              </div>
            )}
          </div>

          {dayForecast && (
            <div className="weather-mini inline">
              <div className="weather-mini-top">
                <span className="weather-emoji-sm">{weatherEmoji(dayForecast.summary)}</span>
                {dayForecast.low !== undefined && dayForecast.high !== undefined && (
                  <span className="weather-mini-temp">{dayForecast.low}°–{dayForecast.high}°</span>
                )}
                <span className="weather-mini-summary-inline">{dayForecast.summary}</span>
              </div>
              {dayForecast.periods && dayForecast.periods.length > 0 && (
                <div className="weather-periods">
                  {dayForecast.periods.map((p) => (
                    <div key={p.label} className="weather-period">
                      <span className="weather-period-label">
                        {PERIOD_KEYS.includes(p.label) ? t(p.label as TKey) : p.label}
                      </span>
                      <span>{weatherEmoji(p.summary)}</span>
                      <span className="weather-period-text">{p.summary}</span>
                    </div>
                  ))}
                </div>
              )}
              {dayForecast.reminders[0] && (
                <div className="weather-reminder">{t(dayForecast.reminders[0] as TKey)}</div>
              )}
            </div>
          )}
          {!dayForecast && offset >= 3 && (
            <div className="weather-strip-note">{t('wxNotYet')}</div>
          )}
          {!forecast && offset < 3 && (
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

          {notes.length > 0 && (
            <div className="today-section notes-top">
              {notes.map((n) => (
                <NoteChip key={n.id} note={n} />
              ))}
            </div>
          )}

          {acts.length === 0 && (
            <div className="empty-day">
              <p className="hint big-hint">{t('nothingPlanned')} 🎈</p>
              {!locked && (
                <button className="btn subtle" onClick={() => setEditing({ activity: null, date })}>
                  {t('addActivityBtn')}
                </button>
              )}
            </div>
          )}
          {everyoneActs.length > 0 && (
            <div className="person-section" style={{ borderColor: EVERYONE_COLOR }}>
              <div className="person-head">
                <span className="person-everyone">🌈</span>
                <strong>{t('everyone')}</strong>
              </div>
              {everyoneActs.map((a) => (
                <ActivityRow
                  key={a.id}
                  a={a}
                  members={data.members}
                  onEdit={locked ? undefined : () => setEditing({ activity: a, date })}
                  onDelete={locked ? undefined : () => removeFromDay(a)}
                />
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
                <ActivityRow
                  key={a.id}
                  a={a}
                  members={data.members}
                  onEdit={locked ? undefined : () => setEditing({ activity: a, date })}
                  onDelete={locked ? undefined : () => removeFromDay(a)}
                />
              ))}
            </div>
          ))}

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
                <span className="menu-entry-name">
                  {getLang() === 'zh' ? (data.dishes.find((x) => x.name === m.dishName)?.nameZh || m.dishName) : m.dishName}
                </span>
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
