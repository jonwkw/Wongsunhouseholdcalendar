import { useState } from 'react'
import { useApp, uid } from '../store'
import { activitiesOn, addDays, prettyTime, relativeLabel, todayKey, fromKey, weekdayName } from '../utils/dates'
import { useForecast } from '../utils/useForecast'
import { weatherEmoji } from '../utils/weather'
import { mathProblemFor, missionFor, wordFor } from '../data/kidContent'
import { t } from '../i18n'

const MISSION_EMOJI = ['✅', '🪥', '🥣', '🎒', '📖', '🧸', '🌙', '🧦', '🚿', '🐟', '💪', '🎹', '✏️', '🧹', '💧', '🙏']

/** A page for the family's young reader: checklist, stars, schedule + daily word, maths, and mission. */
export function KidCorner() {
  const { data, update } = useApp()
  const { days: forecast } = useForecast()
  const [showAnswer, setShowAnswer] = useState(false)
  const [editList, setEditList] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [newEmoji, setNewEmoji] = useState('✅')

  const kid = data.members.find((m) => m.isChild) ?? data.members[0]
  const today = todayKey()
  const daySpan = [today, addDays(today, 1), addDays(today, 2), addDays(today, 3)]
  const now = fromKey(today)
  const word = wordFor(now)
  const math = mathProblemFor(now)
  const mission = missionFor(now)

  const checkedToday = data.kidChecks[today] ?? []
  const allDone = data.kidChecklist.length > 0 && data.kidChecklist.every((i) => checkedToday.includes(i.id))
  const stars = data.starDays.length
  const superStars = Math.floor(stars / 5)
  const towardNext = stars % 5

  /** Ticking the last item earns today's gold star; unticking gives it back */
  const toggleCheck = (itemId: string) => {
    update((d) => {
      const cur = d.kidChecks[today] ?? []
      const next = cur.includes(itemId) ? cur.filter((x) => x !== itemId) : [...cur, itemId]
      const done = d.kidChecklist.length > 0 && d.kidChecklist.every((i) => next.includes(i.id))
      const starDays = done
        ? d.starDays.includes(today) ? d.starDays : [...d.starDays, today]
        : d.starDays.filter((x) => x !== today)
      return { ...d, kidChecks: { ...d.kidChecks, [today]: next }, starDays }
    })
  }

  const addItem = () => {
    if (!newItem.trim()) return
    update((d) => ({
      ...d,
      kidChecklist: [...d.kidChecklist, { id: uid('c'), emoji: newEmoji, text: newItem.trim() }],
    }))
    setNewItem('')
    setNewEmoji('✅')
  }

  const removeItem = (id: string) => {
    update((d) => ({ ...d, kidChecklist: d.kidChecklist.filter((i) => i.id !== id) }))
  }

  if (!kid) return null

  return (
    <div className="kid-page">
      <div className="kid-hero">
        <span className="kid-hero-star s1">✦</span>
        <span className="kid-hero-star s2">✦</span>
        <span className="kid-hero-star s3">✦</span>
        <span className="kid-hero-star s4">✦</span>
        <span className="kid-hero-star s5">✦</span>
        <span className="kid-hero-planet">🪐</span>
        <span className="kid-hero-rocket">🚀</span>
        <div className="kid-hero-text">
          <h2 className="kid-title">{t('missionControl', { name: kid.name })}</h2>
          <p className="kid-hero-sub">{t('readyLiftoff', { name: kid.name })}</p>
        </div>
        <span className="kid-hero-robot">🤖</span>
        <span className="kid-hero-moon">🌙</span>
      </div>

      <div className="star-zone">
        <div className="star-bank">
          <div className="star-bank-super" title={t('superStarsTitle')}>
            {superStars > 0
              ? Array.from({ length: superStars }, (_, i) => (
                  <span key={i} className="super-star">🌟</span>
                ))
              : t('noSuperStars')}
          </div>
          <div className="star-bank-progress">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={`star-slot ${i < towardNext ? 'earned' : ''}`}>
                {i < towardNext ? '⭐' : '☆'}
              </span>
            ))}
            <span className="star-bank-label">{t('moreToNext', { n: 5 - towardNext })}</span>
          </div>
        </div>
        <div className={`star-counter ${allDone ? 'celebrate' : ''}`} title={t('goldStarsTitle')}>
          <span className="star-counter-star">⭐</span>
          <span className="star-counter-num">{stars}</span>
          <span className="star-counter-label">{t('goldStarsTitle')}</span>
        </div>
      </div>

      <div className={`kid-card checklist ${allDone ? 'complete' : ''}`}>
        <div className="checklist-head">
          <h3>{t('todaysMissions')}</h3>
          <button className="icon-btn" onClick={() => setEditList((v) => !v)}>
            {editList ? t('doneBtn') : '✏️'}
          </button>
        </div>
        {data.kidChecklist.map((item) => (
          <label key={item.id} className={`checklist-item ${checkedToday.includes(item.id) ? 'done' : ''}`}>
            <input
              type="checkbox"
              checked={checkedToday.includes(item.id)}
              onChange={() => toggleCheck(item.id)}
            />
            <span className="checklist-emoji">{item.emoji}</span>
            <span className="checklist-text">{item.text}</span>
            {editList && (
              <button className="icon-btn tiny" onClick={(e) => { e.preventDefault(); removeItem(item.id) }}>
                ✕
              </button>
            )}
          </label>
        ))}
        {editList && (
          <div className="checklist-add-block">
            <div className="emoji-picker">
              {MISSION_EMOJI.map((e) => (
                <button key={e} type="button" className={`emoji-opt ${newEmoji === e ? 'on' : ''}`} onClick={() => setNewEmoji(e)}>
                  {e}
                </button>
              ))}
            </div>
            <div className="checklist-add">
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={t('addMissionPh')}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
              />
              <button className="btn primary" onClick={addItem} disabled={!newItem.trim()}>
                {newEmoji} {t('add')}
              </button>
            </div>
          </div>
        )}
        {allDone && <div className="checklist-star">{t('allDoneStar')}</div>}
      </div>

      <div className="kid-daily">
        <div className="kid-card word">
          <h3>{t('wordOfDay')}</h3>
          <div className="kid-word">{word.word}</div>
          <p className="kid-meaning">{word.meaning}</p>
          <p className="kid-sentence">“{word.sentence}”</p>
        </div>

        <div className="kid-card math">
          <h3>{t('mathOfDay')}</h3>
          <p className="kid-question">{math.question}</p>
          {showAnswer ? (
            <div className="kid-answer">{t('answerIs', { n: math.answer })}</div>
          ) : (
            <button className="btn primary" onClick={() => setShowAnswer(true)}>
              {t('showAnswer')}
            </button>
          )}
        </div>

        <div className="kid-card mission">
          <h3>{t('missionOfDay')}</h3>
          <p className="kid-question">{mission}</p>
        </div>
      </div>

      <h3 className="kid-subtitle">{t('flightPlan')}</h3>
      <div className="kid-days">
        {daySpan.map((date, i) => {
          const acts = activitiesOn(data.activities, date).filter(
            (a) => a.memberIds.length === 0 || a.memberIds.includes(kid.id),
          )
          const notes = data.dayNotes.filter(
            (n) => n.date === date && (!n.memberId || n.memberId === kid.id),
          )
          const f = forecast?.[i]
          return (
            <div key={date} className={`kid-day ${i === 0 ? 'today' : ''}`}>
              <div className="kid-day-head">
                <div>
                  <strong>{relativeLabel(date)}</strong>
                  <div className="kid-day-weekday">{weekdayName(date)}</div>
                </div>
                {f && <span title={f.summary}>{weatherEmoji(f.summary)}</span>}
              </div>
              {acts.length === 0 && <p className="kid-free">{t('freeDay')}</p>}
              {acts.map((a) => (
                <div key={a.id} className="kid-activity">
                  <span className="kid-activity-emoji">{a.emoji}</span>
                  <span>
                    <strong>{a.title}</strong>
                    {a.time && <span className="card-time"> · {prettyTime(a.time)}</span>}
                  </span>
                </div>
              ))}
              {notes.map((n) => (
                <div key={n.id} className={`kid-note ${n.done ? 'done' : ''}`}>
                  {n.kind === 'reminder' ? '⏰' : '💬'} {n.text}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
