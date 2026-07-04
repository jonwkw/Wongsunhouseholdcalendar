import { useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import type { Activity, ActivityTemplate, DayNote } from '../types'
import { useApp, uid } from '../store'
import {
  activitiesOn, addDays, mondayOf, prettyTime, todayKey, weekDays, fromKey, MONTH_SHORT,
} from '../utils/dates'
import { Avatar, MemberChips, MemberToggle, Modal, EmojiPicker } from './shared'
import { ActivityModal } from './ActivityModal'

type DragPayload = { type: 'template'; id: string } | { type: 'activity'; id: string }

export function Timetable() {
  const { data, update } = useApp()
  const today = todayKey()
  const [monday, setMonday] = useState(() => mondayOf(today))
  const [filterMember, setFilterMember] = useState<string>('all')
  const [editing, setEditing] = useState<{ activity: Activity | null; date: string; prefill?: Partial<Activity> } | null>(null)
  const [noteDay, setNoteDay] = useState<string | null>(null)
  const [armedTemplate, setArmedTemplate] = useState<string | null>(null)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [dragOverDay, setDragOverDay] = useState<string | null>(null)

  const days = useMemo(() => weekDays(monday), [monday])
  const maxMonday = mondayOf(addDays(today, 365))
  const minMonday = mondayOf(addDays(today, -90))

  const placeTemplate = (t: ActivityTemplate, date: string) => {
    update((d) => ({
      ...d,
      activities: [
        ...d.activities,
        {
          id: uid('a'),
          title: t.title,
          emoji: t.emoji,
          memberIds: t.memberIds,
          date,
          time: t.time,
          endTime: t.endTime,
          location: t.location,
          exceptions: [],
        },
      ],
    }))
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
    try {
      const payload = JSON.parse(e.dataTransfer.getData('application/json')) as DragPayload
      if (payload.type === 'template') {
        const t = data.activityTemplates.find((x) => x.id === payload.id)
        if (t) placeTemplate(t, date)
      } else {
        moveActivity(payload.id, date)
      }
    } catch {
      // ignore malformed drops
    }
  }

  const onDayClick = (date: string) => {
    if (armedTemplate) {
      const t = data.activityTemplates.find((x) => x.id === armedTemplate)
      if (t) placeTemplate(t, date)
      setArmedTemplate(null)
    }
  }

  const weekLabel = () => {
    const start = fromKey(days[0])
    const end = fromKey(days[6])
    const sameMonth = start.getMonth() === end.getMonth()
    return sameMonth
      ? `${start.getDate()}–${end.getDate()} ${MONTH_SHORT[end.getMonth()]} ${end.getFullYear()}`
      : `${start.getDate()} ${MONTH_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTH_SHORT[end.getMonth()]} ${end.getFullYear()}`
  }

  return (
    <div className="timetable-layout">
      <aside className="library">
        <h3>🧩 Activity library</h3>
        <p className="hint">Drag a card onto a day — or tap it, then tap a day.</p>
        {data.activityTemplates.map((t) => (
          <div
            key={t.id}
            className={`library-card ${armedTemplate === t.id ? 'armed' : ''}`}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData('application/json', JSON.stringify({ type: 'template', id: t.id }))
            }
            onClick={() => setArmedTemplate(armedTemplate === t.id ? null : t.id)}
          >
            <span className="card-emoji">{t.emoji}</span>
            <span className="card-title">{t.title}</span>
            <MemberChips memberIds={t.memberIds} size={18} />
            {t.time && <span className="card-time">{prettyTime(t.time)}</span>}
            <button
              className="icon-btn tiny"
              title="Remove from library"
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
          ＋ New library card
        </button>
        {armedTemplate && (
          <p className="armed-hint">👉 Now tap a day to place it (tap card again to cancel)</p>
        )}
      </aside>

      <div className="timetable-main">
        <div className="week-nav">
          <button className="btn subtle" onClick={() => setMonday((m) => (addDays(m, -7) >= minMonday ? addDays(m, -7) : m))}>
            ← Prev
          </button>
          <button className="btn subtle" onClick={() => setMonday(mondayOf(today))}>
            This week
          </button>
          <strong className="week-label">{weekLabel()}</strong>
          <input
            type="date"
            className="jump-date"
            value={days[0]}
            min={addDays(today, -90)}
            max={addDays(today, 365)}
            onChange={(e) => e.target.value && setMonday(mondayOf(e.target.value))}
            title="Jump to a date (up to one year ahead)"
          />
          <button className="btn subtle" onClick={() => setMonday((m) => (addDays(m, 7) <= maxMonday ? addDays(m, 7) : m))}>
            Next →
          </button>
        </div>

        <div className="filter-row">
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
              {m.emoji} {m.name}
            </button>
          ))}
        </div>

        <div className="week-grid">
          {days.map((date) => {
            const acts = activitiesOn(data.activities, date).filter(
              (a) => filterMember === 'all' || a.memberIds.includes(filterMember),
            )
            const notes = data.dayNotes.filter((n) => n.date === date)
            const d = fromKey(date)
            return (
              <div
                key={date}
                className={`day-col ${date === today ? 'today' : ''} ${dragOverDay === date ? 'drag-over' : ''} ${armedTemplate ? 'placeable' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverDay(date)
                }}
                onDragLeave={() => setDragOverDay((cur) => (cur === date ? null : cur))}
                onDrop={(e) => onDrop(e, date)}
                onClick={() => onDayClick(date)}
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
                    draggable={Boolean(a.date)}
                    onDragStart={(e) => {
                      e.stopPropagation()
                      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'activity', id: a.id }))
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
                      <MemberChips memberIds={a.memberIds} size={18} />
                    </div>
                    {a.location && <div className="activity-loc">📍 {a.location}</div>}
                  </div>
                ))}

                {notes.map((n) => (
                  <NoteChip key={n.id} note={n} />
                ))}

                <div className="day-actions">
                  <button
                    className="btn ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditing({ activity: null, date })
                    }}
                  >
                    ＋ Activity
                  </button>
                  <button
                    className="btn ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      setNoteDay(date)
                    }}
                  >
                    📝 Note
                  </button>
                </div>
              </div>
            )
          })}
        </div>
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
      {member && <Avatar member={member} size={16} />}
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
  const { update, currentMember } = useApp()
  const [text, setText] = useState('')
  const [kind, setKind] = useState<'note' | 'reminder'>('reminder')
  const [when, setWhen] = useState(date)

  const save = () => {
    if (!text.trim()) return
    update((d) => ({
      ...d,
      dayNotes: [
        ...d.dayNotes,
        { id: uid('n'), date: when, text: text.trim(), kind, memberId: currentMember?.id, done: false },
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

  const save = () => {
    if (!title.trim()) return
    update((d) => ({
      ...d,
      activityTemplates: [
        ...d.activityTemplates,
        { id: uid('t'), title: title.trim(), emoji, memberIds, time: time || undefined },
      ],
    }))
    onClose()
  }

  return (
    <Modal title="New library card" onClose={onClose}>
      <div className="form">
        <label>
          Activity name
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Piano lesson" />
        </label>
        <label>Icon</label>
        <EmojiPicker value={emoji} onChange={setEmoji} />
        <label>Usually for</label>
        <MemberToggle selected={memberIds} onChange={setMemberIds} />
        <label>
          Usual start time (optional)
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <div className="form-actions">
          <span className="spacer" />
          <button className="btn primary" onClick={save} disabled={!title.trim()}>
            Add to library
          </button>
        </div>
      </div>
    </Modal>
  )
}
