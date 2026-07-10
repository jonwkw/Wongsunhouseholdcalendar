import type { ReactNode } from 'react'
import type { Member } from '../types'
import { useApp } from '../store'
import { t } from '../i18n'
import { MemberFace } from './avatars'

/** Colour used when something is tagged to the whole family */
export const EVERYONE_COLOR = '#b08b3e'

/** Colour an item takes: first tagged member's colour, or the family colour */
export function tagColor(memberIds: string[], members: Member[]): string {
  if (memberIds.length === 0) return EVERYONE_COLOR
  return members.find((m) => m.id === memberIds[0])?.color ?? EVERYONE_COLOR
}

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

/** Coloured name pills so it's always clear who something belongs to */
export function MemberChips({
  memberIds,
  everyone = false,
}: {
  memberIds: string[]
  /** Show an "Everyone" pill when memberIds is empty (i.e. tagged to everyone) */
  everyone?: boolean
}) {
  const { data } = useApp()
  if (memberIds.length === 0) {
    if (!everyone) return null
    return (
      <span className="member-chips">
        <span className="name-pill" style={{ borderColor: EVERYONE_COLOR, background: EVERYONE_COLOR + '1e', color: EVERYONE_COLOR }}>
          {t('everyone')}
        </span>
      </span>
    )
  }
  const members = memberIds
    .map((id) => data.members.find((m) => m.id === id))
    .filter((m): m is Member => Boolean(m))
  return (
    <span className="member-chips">
      {members.map((m) => (
        <span key={m.id} className="name-pill" style={{ borderColor: m.color, background: m.color + '1e', color: m.color }}>
          {m.name}
        </span>
      ))}
    </span>
  )
}

/**
 * Multi-select row of member avatars used in forms.
 * An empty selection means "Everyone" — shown as its own leading option.
 */
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
      <button
        type="button"
        className={`member-toggle-btn ${selected.length === 0 ? 'on' : ''}`}
        style={selected.length === 0 ? { background: EVERYONE_COLOR + '2a', borderColor: EVERYONE_COLOR } : undefined}
        onClick={() => onChange([])}
      >
        <span>🌈</span> {t('everyone')}
      </button>
      {data.members.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`member-toggle-btn ${selected.includes(m.id) ? 'on' : ''}`}
          style={selected.includes(m.id) ? { background: m.color + '2a', borderColor: m.color } : undefined}
          onClick={() => toggle(m.id)}
        >
          <MemberFace member={m} size={20} /> {m.name}
        </button>
      ))}
    </div>
  )
}

/** Colour key mapping each family member (and Everyone) to their colour */
export function Legend() {
  const { data } = useApp()
  return (
    <div className="legend">
      {data.members.map((m) => (
        <span key={m.id} className="legend-item">
          <span className="legend-dot" style={{ background: m.color }} />
          <MemberFace member={m} size={20} /> {m.name}
        </span>
      ))}
      <span className="legend-item">
        <span className="legend-dot" style={{ background: EVERYONE_COLOR }} />
        🌈 {t('everyone')}
      </span>
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
      <button
        type="button"
        className={`emoji-opt none ${value === '' ? 'on' : ''}`}
        title="No emoji"
        onClick={() => onChange('')}
      >
        ∅
      </button>
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
