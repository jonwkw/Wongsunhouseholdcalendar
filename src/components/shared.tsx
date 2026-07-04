import type { ReactNode } from 'react'
import type { Member } from '../types'
import { useApp } from '../store'

export function Avatar({ member, size = 28 }: { member: Member; size?: number }) {
  return (
    <span
      className="avatar"
      title={member.name}
      style={{ width: size, height: size, fontSize: size * 0.6, background: member.color + '33', borderColor: member.color }}
    >
      {member.emoji}
    </span>
  )
}

export function MemberChips({ memberIds, size = 22 }: { memberIds: string[]; size?: number }) {
  const { data } = useApp()
  const members = memberIds
    .map((id) => data.members.find((m) => m.id === id))
    .filter((m): m is Member => Boolean(m))
  if (members.length === 0) return null
  return (
    <span className="member-chips">
      {members.map((m) => (
        <Avatar key={m.id} member={m} size={size} />
      ))}
    </span>
  )
}

/** Multi-select row of member avatars used in forms */
export function MemberToggle({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const { data } = useApp()
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  return (
    <div className="member-toggle">
      {data.members.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`member-toggle-btn ${selected.includes(m.id) ? 'on' : ''}`}
          style={selected.includes(m.id) ? { background: m.color + '2a', borderColor: m.color } : undefined}
          onClick={() => toggle(m.id)}
        >
          <span>{m.emoji}</span> {m.name}
        </button>
      ))}
    </div>
  )
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const COMMON_EMOJI = [
  '🏫', '📚', '🏊', '⚽', '🎹', '🎨', '🎈', '🩺', '🦷', '💉', '🧺', '🛒', '🍽️', '🎂',
  '✈️', '🚗', '🏠', '⛪', '🕌', '🧧', '🎄', '🧹', '🐶', '💼', '💇', '🎾', '🥋', '🎻',
]

export function EmojiPicker({ value, onChange }: { value: string; onChange: (e: string) => void }) {
  return (
    <div className="emoji-picker">
      {COMMON_EMOJI.map((e) => (
        <button
          key={e}
          type="button"
          className={`emoji-opt ${value === e ? 'on' : ''}`}
          onClick={() => onChange(e)}
        >
          {e}
        </button>
      ))}
    </div>
  )
}
