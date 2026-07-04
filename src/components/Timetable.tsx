import { useState } from 'react'
import type { DragEvent } from 'react'
import type { Activity, ActivityTemplate, DayNote } from '../types'
import { useApp, uid } from '../store'
import {
  activitiesOn, addDays, mondayOf, prettyTime, todayKey, weekDays, fromKey, MONTH_SHORT,
} from '../utils/dates'
import { Legend, MemberChips, MemberToggle, Modal, EmojiPicker, tagColor } from './shared'
import { ActivityModal } from './ActivityModal'
import { setDragPayload, getDragPayload, leavesTarget } from '../utils/dnd'

type DragPayload = { type: 'template'; id: string } | { type: 'activity'; id: string }

const WEEKS_SHOWN = 4

export function Timetable() {
  const { data, update } = useApp()
  const today = todayKey()
  const [monday, setMonday] = useState(() => mondayOf(today))
  const [filterMember, setFilterMember] = useState<string>('all')
  const [editing, setEditing] = useState<{ activity: Activity | null; date: string; prefill?: Partial<Activity> } | null>(null)
  const [noteDay, setNoteDay] = useState<string | null>(null)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [dragOverDay, setDragOverDay] = useState<string | null>(null)

  const weeks = Array.from({ length: WEEKS_SHOWN }, (_, i) => weekDays(addDays(monday, i * 7)))

  /** Clicking or dropping a card opens the same full form as adding on a day */
  const placeTemplate = (t: ActivityTemplate, date: string) => {
    setEditing({
      activity: null,
      date,
      prefill: {
        title: t.title,
        emoji: t.emoji,
        memberIds: t.memberIds,
        time: t.time,
        endTime: t.endTime,
        location: t.location,
      },
    })
  }

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
    if (!payload) return
    if (payload.type === 'template') {
      const t = data.activityTemplates.find((x) => x.id === payload.id)
      if (t) placeTemplate(t, date)
    } else {
      moveActivity(payload.id, date)
    }
  }

  const rangeLabel = (days: string[]) => {
    const start = fromKey(days[0])
    const end = fromKey(days[6])
    const sameMonth = start.getMonth() === end.getMonth()
    return sameMonth
      ? `${start.getDate()}–${end.getDate()} ${MONTH_SHORT[end.getMonth()]} ${end.getFullYear()}`
      : `${start.getDate()} ${MONTH_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTH_SHORT[end.getMonth()]} ${end.getFullYear()}`
  }

  const filtered = (date: string) =>
    activitiesOn(data.activities, date).filter(
      (a) => filterMember === 'all' || a.memberIds.length === 0 || a.memberIds.includes(filterMember),
    )

  return (
    <div className="timetable-layout">
      <aside className="library">
        <h3>🧩 Activity cards</h3>
        <p className="hint">Click a card to add that activity (you pick the day and repeat in the form) — or drag it straight onto a day.</p>
        {data.activityTemplates.map((t) => (
          <div
            key={t.id}
            className="library-card"
            style={{ borderLeft: `4px solid ${tagColor(t.memberIds, data.members)}` }}
            draggable
            onDragStart={(e) => setDragPayload(e, { type: 'template', id: t.id })}
            onClick={() => placeTemplate(t, today)}
            title="Click to add this activity"
          >
            <span className="card-emoji">{t.emoji}</span>
            <span className="card-title">{t.title}</span>
            {t.time && <span className="card-time">{prettyTime(t.time)}</span>}
            <button
              className="icon-btn tiny"
              title="Remove this card"
              onClick={(e) => {
                e.stopPropagation()
                update((d) => ({ ...d, activityTemplates: d.activityTemplates.filter((x) => x.id !== t.id) }))
              }}
            >
              ✕
            </button>
          </div>
        ))}
        <button className="btn subtle full" onClick={() => setShowTemplateForm(true)}>
          ＋ New activity card
        </button>
      </aside>

      <div className="timetable-main">
        <div className="week-nav">
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, -28))} title="Back 4 weeks">
            ⏪
          </button>
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, -7))}>
            ← Prev week
          </button>
          <button className="btn subtle" onClick={() => setMonday(mondayOf(today))}>
            This week
          </button>
          <input
            type="date"
            className="jump-date"
            value={weeks[0][0]}
            onChange={(e) => e.target.value && setMonday(mondayOf(e.target.value))}
            title="Jump to any date, past or future"
          />
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, 7))}>
            Next week →
          </button>
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, 28))} title="Forward 4 weeks">
            ⏩
          </button>
        </div>

        <div className="filter-row">
          <span className="hint" style={{ margin: 0 }}>Show:</span>
          <button className={`filter-btn ${filterMember === 'all' ? 'on' : ''}`} onClick={() => setFilterMember('all')}>
            Everyone
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
                {isCurrentWeek && <span className="today-tag">This week</span>}
                <span>{rangeLabel(days)}</span>
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
                        <span className="day-name">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}</span>
                        <span className="day-num">{d.getDate()}</span>
                        {date === today && <span className="today-tag">Today</span>}
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
                            <span className="card-emoji">{a.emoji}</span>
                            <span className="card-title">{a.title}</span>
                            {a.recurrence && <span title="Repeats weekly">🔁</span>}
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
                        <button
                          className="btn ghost"
                          title="Add an activity on this day"
                          onClick={() => setEditing({ activity: null, date })}
                        >
                          ＋ Activity
                        </button>
                        <button
                          className="btn ghost"
                          title="Add a note or reminder on this day"
                          onClick={() => setNoteDay(date)}
                        >
                          📝 Note
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
      {showTemplateForm && <TemplateModal onClose={() => setShowTemplateForm(false)} />}
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
    <Modal title="Add a note or reminder" onClose={onClose}>
      <div className="form">
        <div className="kind-toggle">
          <button className={`btn ${kind === 'reminder' ? 'primary' : 'subtle'}`} onClick={() => setKind('reminder')}>
            ⏰ Reminder
          </button>
          <button className={`btn ${kind === 'note' ? 'primary' : 'subtle'}`} onClick={() => setKind('note')}>
            💬 Note
          </button>
        </div>
        <label>
          {kind === 'reminder' ? 'What should we remember?' : 'What do you want to say?'}
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={kind === 'reminder' ? 'e.g. Pack water bottle' : 'e.g. Half day at school'}
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
        </label>
        <label>
          Which day?
          <input type="date" value={when} onChange={(e) => setWhen(e.target.value)} />
        </label>
        <label>
          Who is it about? (optional)
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="">— nobody in particular —</option>
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
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}

function TemplateModal({ onClose }: { onClose: () => void }) {
  const { update } = useApp()
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('📚')
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [time, setTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')

  const save = () => {
    if (!title.trim()) return
    update((d) => ({
      ...d,
      activityTemplates: [
        ...d.activityTemplates,
        {
          id: uid('t'),
          title: title.trim(),
          emoji,
          memberIds,
          time: time || undefined,
          endTime: endTime || undefined,
          location: location.trim() || undefined,
        },
      ],
    }))
    onClose()
  }

  return (
    <Modal title="New activity card" onClose={onClose}>
      <div className="form">
        <label>
          Activity name
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Piano lesson" />
        </label>
        <label>Icon</label>
        <EmojiPicker value={emoji} onChange={setEmoji} />
        <label>Usually for</label>
        <MemberToggle selected={memberIds} onChange={setMemberIds} />
        <div className="form-row">
          <label>
            Usual start (optional)
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
          <label>
            Usual end (optional)
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </label>
        </div>
        <label>
          Usual place (optional)
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </label>
        <div className="form-actions">
          <span className="spacer" />
          <button className="btn primary" onClick={save} disabled={!title.trim()}>
            Save card
          </button>
        </div>
      </div>
    </Modal>
  )
}
