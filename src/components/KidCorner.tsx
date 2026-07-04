import { useState } from 'react'
import { useApp } from '../store'
import { activitiesOn, addDays, prettyTime, relativeLabel, todayKey, fromKey } from '../utils/dates'
import { useForecast } from '../utils/useForecast'
import { weatherEmoji } from '../utils/weather'
import { mathProblemFor, missionFor, wordFor } from '../data/kidContent'

/** A page for the family's young reader: his schedule + daily word, maths, and mission. */
export function KidCorner() {
  const { data } = useApp()
  const { days: forecast } = useForecast()
  const [showAnswer, setShowAnswer] = useState(false)

  const kid = data.members.find((m) => m.isChild) ?? data.members[0]
  const today = todayKey()
  const daySpan = [today, addDays(today, 1), addDays(today, 2), addDays(today, 3)]
  const now = fromKey(today)
  const word = wordFor(now)
  const math = mathProblemFor(now)
  const mission = missionFor(now)

  if (!kid) return null

  return (
    <div className="kid-page">
      <h2 className="kid-title">⭐ {kid.name}'s Corner ⭐</h2>

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
