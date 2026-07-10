import { useState } from 'react'
import type { AvatarAge, AvatarSpec, Member } from '../types'
import { useApp, uid } from '../store'
import { t } from '../i18n'
import {
  AvatarSvg, MemberFace, SKIN_TONES, HAIR_COLORS, HAIRSTYLE_NAMES, AGES, FACIAL_HAIR,
  GLASSES, EARRINGS, SHIRT_COLORS, DEFAULT_SPEC,
} from './avatars'

const COLORS = ['#3b82c4', '#c45b9d', '#8a6bbf', '#2f9e77', '#e08a2e', '#d95d5d', '#4a9ba8', '#7d8c3f']

/** Family page: everyone picks their own avatar, used across the whole app. */
export function ProfilePage() {
  const { data, update } = useApp()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const selected = data.members.find((m) => m.id === selectedId) ?? null

  const patchMember = (id: string, patch: Partial<Member>) =>
    update((d) => ({ ...d, members: d.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))

  const patchSpec = (m: Member, patch: Partial<AvatarSpec>) =>
    patchMember(m.id, { avatar: { ...(m.avatar ?? DEFAULT_SPEC), ...patch } })

  const addMember = () => {
    if (!newName.trim()) return
    const color = COLORS[data.members.length % COLORS.length]
    const id = uid('mem')
    update((d) => ({
      ...d,
      members: [...d.members, { id, name: newName.trim(), emoji: '🧑', color, avatar: { ...DEFAULT_SPEC } }],
    }))
    setNewName('')
    setSelectedId(id)
  }

  const removeMember = (id: string) => {
    if (data.members.length <= 1) return
    if (!window.confirm(t('removeMemberConfirm'))) return
    update((d) => ({
      ...d,
      members: d.members.filter((m) => m.id !== id),
      activities: d.activities.map((a) => ({ ...a, memberIds: a.memberIds.filter((x) => x !== id) })),
    }))
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div className="profile-page">
      <div className="profile-grid">
        {data.members.map((m) => (
          <button
            key={m.id}
            className={`profile-card ${selectedId === m.id ? 'on' : ''}`}
            style={selectedId === m.id ? { borderColor: m.color, boxShadow: `0 0 0 3px ${m.color}44` } : undefined}
            onClick={() => setSelectedId(selectedId === m.id ? null : m.id)}
          >
            <MemberFace member={m} size={72} />
            <span className="profile-name">{m.name}</span>
          </button>
        ))}
        <div className="profile-card add">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('addMemberPh')}
            onKeyDown={(e) => e.key === 'Enter' && addMember()}
          />
          <button className="btn primary" onClick={addMember} disabled={!newName.trim()}>
            {t('add')}
          </button>
        </div>
      </div>

      {selected && (
        <div className="builder" style={{ borderColor: selected.color }}>
          <div className="builder-preview">
            <AvatarSvg spec={selected.avatar ?? DEFAULT_SPEC} ring={selected.color} size={140} />
            <input
              className="builder-name"
              value={selected.name}
              onChange={(e) => patchMember(selected.id, { name: e.target.value })}
            />
            <div className="swatch-row">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`swatch ${selected.color === c ? 'on' : ''}`}
                  style={{ background: c }}
                  onClick={() => patchMember(selected.id, { color: c })}
                />
              ))}
            </div>
            <button className="btn danger" onClick={() => removeMember(selected.id)}>
              {t('remove')}
            </button>
          </div>

          <div className="builder-controls">
            <label>{t('age')}</label>
            <div className="option-row">
              {AGES.map((a) => (
                <button
                  key={a.key}
                  className={`option-chip ${(selected.avatar ?? DEFAULT_SPEC).age === a.key ? 'on' : ''}`}
                  onClick={() => {
                    const isKid = a.key === 'baby' || a.key === 'toddler' || a.key === 'kid'
                    patchMember(selected.id, {
                      avatar: { ...(selected.avatar ?? DEFAULT_SPEC), age: a.key as AvatarAge },
                      isChild: isKid,
                    })
                  }}
                >
                  {a.emoji} {t(`age_${a.key}` as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>

            <label>{t('skinTone')}</label>
            <div className="swatch-row">
              {SKIN_TONES.map((c, i) => (
                <button
                  key={c}
                  className={`swatch big ${(selected.avatar ?? DEFAULT_SPEC).skin === i ? 'on' : ''}`}
                  style={{ background: c }}
                  onClick={() => patchSpec(selected, { skin: i })}
                />
              ))}
            </div>

            <label>{t('hairstyle')}</label>
            <div className="hair-grid">
              {HAIRSTYLE_NAMES.map((name, i) => (
                <button
                  key={name}
                  className={`hair-option ${(selected.avatar ?? DEFAULT_SPEC).hair === i ? 'on' : ''}`}
                  title={name}
                  onClick={() => patchSpec(selected, { hair: i })}
                >
                  <AvatarSvg spec={{ ...(selected.avatar ?? DEFAULT_SPEC), hair: i }} size={44} />
                </button>
              ))}
            </div>

            <label>{t('hairColor')}</label>
            <div className="swatch-row">
              {HAIR_COLORS.map((c, i) => (
                <button
                  key={c}
                  className={`swatch big ${(selected.avatar ?? DEFAULT_SPEC).hairColor === i ? 'on' : ''}`}
                  style={{ background: c }}
                  onClick={() => patchSpec(selected, { hairColor: i })}
                />
              ))}
            </div>

            <label>{t('facialHair')}</label>
            <div className="option-row">
              {FACIAL_HAIR.map((k, i) => (
                <button
                  key={k}
                  className={`hair-option ${(selected.avatar ?? DEFAULT_SPEC).facialHair === i ? 'on' : ''}`}
                  onClick={() => patchSpec(selected, { facialHair: i })}
                >
                  <AvatarSvg spec={{ ...(selected.avatar ?? DEFAULT_SPEC), facialHair: i }} size={44} />
                </button>
              ))}
            </div>

            <label>{t('glasses')}</label>
            <div className="option-row">
              {GLASSES.map((k, i) => (
                <button
                  key={k}
                  className={`hair-option ${((selected.avatar ?? DEFAULT_SPEC).glasses ?? 0) === i ? 'on' : ''}`}
                  onClick={() => patchSpec(selected, { glasses: i })}
                >
                  <AvatarSvg spec={{ ...(selected.avatar ?? DEFAULT_SPEC), glasses: i }} size={44} />
                </button>
              ))}
            </div>

            <label>{t('earrings')}</label>
            <div className="option-row">
              {EARRINGS.map((k, i) => (
                <button
                  key={k}
                  className={`hair-option ${((selected.avatar ?? DEFAULT_SPEC).earrings ?? 0) === i ? 'on' : ''}`}
                  onClick={() => patchSpec(selected, { earrings: i })}
                >
                  <AvatarSvg spec={{ ...(selected.avatar ?? DEFAULT_SPEC), earrings: i }} size={44} />
                </button>
              ))}
            </div>

            <label>{t('shirt')}</label>
            <div className="swatch-row">
              {SHIRT_COLORS.map((c, i) => (
                <button
                  key={c}
                  className={`swatch big ${((selected.avatar ?? DEFAULT_SPEC).shirt ?? 5) === i ? 'on' : ''}`}
                  style={{ background: c }}
                  onClick={() => patchSpec(selected, { shirt: i })}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {!selected && <p className="hint center">{t('pickProfileHint')}</p>}
    </div>
  )
}
