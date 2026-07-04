import { useEffect, useRef, useState } from 'react'
import type { BoardItem } from '../types'
import { useApp, uid } from '../store'
import { prettyDate, todayKey } from '../utils/dates'

export function FamilyBoard() {
  const { data, update, memberById } = useApp()
  const [kind, setKind] = useState<'request' | 'reminder'>('request')
  const [text, setText] = useState('')
  const [forDate, setForDate] = useState('')
  const [byMemberId, setByMemberId] = useState('')
  const [assignedToId, setAssignedToId] = useState('')
  const [showDone, setShowDone] = useState(false)
  const [lastDeleted, setLastDeleted] = useState<BoardItem | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (undoTimer.current) clearTimeout(undoTimer.current)
  }, [])

  const add = () => {
    if (!text.trim()) return
    const item: BoardItem = {
      id: uid('b'),
      kind,
      text: text.trim(),
      byMemberId,
      assignedToId: assignedToId || undefined,
      forDate: forDate || undefined,
      status: 'open',
      createdAt: todayKey(),
    }
    update((d) => ({ ...d, boardItems: [item, ...d.boardItems] }))
    setText('')
    setForDate('')
    setAssignedToId('')
  }

  const toggle = (id: string) =>
    update((d) => ({
      ...d,
      boardItems: d.boardItems.map((b) =>
        b.id === id ? { ...b, status: b.status === 'open' ? 'done' : 'open' } : b,
      ),
    }))

  const remove = (item: BoardItem) => {
    update((d) => ({ ...d, boardItems: d.boardItems.filter((b) => b.id !== item.id) }))
    setLastDeleted(item)
    if (undoTimer.current) clearTimeout(undoTimer.current)
    undoTimer.current = setTimeout(() => setLastDeleted(null), 8000)
  }

  const undoDelete = () => {
    if (!lastDeleted) return
    const item = lastDeleted
    update((d) => ({ ...d, boardItems: [item, ...d.boardItems] }))
    setLastDeleted(null)
    if (undoTimer.current) clearTimeout(undoTimer.current)
  }

  const reply = (id: string) => {
    const current = data.boardItems.find((b) => b.id === id)
    const answer = window.prompt('Reply:', current?.reply ?? '')
    if (answer === null) return
    update((d) => ({
      ...d,
      boardItems: d.boardItems.map((b) => (b.id === id ? { ...b, reply: answer.trim() || undefined } : b)),
    }))
  }

  const pill = (memberId?: string) => {
    const m = memberById(memberId)
    if (!m) return null
    return (
      <span className="name-pill" style={{ borderColor: m.color, background: m.color + '1e', color: m.color }}>
        {m.name}
      </span>
    )
  }

  const visible = data.boardItems.filter((b) => showDone || b.status === 'open')
  const requests = visible.filter((b) => b.kind === 'request')
  const reminders = visible.filter((b) => b.kind === 'reminder')

  const renderItem = (b: BoardItem) => (
    <div key={b.id} className={`board-item ${b.status}`}>
      <input type="checkbox" checked={b.status === 'done'} onChange={() => toggle(b.id)} title="Mark done" />
      <div className="board-body">
        <div className="board-text">{b.text}</div>
        <div className="board-meta">
          {b.byMemberId && (
            <span className="board-who">
              {b.kind === 'request' ? 'Requested by' : 'Added by'} {pill(b.byMemberId)}
            </span>
          )}
          {b.assignedToId && (
            <span className="board-who">→ Assigned to {pill(b.assignedToId)}</span>
          )}
          {b.forDate && <span className="board-date">📅 {prettyDate(b.forDate)}</span>}
        </div>
        {b.reply && <div className="board-reply">↩️ {b.reply}</div>}
      </div>
      <button className="icon-btn tiny" title="Reply" onClick={() => reply(b.id)}>💬</button>
      <button className="icon-btn tiny" title="Delete" onClick={() => remove(b)}>✕</button>
    </div>
  )

  return (
    <div className="board-page">
      <div className="page-head">
        <h2>📌 Requests &amp; Reminders</h2>
        <label className="check-row">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
          Show completed
        </label>
      </div>

      <div className="board-form">
        <div className="kind-toggle">
          <button className={`btn ${kind === 'request' ? 'primary' : 'subtle'}`} onClick={() => setKind('request')}>
            🙋 Request
          </button>
          <button className={`btn ${kind === 'reminder' ? 'primary' : 'subtle'}`} onClick={() => setKind('reminder')}>
            📌 Reminder
          </button>
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={kind === 'request' ? 'e.g. Can we add mee goreng to the menu?' : 'e.g. Clean the balcony'}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <select value={byMemberId} onChange={(e) => setByMemberId(e.target.value)} title="Who is raising this?">
          <option value="">{kind === 'request' ? 'Requested by…' : 'Added by…'}</option>
          {data.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} title="Who should handle it?">
          <option value="">Assign to… (optional)</option>
          {data.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <input type="date" value={forDate} onChange={(e) => setForDate(e.target.value)} title="Optional date" />
        <button className="btn primary" onClick={add} disabled={!text.trim()}>
          Post
        </button>
      </div>

      {lastDeleted && (
        <div className="undo-bar">
          Deleted “{lastDeleted.text.length > 40 ? lastDeleted.text.slice(0, 40) + '…' : lastDeleted.text}”
          <button className="btn subtle" onClick={undoDelete}>
            ↩️ Undo
          </button>
        </div>
      )}

      <div className="board-columns">
        <div className="board-col">
          <h3>🙋 Requests</h3>
          {requests.length === 0 && <p className="hint">No open requests.</p>}
          {requests.map(renderItem)}
        </div>
        <div className="board-col">
          <h3>📌 Reminders</h3>
          {reminders.length === 0 && <p className="hint">No open reminders.</p>}
          {reminders.map(renderItem)}
        </div>
      </div>
    </div>
  )
}
