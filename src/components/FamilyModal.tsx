import { useState } from 'react'
import { useApp, uid } from '../store'
import { Modal } from './shared'
import { t } from '../i18n'

const PEOPLE_EMOJI = ['👨', '👩', '👵', '👴', '🧑‍🍳', '🧒', '👧', '👦', '👶', '🧑', '👨‍🦳', '👩‍🦳']
const COLORS = ['#3b82c4', '#c45b9d', '#8a6bbf', '#2f9e77', '#e08a2e', '#d95d5d', '#4a9ba8', '#7d8c3f']

/** Edit family members: rename, change emoji, add or remove. */
export function FamilyModal({ onClose }: { onClose: () => void }) {
  const { data, update } = useApp()
  const [newName, setNewName] = useState('')

  const rename = (id: string, name: string) =>
    update((d) => ({ ...d, members: d.members.map((m) => (m.id === id ? { ...m, name } : m)) }))

  const setEmoji = (id: string, emoji: string) =>
    update((d) => ({ ...d, members: d.members.map((m) => (m.id === id ? { ...m, emoji } : m)) }))

  const remove = (id: string) => {
    if (data.members.length <= 1) return
    if (!window.confirm(t('removeMemberConfirm'))) return
    update((d) => ({
      ...d,
      members: d.members.filter((m) => m.id !== id),
      activities: d.activities.map((a) => ({ ...a, memberIds: a.memberIds.filter((x) => x !== id) })),
    }))
  }

  const add = () => {
    if (!newName.trim()) return
    const color = COLORS[data.members.length % COLORS.length]
    update((d) => ({
      ...d,
      members: [...d.members, { id: uid('mem'), name: newName.trim(), emoji: '🧑', color }],
    }))
    setNewName('')
  }

  return (
    <Modal title={t('ourFamily')} onClose={onClose} wide>
      <div className="form">
        {data.members.map((m) => (
          <div key={m.id} className="family-row" style={{ borderLeftColor: m.color }}>
            <select value={m.emoji} onChange={(e) => setEmoji(m.id, e.target.value)} className="emoji-select">
              {[m.emoji, ...PEOPLE_EMOJI.filter((e) => e !== m.emoji)].map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <input value={m.name} onChange={(e) => rename(m.id, e.target.value)} />
            <button className="icon-btn tiny" title="Remove" onClick={() => remove(m.id)}>
              ✕
            </button>
          </div>
        ))}
        <div className="family-row add">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('addMemberPh')}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <button className="btn primary" onClick={add} disabled={!newName.trim()}>
            {t('add')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
