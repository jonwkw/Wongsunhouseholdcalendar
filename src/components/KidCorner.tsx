import { useEffect, useRef, useState } from 'react'
import { useApp, uid } from '../store'
import { activitiesOn, addDays, prettyDate, prettyTime, relativeLabel, todayKey, fromKey, weekdayName } from '../utils/dates'
import { useForecast } from '../utils/useForecast'
import { weatherEmoji } from '../utils/weather'
import { mathProblemFor, missionFor, wordFor, rocketFor, ROCKETS } from '../data/kidContent'
import { t } from '../i18n'

const MISSION_EMOJI = ['✅', '🪥', '🥣', '🎒', '📖', '🧸', '🌙', '🧦', '🚿', '🐟', '💪', '🎹', '✏️', '🧹', '💧', '🙏']

/** Mission Control: rocket fuelled by daily missions, plus daily word / maths / mission. */
export function KidCorner() {
  const { data, update } = useApp()
  const { days: forecast } = useForecast()
  const [showAnswer, setShowAnswer] = useState(false)
  const [editList, setEditList] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [newEmoji, setNewEmoji] = useState('✅')
  const [newRepeat, setNewRepeat] = useState(true)
  const [launching, setLaunching] = useState(false)
  const launchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const kid = data.members.find((m) => m.isChild) ?? data.members[0]
  const today = todayKey()
  const [selectedDay, setSelectedDay] = useState(today)
  const isFuture = selectedDay > today

  useEffect(() => () => {
    if (launchTimer.current) clearTimeout(launchTimer.current)
  }, [])

  const now = fromKey(today)
  const word = wordFor(now)
  const math = mathProblemFor(now)
  const mission = missionFor(now)

  /** Tasks that apply on a given day: daily ones + one-offs for that date */
  const itemsFor = (date: string) => data.kidChecklist.filter((i) => !i.date || i.date === date)

  const items = itemsFor(selectedDay)
  const checked = data.kidChecks[selectedDay] ?? []
  const dayDone = items.length > 0 && items.every((i) => checked.includes(i.id))

  const launches = data.starDays.length
  const { rocket, level } = rocketFor(launches)
  const fuelPct = items.length === 0 ? 0 : Math.round((items.filter((i) => checked.includes(i.id)).length / items.length) * 100)

  const toggleCheck = (itemId: string) => {
    if (isFuture) return
    update((d) => {
      const cur = d.kidChecks[selectedDay] ?? []
      const next = cur.includes(itemId) ? cur.filter((x) => x !== itemId) : [...cur, itemId]
      const dayItems = d.kidChecklist.filter((i) => !i.date || i.date === selectedDay)
      const done = dayItems.length > 0 && dayItems.every((i) => next.includes(i.id))
      const wasDone = d.starDays.includes(selectedDay)
      const starDays = done
        ? wasDone ? d.starDays : [...d.starDays, selectedDay]
        : d.starDays.filter((x) => x !== selectedDay)
      if (done && !wasDone) {
        setLaunching(true)
        if (launchTimer.current) clearTimeout(launchTimer.current)
        launchTimer.current = setTimeout(() => setLaunching(false), 2600)
      }
      return { ...d, kidChecks: { ...d.kidChecks, [selectedDay]: next }, starDays }
    })
  }

  const addItem = () => {
    if (!newItem.trim()) return
    update((d) => ({
      ...d,
      kidChecklist: [
        ...d.kidChecklist,
        { id: uid('c'), emoji: newEmoji, text: newItem.trim(), date: newRepeat ? undefined : selectedDay },
      ],
    }))
    setNewItem('')
  }

  const removeItem = (id: string) => {
    update((d) => ({ ...d, kidChecklist: d.kidChecklist.filter((i) => i.id !== id) }))
  }

  if (!kid) return null

  return (
    <div className="kid-page">
      <div className={`kid-hero ${launching ? 'launching' : ''}`}>
        <span className="kid-hero-star s1">✦</span>
        <span className="kid-hero-star s2">✦</span>
        <span className="kid-hero-star s3">✦</span>
        <span className="kid-hero-star s4">✦</span>
        <span className="kid-hero-star s5">✦</span>
        <span className="kid-hero-planet">🪐</span>
        <span className="kid-hero-moon">🌙</span>

        <div className="rocket-pad">
          <div className={`rocket-art level-${level} ${launching ? 'takeoff' : ''}`}>{rocket.art}</div>
          {launching && <div className="rocket-flames">🔥🔥</div>}
          <div className="rocket-name">
            {rocket.name} <span className="rocket-level">Lv.{level + 1}/{ROCKETS.length}</span>
          </div>
        </div>

        <div className="kid-hero-text">
          <h2 className="kid-title">{t('missionControl', { name: kid.name })}</h2>
          <div className="fuel-gauge" title={t('fuelLabel')}>
            <span className="fuel-icon">⛽</span>
            <div className="fuel-bar">
              <div className="fuel-fill" style={{ width: `${fuelPct}%` }} />
            </div>
            <span className="fuel-pct">{fuelPct}%</span>
          </div>
          {launching && <div className="liftoff-banner">{t('liftoff')}</div>}
        </div>

        <div className="launch-counter" title={t('launches')}>
          <span className="launch-rocket">🚀</span>
          <span className="launch-num">{launches}</span>
          <span className="launch-label">{t('launches')}</span>
        </div>
      </div>

      <div className={`kid-card checklist ${dayDone ? 'complete' : ''}`}>
        <div className="checklist-head">
          <h3>🤖 {t('missionsTitle')}</h3>
          <div className="day-selector">
            <button className="icon-btn" onClick={() => setSelectedDay((d) => addDays(d, -1))}>◀</button>
            <button
              className={`btn subtle day-selector-label ${selectedDay === today ? 'is-today' : ''}`}
              onClick={() => setSelectedDay(today)}
            >
              {relativeLabel(selectedDay)} · {weekdayName(selectedDay)}
            </button>
            <button className="icon-btn" onClick={() => setSelectedDay((d) => addDays(d, 1))}>▶</button>
          </div>
          <button className="icon-btn" onClick={() => setEditList((v) => !v)}>
            {editList ? t('doneBtn') : '✏️'}
          </button>
        </div>

        {isFuture && <p className="future-note">{t('futureLocked', { name: kid.name })}</p>}

        {items.map((item) => (
          <label key={item.id} className={`checklist-item ${checked.includes(item.id) ? 'done' : ''} ${isFuture ? 'locked' : ''}`}>
            <input
              type="checkbox"
              checked={checked.includes(item.id)}
              disabled={isFuture}
              onChange={() => toggleCheck(item.id)}
            />
            <span className="checklist-emoji">{item.emoji}</span>
            <span className="checklist-text">
              {item.text}
              {item.date && <span className="oneoff-tag">📅 {prettyDate(item.date)}</span>}
            </span>
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
            <div className="kind-toggle">
              <button className={`btn ${newRepeat ? 'primary' : 'subtle'}`} onClick={() => setNewRepeat(true)}>
                🔁 {t('repeating')}
              </button>
              <button className={`btn ${!newRepeat ? 'primary' : 'subtle'}`} onClick={() => setNewRepeat(false)}>
                📅 {t('justThisDay')} ({prettyDate(selectedDay)})
              </button>
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
        {dayDone && !isFuture && <div className="checklist-star">{t('liftoff')}</div>}
      </div>

      <div className="kid-daily">
        <div className="kid-card word">
          <h3>{t('wordOfDay')}</h3>
          <div className="kid-word">{word.word}</div>
          <div className="kid-phonetic">🔤 {word.phonetic}</div>
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
      <div className="kid-days two">
        {[today, addDays(today, 1)].map((date, i) => {
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
