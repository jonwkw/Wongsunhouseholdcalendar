import { useState } from 'react'
import type { BoardItem } from '../types'
import { useApp, uid } from '../store'
import { prettyDate, todayKey } from '../utils/dates'

export function FamilyBoard() {
  const { data, update, memberById } = useApp()
  const [kind, setKind] = useState<'request' | 'reminder'>('request')
  const [text, setText] = useState('')
  const [forDate, setForDate] = useState('')
  const [byMemberId, setByMemberId] = useState('')
  const [showDone, setShowDone] = useState(false)

  const add = () => {
    if (!text.trim()) return
    const item: BoardItem = {
      id: uid('b'),
      kind,
      text: text.trim(),
      byMemberId,
      forDate: forDate || undefined,
      status: 'open',
      createdAt: todayKey(),
    }
    update((d) => ({ ...d, boardItems: [item, ...d.boardItems] }))
    setText('')
    setForDate('')
  }

  const toggle = (id: string) =>
    update((d) => ({
      ...d,
      boardItems: d.boardItems.map((b) =>
        b.id === id ? { ...b, status: b.status === 'open' ? 'done' : 'open' } : b,
      ),
    }))

  const remove = (id: string) =>
    update((d) => ({ ...d, boardItems: d.boardItems.filter((b) => b.id !== id) }))

  const reply = (id: string) => {
    const current = data.boardItems.find((b) => b.id === id)
    const answer = window.prompt('Reply:', current?.reply ?? '')
    if (answer === null) return
    update((d) => ({
      ...d,
      boardItems: d.boardItems.map((b) => (b.id === id ? { ...b, reply: answer.trim() || undefined } : b)),
    }))
  }

  const visible = data.boardItems.filter((b) => showDone || b.status === 'open')
  const requests = visible.filter((b) => b.kind === 'request')
  const reminders = visible.filter((b) => b.kind === 'reminder')

  const renderItem = (b: BoardItem) => {
    const by = memberById(b.byMemberId)
    return (
      <div key={b.id} className={`board-item ${b.status}`}>
        <input type="checkbox" checked={b.status === 'done'} onChange={() => toggle(b.id)} title="Mark done" />
        <div className="board-body">
          <div className="board-text">{b.text}</div>
          <div className="board-meta">
            {by && (
              <span className="name-pill" style={{ borderColor: by.color, background: by.color + '1e', color: by.color }}>
                {by.name}
              </span>
            )}
            {b.forDate && <span className="board-date">📅 {prettyDate(b.forDate)}</span>}
          </div>
          {b.reply && <div className="board-reply">↩️ {b.reply}</div>}
        </div>
        <button className="icon-btn tiny" title="Reply" onClick={() => reply(b.id)}>💬</button>
        <button className="icon-btn tiny" title="Delete" onClick={() => remove(b.id)}>✕</button>
      </div>
    )
  }

  return (
    <div className="board-page">
      <div className="page-head">
        <h2>📌 Family Board</h2>
        <label className="check-row">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
          Show completed
        </label>
      </div>
      <p className="hint">Special requests (“can we add this to the menu?”) and one-off reminders (“balcony clean”).</p>

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
        <select value={byMemberId} onChange={(e) => setByMemberId(e.target.value)} title="Who is posting this?">
          <option value="">From…</option>
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
