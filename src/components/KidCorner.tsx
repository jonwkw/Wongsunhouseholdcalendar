import { useState } from 'react'
import { useApp, uid } from '../store'
import { activitiesOn, addDays, prettyTime, relativeLabel, todayKey, fromKey } from '../utils/dates'
import { useForecast } from '../utils/useForecast'
import { weatherEmoji } from '../utils/weather'
import { mathProblemFor, missionFor, wordFor } from '../data/kidContent'

/** A page for the family's young reader: checklist, stars, schedule + daily word, maths, and mission. */
export function KidCorner() {
  const { data, update } = useApp()
  const { days: forecast } = useForecast()
  const [showAnswer, setShowAnswer] = useState(false)
  const [editList, setEditList] = useState(false)
  const [newItem, setNewItem] = useState('')

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
      kidChecklist: [...d.kidChecklist, { id: uid('c'), emoji: '✅', text: newItem.trim() }],
    }))
    setNewItem('')
  }

  const removeItem = (id: string) => {
    update((d) => ({ ...d, kidChecklist: d.kidChecklist.filter((i) => i.id !== id) }))
  }

  if (!kid) return null

  return (
    <div className="kid-page">
      <h2 className="kid-title">⭐ {kid.name}'s Corner ⭐</h2>

      <div className="star-bank">
        <div className="star-bank-super" title="One super gold star for every 5 gold stars">
          {superStars > 0 ? Array.from({ length: superStars }, () => '🌟').join(' ') : 'No super stars yet…'}
        </div>
        <div className="star-bank-progress">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`star-slot ${i < towardNext ? 'earned' : ''}`}>
              {i < towardNext ? '⭐' : '☆'}
            </span>
          ))}
          <span className="star-bank-label">
            {stars} gold star{stars === 1 ? '' : 's'} · {5 - towardNext} more to the next 🌟
          </span>
        </div>
      </div>

      <div className={`kid-card checklist ${allDone ? 'complete' : ''}`}>
        <div className="checklist-head">
          <h3>✅ Today's checklist</h3>
          <button className="icon-btn" title="Edit the list" onClick={() => setEditList((v) => !v)}>
            {editList ? 'Done' : '✏️'}
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
              <button className="icon-btn tiny" title="Remove" onClick={(e) => { e.preventDefault(); removeItem(item.id) }}>
                ✕
              </button>
            )}
          </label>
        ))}
        {editList && (
          <div className="checklist-add">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add something to do every day…"
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
            <button className="btn primary" onClick={addItem} disabled={!newItem.trim()}>
              Add
            </button>
          </div>
        )}
        {allDone && <div className="checklist-star">🌟 All done — you earned today's gold star! 🌟</div>}
      </div>

      <div className="kid-daily">
        <div className="kid-card word">
          <h3>📖 Word of the day</h3>
          <div className="kid-word">{word.word}</div>
          <p className="kid-meaning">{word.meaning}</p>
          <p className="kid-sentence">“{word.sentence}”</p>
        </div>

        <div className="kid-card math">
          <h3>🔢 Maths problem of the day</h3>
          <p className="kid-question">{math.question}</p>
          {showAnswer ? (
            <div className="kid-answer">The answer is {math.answer}! 🎉</div>
          ) : (
            <button className="btn primary" onClick={() => setShowAnswer(true)}>
              Show the answer
            </button>
          )}
        </div>

        <div className="kid-card mission">
          <h3>🏅 Mission of the day</h3>
          <p className="kid-question">{mission}</p>
        </div>
      </div>

      <h3 className="kid-subtitle">🗓️ Your next few days</h3>
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
                <strong>{relativeLabel(date)}</strong>
                {f && <span title={f.summary}>{weatherEmoji(f.summary)}</span>}
              </div>
              {acts.length === 0 && <p className="kid-free">Free day! 🎈</p>}
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
