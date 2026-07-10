import { useEffect, useRef, useState } from 'react'
import type { BoardItem } from '../types'
import { useApp, uid } from '../store'
import { prettyDate, todayKey } from '../utils/dates'
import { t } from '../i18n'

/** Family reminders: one shared list with added-by / assigned-to and undoable delete. */
export function FamilyBoard() {
  const { data, update, memberById, locked } = useApp()
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
      kind: 'reminder',
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

  return (
    <div className="board-page">
      <div className="page-head">
        <h2>{t('remindersCol')}</h2>
        <label className="check-row">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
          {t('showCompleted')}
        </label>
      </div>

      {!locked && <div className="board-form">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('remPlaceholder')}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <select value={byMemberId} onChange={(e) => setByMemberId(e.target.value)}>
          <option value="">{t('addedByOpt')}</option>
          {data.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)}>
          <option value="">{t('assignToOpt')}</option>
          {data.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <input type="date" value={forDate} onChange={(e) => setForDate(e.target.value)} />
        <button className="btn primary" onClick={add} disabled={!text.trim()}>
          {t('post')}
        </button>
      </div>}

      {lastDeleted && (
        <div className="undo-bar">
          {t('deleted')} “{lastDeleted.text.length > 40 ? lastDeleted.text.slice(0, 40) + '…' : lastDeleted.text}”
          <button className="btn subtle" onClick={undoDelete}>
            {t('undo')}
          </button>
        </div>
      )}

      <div className="board-col full">
        {visible.length === 0 && <p className="hint">{t('noReminders')}</p>}
        {visible.map((b) => (
          <div key={b.id} className={`board-item ${b.status}`}>
            <input type="checkbox" checked={b.status === 'done'} onChange={() => toggle(b.id)} />
            <div className="board-body">
              <div className="board-text">{b.text}</div>
              <div className="board-meta">
                {b.byMemberId && (
                  <span className="board-who">
                    {t('addedBy')} {pill(b.byMemberId)}
                  </span>
                )}
                {b.assignedToId && <span className="board-who">→ {pill(b.assignedToId)}</span>}
                {b.forDate && <span className="board-date">📅 {prettyDate(b.forDate)}</span>}
              </div>
            </div>
            {!locked && <button className="icon-btn tiny" onClick={() => remove(b)}>✕</button>}
          </div>
        ))}
      </div>
    </div>
  )
}
