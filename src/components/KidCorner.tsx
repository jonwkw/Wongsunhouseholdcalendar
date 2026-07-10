import { useEffect, useRef, useState } from 'react'
import { useApp, uid } from '../store'
import { activitiesOn, addDays, prettyDate, prettyTime, relativeLabel, todayKey, fromKey, weekdayName } from '../utils/dates'
import { useForecast } from '../utils/useForecast'
import { weatherEmoji } from '../utils/weather'
import { mathProblemFor, missionFor, wordFor, cnWordFor, rocketFor, ROCKETS } from '../data/kidContent'
import { RocketShip } from './RocketShip'
import { t, getLang } from '../i18n'
import { speak, stopSpeak } from '../utils/speech'
import { Modal } from './shared'

const MISSION_EMOJI = ['✅', '🪥', '🥣', '🎒', '📖', '🧸', '🌙', '🧦', '🚿', '🐟', '💪', '🎹', '✏️', '🧹', '💧', '🙏']

/** Mission Control: rocket fuelled by daily missions, plus daily word / maths / mission. */
export function KidCorner() {
  const { data, update, locked } = useApp()
  const { days: forecast } = useForecast()
  const [showAnswer, setShowAnswer] = useState(false)
  const [editList, setEditList] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [newEmoji, setNewEmoji] = useState('✅')
  const [newRepeat, setNewRepeat] = useState(true)
  const [launching, setLaunching] = useState(false)
  const [celebrateLevel, setCelebrateLevel] = useState<number | null>(null)
  const [kidUnlocked, setKidUnlocked] = useState(false)
  const [showKidUnlock, setShowKidUnlock] = useState(false)
  const canEdit = !locked || kidUnlocked
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
  const cnWord = cnWordFor(now)
  const math = mathProblemFor(now)
  const lang = getLang()
  const mission = missionFor(now, lang)

  /** Tasks that apply on a given day: daily ones + one-offs for that date */
  const itemsFor = (date: string) => data.kidChecklist.filter((i) => !i.date || i.date === date)

  const items = itemsFor(selectedDay)
  const checked = data.kidChecks[selectedDay] ?? []
  const dayDone = items.length > 0 && items.every((i) => checked.includes(i.id))

  const totalDays = data.starDays.length
  const launches = Math.floor(totalDays / 5)
  const tank = totalDays % 5
  const { rocket, level } = rocketFor(launches)
  const todayItems = itemsFor(today)
  const todayChecked = data.kidChecks[today] ?? []
  const todayFraction = data.starDays.includes(today)
    ? 0
    : todayItems.length === 0
      ? 0
      : todayItems.filter((i) => todayChecked.includes(i.id)).length / todayItems.length

  const toggleCheck = (itemId: string) => {
    if (isFuture || !canEdit) return
    update((d) => {
      const cur = d.kidChecks[selectedDay] ?? []
      const next = cur.includes(itemId) ? cur.filter((x) => x !== itemId) : [...cur, itemId]
      const dayItems = d.kidChecklist.filter((i) => !i.date || i.date === selectedDay)
      const done = dayItems.length > 0 && dayItems.every((i) => next.includes(i.id))
      const wasDone = d.starDays.includes(selectedDay)
      const starDays = done
        ? wasDone ? d.starDays : [...d.starDays, selectedDay]
        : d.starDays.filter((x) => x !== selectedDay)
      // a launch happens when the 5th fuel cell fills: the CURRENT rocket
      // (with its full tank) takes off, and only afterwards the new one appears
      if (Math.floor(starDays.length / 5) > Math.floor(d.starDays.length / 5)) {
        setLaunching(true)
        setCelebrateLevel(Math.min(Math.floor(d.starDays.length / 5), ROCKETS.length - 1))
        if (launchTimer.current) clearTimeout(launchTimer.current)
        launchTimer.current = setTimeout(() => {
          setLaunching(false)
          setCelebrateLevel(null)
        }, 3200)
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
      <div className="kid-hero slim">
        <span className="kid-hero-star s1">✦</span>
        <span className="kid-hero-star s2">✦</span>
        <span className="kid-hero-star s3">✦</span>
        <span className="kid-hero-planet">🪐</span>
        <span className="kid-hero-moon">🌙</span>
        <h2 className="kid-title">{t('missionControl', { name: kid.name })}</h2>
      </div>

      <div className="kid-main">
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
            {selectedDay !== today && (
              <button className="btn subtle" onClick={() => setSelectedDay(today)}>
                {t('jumpToday')}
              </button>
            )}
          </div>
          {canEdit && (
            <button className="icon-btn" onClick={() => setEditList((v) => !v)}>
              {editList ? t('doneBtn') : '✏️'}
            </button>
          )}
        </div>

        {!canEdit && (
          <button className="btn primary rosco-unlock" onClick={() => setShowKidUnlock(true)}>
            {t('roscoUnlock', { name: kid.name })}
          </button>
        )}
        {isFuture && <p className="future-note">{t('futureLocked', { name: kid.name })}</p>}

        {items.map((item) => (
          <label key={item.id} className={`checklist-item ${checked.includes(item.id) ? 'done' : ''} ${isFuture || !canEdit ? 'locked' : ''}`}>
            <input
              type="checkbox"
              checked={checked.includes(item.id)}
              disabled={isFuture || !canEdit}
              onChange={() => toggleCheck(item.id)}
            />
            <span className="checklist-emoji">{item.emoji}</span>
            <span className="checklist-text">
              {getLang() === 'zh' && item.textZh ? item.textZh : item.text}
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
        {dayDone && !isFuture && tank !== 0 && (
          <div className="checklist-star">⛽ {t('daysToLaunch', { n: 5 - tank })}</div>
        )}
      </div>

      <div className={`rocket-panel ${launching ? 'launching' : ''}`}>
        <span className="kid-hero-star s1">✦</span>
        <span className="kid-hero-star s3">✦</span>
        <span className="kid-hero-star s5">✦</span>
        <div className="rocket-stage">
          <RocketShip level={celebrateLevel ?? level} size={150} launching={launching} />
          {launching && <div className="liftoff-banner">{t('liftoff')}</div>}
        </div>
        <div className="rocket-name">
          {(celebrateLevel != null ? ROCKETS[celebrateLevel] : rocket).name}
          <span className="rocket-level"> · {t('levelLabel')} {(celebrateLevel ?? level) + 1}/{ROCKETS.length}</span>
        </div>
        <div className="fuel-cells" title={t('fuelTank')}>
          {Array.from({ length: 5 }, (_, i) => {
            const shownTank = celebrateLevel != null ? 5 : tank
            return (
              <div key={i} className={`fuel-cell ${i < shownTank ? 'full' : ''}`}>
                {i < shownTank ? '⛽' : i === shownTank && todayFraction > 0 ? (
                  <div className="fuel-cell-partial" style={{ height: `${Math.round(todayFraction * 100)}%` }} />
                ) : null}
              </div>
            )
          })}
        </div>
        <div className="rocket-caption">
          {t('daysToLaunch', { n: 5 - tank })}
        </div>
        <div className="launch-count-mini">🚀 × {launches}</div>
      </div>
      </div>

      <div className="kid-daily">
        <div className="kid-card word">
          <h3>{t('wordOfDay')}</h3>
          <div className="kid-word">{word.word}</div>
          <div className="kid-phonetic">🔤 {word.phonetic}</div>
          <p className="kid-meaning">{word.meaning}</p>
          <p className="kid-sentence">“{word.sentence}”</p>
          <div className="kid-btn-row">
            <button
              className="btn primary speak-btn"
              onClick={() =>
                speak(
                  `The word of the day is: ${word.word}. It means: ${word.meaning}. For example: ${word.sentence} Can you say it?`,
                )
              }
            >
              {t('listen')}
            </button>
            <button className="btn subtle speak-btn" onClick={stopSpeak}>
              {t('stopBtn')}
            </button>
          </div>
        </div>

        <div className="kid-card cnword">
          <h3>{t('cnWordOfDay')}</h3>
          <div className="kid-word hanzi">{cnWord.hanzi}</div>
          <div className="kid-phonetic">🔤 {cnWord.pinyin} · {cnWord.meaning}</div>
          <p className="kid-meaning">{cnWord.meaningZh}</p>
          <p className="kid-sentence">“{cnWord.sentence}”</p>
          <div className="kid-btn-row">
            <button
              className="btn primary speak-btn"
              onClick={() =>
                speak(
                  `今天的中文字是：${cnWord.hanzi}。${cnWord.hanzi}，就是${cnWord.meaningZh}。听一听这个句子：${cnWord.sentence} 你也来念一念吧！`,
                  'zh',
                )
              }
            >
              {t('listen')}
            </button>
            <button className="btn subtle speak-btn" onClick={stopSpeak}>
              {t('stopBtn')}
            </button>
          </div>
        </div>

        <div className="kid-card math">
          <h3>{t('mathOfDay')}</h3>
          <p className="kid-question">{lang === 'zh' ? math.questionZh : math.question}</p>
          {showAnswer && <div className="kid-answer">{t('answerIs', { n: math.answer })}</div>}
          <div className="kid-btn-row">
            {!showAnswer && (
              <button className="btn primary" onClick={() => setShowAnswer(true)}>
                {t('showAnswer')}
              </button>
            )}
            <button className="btn subtle speak-btn" onClick={() => speak(lang === 'zh' ? math.explainZh : math.explain, lang)}>
              {t('explainBtn')}
            </button>
            <button className="btn subtle speak-btn" onClick={stopSpeak}>
              {t('stopBtn')}
            </button>
          </div>
        </div>

        <div className="kid-card mission">
          <h3>{t('missionOfDay')}</h3>
          <p className="kid-question">{mission}</p>
          <div className="kid-btn-row">
            <button
              className="btn primary speak-btn"
              onClick={() =>
                speak(
                  lang === 'zh'
                    ? `今天的特别任务是：${mission.replace(/[^\u4e00-\u9fff\w\s.,!?！？：、0-9-]/g, '')}。这个任务很好玩，因为你可以当小帮手，让大家都开心。你一定可以做到！`
                    : `Today's special mission is: ${mission.replace(/[^\w\s.,!?'-]/g, '')}. This mission is fun because you get to be a big helper and make everyone smile. I know you can do it!`,
                  lang,
                )
              }
            >
              {t('listenMission')}
            </button>
            <button className="btn subtle speak-btn" onClick={stopSpeak}>
              {t('stopBtn')}
            </button>
          </div>
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
                  {a.emoji && <span className="kid-activity-emoji">{a.emoji}</span>}
                  <span>
                    {a.time && <div className="time-big small">{prettyTime(a.time)}</div>}
                    <strong>{a.title}</strong>
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

      {showKidUnlock && (
        <SimpleUnlockModal
          kidName={kid.name}
          onUnlock={() => {
            setKidUnlocked(true)
            setShowKidUnlock(false)
          }}
          onClose={() => setShowKidUnlock(false)}
        />
      )}
    </div>
  )
}

/** Easier unlock just for this page — a grown-up shoulder-check, not a fortress */
function SimpleUnlockModal({ kidName, onUnlock, onClose }: { kidName: string; onUnlock: () => void; onClose: () => void }) {
  const [answer, setAnswer] = useState('')
  const [q] = useState(() => {
    const a = 11 + Math.floor(Math.random() * 8)
    const b = 12 + Math.floor(Math.random() * 7)
    return { a, b, answer: a + b }
  })
  const check = () => {
    if (Number(answer.trim()) === q.answer) onUnlock()
    else setAnswer('')
  }
  return (
    <Modal title={t('kidUnlockTitle', { name: kidName })} onClose={onClose}>
      <div className="form">
        <label>
          {t('simpleUnlockQ', { a: q.a, b: q.b })}
          <input
            autoFocus
            inputMode="numeric"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && check()}
          />
        </label>
        <div className="form-actions">
          <span className="spacer" />
          <button className="btn primary" onClick={check} disabled={!answer.trim()}>
            {t('unlock')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
