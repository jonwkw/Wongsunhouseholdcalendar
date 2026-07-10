import { useState } from 'react'
import type { DragEvent } from 'react'
import type { Activity, DayNote } from '../types'
import { useApp, uid } from '../store'
import {
  activitiesOn, addDays, mondayOf, prettyTime, todayKey, weekDays, fromKey, weekRangeLabel,
} from '../utils/dates'
import { t, dayShort } from '../i18n'
import { Legend, MemberChips, Modal, tagColor } from './shared'
import { ActivityModal } from './ActivityModal'
import { setDragPayload, getDragPayload, leavesTarget } from '../utils/dnd'

type DragPayload = { type: 'activity'; id: string }

export function Timetable() {
  const { data, update } = useApp()
  const today = todayKey()
  const [monday, setMonday] = useState(() => mondayOf(today))
  const [filterMember, setFilterMember] = useState<string>('all')
  const [editing, setEditing] = useState<{ activity: Activity | null; date: string; prefill?: Partial<Activity> } | null>(null)
  const [noteDay, setNoteDay] = useState<string | null>(null)
  const [view, setView] = useState<'week' | 'month'>('month')
  const [dragOverDay, setDragOverDay] = useState<string | null>(null)

  const weeksShown = view === 'week' ? 1 : 4
  const weeks = Array.from({ length: weeksShown }, (_, i) => weekDays(addDays(monday, i * 7)))

  const moveActivity = (id: string, date: string) => {
    update((d) => ({
      ...d,
      activities: d.activities.map((a) => (a.id === id && a.date ? { ...a, date } : a)),
    }))
  }

  const onDrop = (e: DragEvent, date: string) => {
    e.preventDefault()
    setDragOverDay(null)
    const payload = getDragPayload<DragPayload>(e)
    if (payload?.type === 'activity') moveActivity(payload.id, date)
  }

  const filtered = (date: string) =>
    activitiesOn(data.activities, date).filter(
      (a) => filterMember === 'all' || a.memberIds.length === 0 || a.memberIds.includes(filterMember),
    )

  return (
    <div className="timetable-page">
      <div className="timetable-main">
        <div className="week-nav">
          <div className="view-toggle">
            <button className={`btn ${view === 'week' ? 'primary' : 'subtle'}`} onClick={() => setView('week')}>
              {t('week')}
            </button>
            <button className={`btn ${view === 'month' ? 'primary' : 'subtle'}`} onClick={() => setView('month')}>
              {t('month')}
            </button>
          </div>
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, -28))} title="Back 4 weeks">
            ⏪
          </button>
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, -7))}>
            {t('prevWeek')}
          </button>
          <button className="btn subtle" onClick={() => setMonday(mondayOf(today))}>
            {t('thisWeek')}
          </button>
          <input
            type="date"
            className="jump-date"
            value={weeks[0][0]}
            onChange={(e) => e.target.value && setMonday(mondayOf(e.target.value))}
            title="Jump to any date, past or future"
          />
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, 7))}>
            {t('nextWeek')}
          </button>
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, 28))} title="Forward 4 weeks">
            ⏩
          </button>
        </div>

        <div className="filter-row">
          <span className="hint" style={{ margin: 0 }}>{t('show')}</span>
          <button className={`filter-btn ${filterMember === 'all' ? 'on' : ''}`} onClick={() => setFilterMember('all')}>
            {t('everyone')}
          </button>
          {data.members.map((m) => (
            <button
              key={m.id}
              className={`filter-btn ${filterMember === m.id ? 'on' : ''}`}
              style={filterMember === m.id ? { borderColor: m.color, background: m.color + '22' } : undefined}
              onClick={() => setFilterMember(m.id)}
            >
              {m.name}
            </button>
          ))}
        </div>

        <Legend />

        {weeks.map((days) => {
          const isCurrentWeek = days.includes(today)
          return (
            <div key={days[0]} className={`week-block ${isCurrentWeek ? 'current' : ''}`}>
              <div className="week-block-label">
                {isCurrentWeek && <span className="today-tag">{t('thisWeek')}</span>}
                <span>{weekRangeLabel(days)}</span>
              </div>
              <div className="week-grid">
                {days.map((date) => {
                  const acts = filtered(date)
                  const notes = data.dayNotes.filter((n) => n.date === date)
                  const d = fromKey(date)
                  return (
                    <div
                      key={date}
                      className={`day-col ${date === today ? 'today' : ''} ${dragOverDay === date ? 'drag-over' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'copy'
                        setDragOverDay(date)
                      }}
                      onDragLeave={(e) => {
                        if (leavesTarget(e)) setDragOverDay((cur) => (cur === date ? null : cur))
                      }}
                      onDrop={(e) => onDrop(e, date)}
                    >
                      <div className="day-head">
                        <span className="day-name">{dayShort(d.getDay())}</span>
                        <span className="day-num">{d.getDate()}</span>
                        {date === today && <span className="today-tag">{t('today')}</span>}
                      </div>

                      {acts.map((a) => (
                        <div
                          key={a.id}
                          className="activity-card"
                          style={{ borderLeft: `4px solid ${tagColor(a.memberIds, data.members)}` }}
                          draggable={Boolean(a.date)}
                          title={a.date ? 'Click to edit · drag to another day' : 'Click to edit'}
                          onDragStart={(e) => {
                            e.stopPropagation()
                            setDragPayload(e, { type: 'activity', id: a.id })
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditing({ activity: a, date })
                          }}
                        >
                          <div className="activity-top">
                            {a.emoji && <span className="card-emoji">{a.emoji}</span>}
                            <span className="card-title">{a.title}</span>
                          </div>
                          <div className="activity-meta">
                            {a.time && (
                              <span className="card-time">
                                {prettyTime(a.time)}
                                {a.endTime ? `–${prettyTime(a.endTime)}` : ''}
                              </span>
                            )}
                            <MemberChips memberIds={a.memberIds} everyone />
                          </div>
                          {a.location && <div className="activity-loc">📍 {a.location}</div>}
                          {a.notes && <div className="activity-notes">📝 {a.notes}</div>}
                        </div>
                      ))}

                      {notes.map((n) => (
                        <NoteChip key={n.id} note={n} />
                      ))}

                      <div className="day-actions">
                        <button className="btn ghost" onClick={() => setEditing({ activity: null, date })}>
                          {t('addActivityBtn')}
                        </button>
                        <button className="btn ghost" onClick={() => setNoteDay(date)}>
                          {t('addNoteBtn')}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <ActivityModal
          activity={editing.activity}
          date={editing.date}
          prefill={editing.prefill}
          onClose={() => setEditing(null)}
        />
      )}
      {noteDay && <NoteModal date={noteDay} onClose={() => setNoteDay(null)} />}
    </div>
  )
}

export function NoteChip({ note }: { note: DayNote }) {
  const { update, memberById } = useApp()
  const member = memberById(note.memberId)
  return (
    <div className={`note-chip ${note.kind} ${note.done ? 'done' : ''}`}>
      {note.kind === 'reminder' ? (
        <input
          type="checkbox"
          checked={note.done}
          onChange={() =>
            update((d) => ({
              ...d,
              dayNotes: d.dayNotes.map((n) => (n.id === note.id ? { ...n, done: !n.done } : n)),
            }))
          }
        />
      ) : (
        <span>💬</span>
      )}
      <span className="note-text">{note.text}</span>
      {member && (
        <span className="name-pill" style={{ borderColor: member.color, background: member.color + '1e', color: member.color }}>
          {member.name}
        </span>
      )}
      <button
        className="icon-btn tiny"
        onClick={() => update((d) => ({ ...d, dayNotes: d.dayNotes.filter((n) => n.id !== note.id) }))}
      >
        ✕
      </button>
    </div>
  )
}

function NoteModal({ date, onClose }: { date: string; onClose: () => void }) {
  const { data, update } = useApp()
  const [text, setText] = useState('')
  const [kind, setKind] = useState<'note' | 'reminder'>('reminder')
  const [when, setWhen] = useState(date)
  const [memberId, setMemberId] = useState('')

  const save = () => {
    if (!text.trim()) return
    update((d) => ({
      ...d,
      dayNotes: [
        ...d.dayNotes,
        { id: uid('n'), date: when, text: text.trim(), kind, memberId: memberId || undefined, done: false },
      ],
    }))
    onClose()
  }

  return (
    <Modal title={t('addNoteTitle')} onClose={onClose}>
      <div className="form">
        <div className="kind-toggle">
          <button className={`btn ${kind === 'reminder' ? 'primary' : 'subtle'}`} onClick={() => setKind('reminder')}>
            {t('reminderBtn')}
          </button>
          <button className={`btn ${kind === 'note' ? 'primary' : 'subtle'}`} onClick={() => setKind('note')}>
            {t('noteBtn')}
          </button>
        </div>
        <label>
          {kind === 'reminder' ? t('whatRemember') : t('whatSay')}
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={kind === 'reminder' ? t('remExample') : t('noteExample')}
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
        </label>
        <label>
          {t('whichDayQ')}
          <input type="date" value={when} onChange={(e) => setWhen(e.target.value)} />
        </label>
        <label>
          {t('aboutWho')}
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="">{t('nobody')}</option>
            {data.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <div className="form-actions">
          <span className="spacer" />
          <button className="btn primary" onClick={save} disabled={!text.trim()}>
            {t('save')}
          </button>
        </div>
      </div>
    </Modal>
  )
}

