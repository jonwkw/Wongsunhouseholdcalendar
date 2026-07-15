import { useEffect, useRef, useState } from 'react'
import type { TouchEvent as ReactTouchEvent } from 'react'
import { useApp, uid } from '../store'
import { activitiesOn, addDays, prettyDate, prettyTime, relativeLabel, todayKey, fromKey, weekdayName } from '../utils/dates'
import { useForecast } from '../utils/useForecast'
import { weatherEmoji } from '../utils/weather'
import { mathProblemFor, missionFor, wordFor, cnWordFor, rocketFor, ROCKETS, CHINESE_WORDS } from '../data/kidContent'
import type { WordOfDay, ChineseWordOfDay, MathProblem } from '../data/kidContent'
import { RocketShip } from './RocketShip'
import { t, getLang } from '../i18n'
import { speak, stopSpeak } from '../utils/speech'
import { Modal } from './shared'
import { setDragPayload, getDragPayload, leavesTarget } from '../utils/dnd'

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
  const [showSpellTest, setShowSpellTest] = useState(false)
  const [showCnTest, setShowCnTest] = useState(false)
  const [showMathTest, setShowMathTest] = useState(false)
  const canEdit = !locked || kidUnlocked
  const launchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const kid = data.members.find((m) => m.isChild) ?? data.members[0]
  const today = todayKey()
  const [selectedDay, setSelectedDay] = useState(today)
  const isFuture = selectedDay > today

  useEffect(() => () => {
    if (launchTimer.current) clearTimeout(launchTimer.current)
  }, [])

  // "Another one!" counters — each click deals the next challenge in the deck
  const [wordN, setWordN] = useState(0)
  const [cnWordN, setCnWordN] = useState(0)
  const [mathN, setMathN] = useState(0)
  const [missionN, setMissionN] = useState(0)

  const now = fromKey(today)
  const word = wordFor(now, wordN)
  const cnWord = cnWordFor(now, cnWordN)
  const math = mathProblemFor(now, mathN)
  const lang = getLang()
  const mission = missionFor(now, lang, missionN)

  /** Tasks that apply on a given day: daily ones + one-offs for that date */
  const itemsFor = (date: string) => data.kidChecklist.filter((i) => !i.date || i.date === date)

  const items = itemsFor(selectedDay)
  const checked = data.kidChecks[selectedDay] ?? []
  const skipped = data.kidSkips[selectedDay] ?? []
  const effective = items.filter((i) => !skipped.includes(i.id))
  const dayDone = effective.length > 0 && effective.every((i) => checked.includes(i.id))

  // daily challenges Rosco has finished today (COMPLETE badges)
  const challenges = data.kidChallenges[today] ?? []
  const markChallenge = (id: string) =>
    update((d) => ({
      ...d,
      kidChallenges: {
        ...d.kidChallenges,
        [today]: Array.from(new Set([...(d.kidChallenges[today] ?? []), id])),
      },
    }))

  /** Adult switch: this task isn't needed today (doesn't count for fuel) */
  const toggleSkip = (itemId: string) => {
    if (locked) return
    update((d) => {
      const cur = d.kidSkips[selectedDay] ?? []
      const next = cur.includes(itemId) ? cur.filter((x) => x !== itemId) : [...cur, itemId]
      // recompute the day's star with the new skip list
      const dayItems = d.kidChecklist.filter((i) => (!i.date || i.date === selectedDay) && !next.includes(i.id))
      const checks = d.kidChecks[selectedDay] ?? []
      const done = dayItems.length > 0 && dayItems.every((i) => checks.includes(i.id))
      const starDays = done
        ? d.starDays.includes(selectedDay) ? d.starDays : [...d.starDays, selectedDay]
        : d.starDays.filter((x) => x !== selectedDay)
      return { ...d, kidSkips: { ...d.kidSkips, [selectedDay]: next }, starDays }
    })
  }

  // Mechanism: each FULLY completed day (adult skips honoured) fills ONE of
  // the five fuel tanks; five tanks = lift-off. The next tank shows partial
  // fill as today's tasks tick along.
  const totalTanks = data.starDays.length + data.bonusFuel
  const launches = Math.floor(totalTanks / 5)
  const tank = totalTanks % 5
  const { rocket, level } = rocketFor(launches)
  const todaySkipped = data.kidSkips[today] ?? []
  const todayItems = itemsFor(today).filter((i) => !todaySkipped.includes(i.id))
  const todayChecked = data.kidChecks[today] ?? []
  const todayFraction = data.starDays.includes(today)
    ? 0
    : todayItems.length === 0
      ? 0
      : todayItems.filter((i) => todayChecked.includes(i.id)).length / todayItems.length

  /** Full-gauge moment, then the usual lift-off animation */
  const playLaunch = (fromLevel: number) => {
    setCelebrateLevel(Math.min(fromLevel, ROCKETS.length - 1))
    setLaunching(false)
    if (launchTimer.current) clearTimeout(launchTimer.current)
    launchTimer.current = setTimeout(() => {
      setLaunching(true)
      launchTimer.current = setTimeout(() => {
        setLaunching(false)
        setCelebrateLevel(null)
      }, 3200)
    }, 1200)
  }

  // Super bonus (adult-gated): FIVE tanks at once — a whole lift-off,
  // with any part-filled progress carried to the next rocket.
  const [showSuperBonus, setShowSuperBonus] = useState(false)
  const grantSuperBonus = () => {
    setShowSuperBonus(false)
    update((d) => {
      playLaunch(Math.floor((d.starDays.length + d.bonusFuel) / 5))
      return { ...d, bonusFuel: d.bonusFuel + 5 }
    })
  }

  /** Fuel control: one tank at a time for corrections */
  const addTank = () => {
    setShowSuperBonus(false)
    update((d) => {
      const total = d.starDays.length + d.bonusFuel
      if ((total + 1) % 5 === 0) playLaunch(Math.floor(total / 5))
      return { ...d, bonusFuel: d.bonusFuel + 1 }
    })
  }
  const removeTank = () => {
    setShowSuperBonus(false)
    update((d) => {
      if (d.bonusFuel > 0) return { ...d, bonusFuel: d.bonusFuel - 1 }
      if (d.starDays.length > 0) return { ...d, starDays: d.starDays.slice(0, -1) }
      return d
    })
  }

  const toggleCheck = (itemId: string) => {
    if (isFuture || !canEdit) return
    update((d) => {
      const cur = d.kidChecks[selectedDay] ?? []
      const next = cur.includes(itemId) ? cur.filter((x) => x !== itemId) : [...cur, itemId]
      const daySkips = d.kidSkips[selectedDay] ?? []
      const dayItems = d.kidChecklist.filter((i) => (!i.date || i.date === selectedDay) && !daySkips.includes(i.id))
      const done = dayItems.length > 0 && dayItems.every((i) => next.includes(i.id))
      const wasDone = d.starDays.includes(selectedDay)
      const starDays = done
        ? wasDone ? d.starDays : [...d.starDays, selectedDay]
        : d.starDays.filter((x) => x !== selectedDay)
      // the 5th tank filling launches the CURRENT rocket
      const before = d.starDays.length + d.bonusFuel
      const after = starDays.length + d.bonusFuel
      if (Math.floor(after / 5) > Math.floor(before / 5)) {
        playLaunch(Math.floor(before / 5))
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

  // swipe a mission row left (touch) to reveal edit/delete/skip actions
  const [swipedId, setSwipedId] = useState<string | null>(null)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)

  const onRowTouchStart = (e: ReactTouchEvent) => {
    swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onRowTouchEnd = (itemId: string) => (e: ReactTouchEvent) => {
    if (!swipeStart.current) return
    const dx = e.changedTouches[0].clientX - swipeStart.current.x
    const dy = Math.abs(e.changedTouches[0].clientY - swipeStart.current.y)
    swipeStart.current = null
    if (dy > 40) return
    if (dx < -50) setSwipedId(itemId)
    else if (dx > 50 || swipedId === itemId) setSwipedId(null)
  }

  const renameItem = (item: { id: string; text: string; textZh?: string }) => {
    const current = getLang() === 'zh' && item.textZh ? item.textZh : item.text
    const next = window.prompt(t('renameMission'), current)
    if (!next?.trim()) return
    update((d) => ({
      ...d,
      kidChecklist: d.kidChecklist.map((x) =>
        x.id === item.id
          ? getLang() === 'zh'
            ? { ...x, textZh: next.trim() }
            : { ...x, text: next.trim() }
          : x,
      ),
    }))
    setSwipedId(null)
  }

  const [dropTarget, setDropTarget] = useState<string | null>(null)

  /** Drop `dragId` at `overId`'s position in the checklist */
  const reorderTo = (dragId: string, overId: string) => {
    if (dragId === overId) return
    update((d) => {
      const list = [...d.kidChecklist]
      const from = list.findIndex((x) => x.id === dragId)
      const to = list.findIndex((x) => x.id === overId)
      if (from < 0 || to < 0) return d
      const [it] = list.splice(from, 1)
      list.splice(to, 0, it)
      return { ...d, kidChecklist: list }
    })
  }

  /** Arrow buttons in edit mode — reordering for touch screens */
  const nudgeItem = (id: string, dir: -1 | 1) => {
    update((d) => {
      const list = [...d.kidChecklist]
      const i = list.findIndex((x) => x.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= list.length) return d
      ;[list[i], list[j]] = [list[j], list[i]]
      return { ...d, kidChecklist: list }
    })
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
          <div key={item.id} className="swipe-row">
          <label
            className={`checklist-item ${checked.includes(item.id) ? 'done' : ''} ${isFuture || !canEdit ? 'locked' : ''} ${skipped.includes(item.id) ? 'skipped' : ''} ${dropTarget === item.id ? 'drop-target' : ''} ${swipedId === item.id ? 'swiped' : ''}`}
            onTouchStart={onRowTouchStart}
            onTouchEnd={onRowTouchEnd(item.id)}
            draggable={canEdit}
            onDragStart={(e) => setDragPayload(e, { kind: 'check-item', id: item.id })}
            onDragOver={(e) => {
              e.preventDefault()
              setDropTarget(item.id)
            }}
            onDragLeave={(e) => {
              if (leavesTarget(e) && dropTarget === item.id) setDropTarget(null)
            }}
            onDrop={(e) => {
              e.preventDefault()
              setDropTarget(null)
              const p = getDragPayload<{ kind: string; id: string }>(e)
              if (p?.kind === 'check-item') reorderTo(p.id, item.id)
            }}
          >
            {canEdit && <span className="drag-handle" title="Drag to reorder">⠿</span>}
            <input
              type="checkbox"
              checked={checked.includes(item.id)}
              disabled={isFuture || !canEdit || skipped.includes(item.id)}
              onChange={() => toggleCheck(item.id)}
            />
            <span className="checklist-emoji">{item.emoji}</span>
            <span className="checklist-text">
              {getLang() === 'zh' && item.textZh ? item.textZh : item.text}
              {item.date && <span className="oneoff-tag">📅 {prettyDate(item.date)}</span>}
              {skipped.includes(item.id) && <span className="skip-tag">{t('notNeededTag')}</span>}
            </span>
            {!locked && (
              <button
                className={`icon-btn tiny skip-btn ${skipped.includes(item.id) ? 'on' : ''}`}
                title={t('notNeeded')}
                onClick={(e) => {
                  e.preventDefault()
                  toggleSkip(item.id)
                }}
              >
                🙅
              </button>
            )}
            {editList && (
              <span className="reorder-btns">
                <button className="icon-btn tiny" onClick={(e) => { e.preventDefault(); nudgeItem(item.id, -1) }}>
                  ▲
                </button>
                <button className="icon-btn tiny" onClick={(e) => { e.preventDefault(); nudgeItem(item.id, 1) }}>
                  ▼
                </button>
              </span>
            )}
            {editList && (
              <button className="icon-btn tiny" onClick={(e) => { e.preventDefault(); removeItem(item.id) }}>
                ✕
              </button>
            )}
          </label>
          {swipedId === item.id && canEdit && (
            <div className="swipe-actions">
              <button className="swipe-act edit" onClick={() => renameItem(item)}>✏️</button>
              {!locked && (
                <button className="swipe-act skip" onClick={() => { toggleSkip(item.id); setSwipedId(null) }}>🙅</button>
              )}
              <button className="swipe-act del" onClick={() => { removeItem(item.id); setSwipedId(null) }}>🗑️</button>
            </div>
          )}
          </div>
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
        <button className="super-bonus-btn" onClick={() => setShowSuperBonus(true)}>
          ⭐ {t('superBonus')}
        </button>
      </div>
      </div>

      <div className="kid-daily">
        <div className={`kid-card word ${challenges.includes(`word:${wordN}`) ? 'challenge-done' : ''}`}>
          {challenges.includes(`word:${wordN}`) && <span className="done-badge">{t('completeTag')}</span>}
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
            <button className="btn subtle test-btn" onClick={() => setShowSpellTest(true)}>
              {t('testMe')}
            </button>
            <button className="btn subtle" onClick={() => { stopSpeak(); setWordN((n) => Math.max(0, n - 1)) }}>
              ◀
            </button>
            <button className="btn subtle" onClick={() => { stopSpeak(); setWordN((n) => n + 1) }}>
              {t('nextOne')}
            </button>
          </div>
        </div>

        <div className={`kid-card cnword ${challenges.includes(`cnword:${cnWordN}`) ? 'challenge-done' : ''}`}>
          {challenges.includes(`cnword:${cnWordN}`) && <span className="done-badge">{t('completeTag')}</span>}
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
            <button className="btn subtle test-btn" onClick={() => setShowCnTest(true)}>
              {t('testMe')}
            </button>
            <button className="btn subtle" onClick={() => { stopSpeak(); setCnWordN((n) => Math.max(0, n - 1)) }}>
              ◀
            </button>
            <button className="btn subtle" onClick={() => { stopSpeak(); setCnWordN((n) => n + 1) }}>
              {t('nextOne')}
            </button>
          </div>
        </div>

        <div className={`kid-card math ${challenges.includes(`math:${mathN}`) ? 'challenge-done' : ''}`}>
          {challenges.includes(`math:${mathN}`) && <span className="done-badge">{t('completeTag')}</span>}
          <h3>{t('mathOfDay')}</h3>
          <p className="kid-question">{lang === 'zh' ? math.questionZh : math.question}</p>
          {showAnswer && (
            <div className="kid-answer">
              {t('answerIs', { n: math.answer })}
              {!challenges.includes(`math:${mathN}`) && (
                <button className="btn primary gotit-btn" onClick={() => markChallenge(`math:${mathN}`)}>
                  {t('gotIt')}
                </button>
              )}
            </div>
          )}
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
            <button className="btn subtle test-btn" onClick={() => setShowMathTest(true)}>
              {t('testMe')}
            </button>
            <button className="btn subtle" onClick={() => { stopSpeak(); setShowAnswer(false); setMathN((n) => Math.max(0, n - 1)) }}>
              ◀
            </button>
            <button className="btn subtle" onClick={() => { stopSpeak(); setShowAnswer(false); setMathN((n) => n + 1) }}>
              {t('nextOne')}
            </button>
          </div>
        </div>

        <div className={`kid-card mission ${challenges.includes(`mission:${missionN}`) ? 'challenge-done' : ''}`}>
          {challenges.includes(`mission:${missionN}`) && <span className="done-badge">{t('completeTag')}</span>}
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
            <button className="btn subtle" onClick={() => { stopSpeak(); setMissionN((n) => Math.max(0, n - 1)) }}>
              ◀
            </button>
            <button className="btn subtle" onClick={() => { stopSpeak(); setMissionN((n) => n + 1) }}>
              {t('nextOne')}
            </button>
            {!challenges.includes(`mission:${missionN}`) && (
              <button className="btn primary" onClick={() => markChallenge(`mission:${missionN}`)}>
                {t('didIt')}
              </button>
            )}
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

      {showSuperBonus && (
        <SuperBonusModal
          kidName={kid.name}
          tank={tank}
          launches={launches}
          onGrant={grantSuperBonus}
          onAddTank={addTank}
          onRemove={removeTank}
          onClose={() => setShowSuperBonus(false)}
        />
      )}
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
      {showSpellTest && (
        <SpellTestModal
          word={word}
          mode={now.getDate() % 2 === 0 ? 'full' : 'missing'}
          onWin={() => markChallenge(`word:${wordN}`)}
          onClose={() => { stopSpeak(); setShowSpellTest(false) }}
        />
      )}
      {showMathTest && (
        <MathTestModal
          problem={math}
          lang={lang}
          onWin={() => markChallenge(`math:${mathN}`)}
          onClose={() => { stopSpeak(); setShowMathTest(false) }}
        />
      )}
      {showCnTest && (
        <CnTestModal
          word={cnWord}
          mode={now.getDate() % 2 === 0 ? 'sound' : 'meaning'}
          onWin={() => markChallenge(`cnword:${cnWordN}`)}
          onClose={() => { stopSpeak(); setShowCnTest(false) }}
        />
      )}
    </div>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Tile {
  id: number
  ch: string
  used: boolean
}

/** Which letter positions the kid must fill: all of them, or 2 blanked-out ones */
function blanksFor(target: string, mode: 'full' | 'missing'): number[] {
  if (mode === 'full') return target.split('').map((_, i) => i)
  const count = target.length >= 6 ? 3 : 2
  // deterministic-ish spread: every ~len/count-th letter
  const step = Math.max(1, Math.floor(target.length / count))
  const picks: number[] = []
  for (let i = 1; picks.length < count && i < target.length; i += step) picks.push(i)
  return picks
}

function makeTiles(target: string, blanks: number[]): Tile[] {
  const needed = blanks.map((i) => target[i])
  const decoys = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter((c) => !target.includes(c))).slice(0, 3)
  return shuffle([...needed, ...decoys]).map((ch, id) => ({ id, ch, used: false }))
}

/** Spelling game: hear the word, tap its letters in order from a shuffled pool.
 * Alternates daily between spelling the whole word and filling missing letters. */
function SpellTestModal({ word, mode, onWin, onClose }: { word: WordOfDay; mode: 'full' | 'missing'; onWin: () => void; onClose: () => void }) {
  const target = word.word.toLowerCase()
  const [blanks] = useState(() => blanksFor(target, mode))
  const [tiles, setTiles] = useState<Tile[]>(() => makeTiles(target, blanks))
  const [progress, setProgress] = useState(0)
  const [wrongId, setWrongId] = useState<number | null>(null)
  const done = progress >= blanks.length

  const sayWord = () => speak(`Can you spell the word: ${word.word}? ${word.word} means ${word.meaning}.`)
  useEffect(() => {
    sayWord()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tap = (tile: Tile) => {
    if (tile.used || done) return
    if (tile.ch === target[blanks[progress]]) {
      setTiles((ts) => ts.map((x) => (x.id === tile.id ? { ...x, used: true } : x)))
      const next = progress + 1
      setProgress(next)
      if (next >= blanks.length) {
        speak(`${target.split('').join('. ')}. spells ${word.word}! Amazing job!`)
        onWin()
      }
    } else {
      setWrongId(tile.id)
      setTimeout(() => setWrongId(null), 450)
    }
  }

  const reset = () => {
    setTiles(makeTiles(target, blanks))
    setProgress(0)
    sayWord()
  }

  return (
    <Modal title={t('spellTitle')} onClose={onClose} cover>
      <p className="hint" style={{ marginTop: 0 }}>{t('spellHint')}</p>
      <div className="spell-slots">
        {target.split('').map((ch, i) => {
          const blankPos = blanks.indexOf(i)
          const isBlank = blankPos >= 0
          const filled = !isBlank || blankPos < progress
          return (
            <span key={i} className={`spell-slot ${filled ? 'filled' : ''} ${!isBlank ? 'given' : ''}`}>
              {filled ? ch : ''}
            </span>
          )
        })}
      </div>
      {done ? (
        <div className="test-celebrate">
          <div className="test-word">🎉 {word.word} 🎉</div>
          <div className="kid-btn-row">
            <button className="btn primary" onClick={reset}>{t('playAgain')}</button>
            <button className="btn subtle" onClick={onClose}>{t('doneBtn')}</button>
          </div>
        </div>
      ) : (
        <>
          <div className="letter-tiles">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                className={`letter-tile ${tile.used ? 'used' : ''} ${wrongId === tile.id ? 'wrong' : ''}`}
                disabled={tile.used}
                onClick={() => tap(tile)}
              >
                {tile.ch}
              </button>
            ))}
          </div>
          <div className="kid-btn-row">
            <button className="btn subtle speak-btn" onClick={sayWord}>{t('sayAgain')}</button>
            <button className="btn subtle speak-btn" onClick={stopSpeak}>{t('stopBtn')}</button>
          </div>
        </>
      )}
    </Modal>
  )
}

/** Maths game: tap the right answer from four choices */
function MathTestModal({ problem, lang, onWin, onClose }: { problem: MathProblem; lang: 'en' | 'zh'; onWin: () => void; onClose: () => void }) {
  const answer = Number(problem.answer)
  const [choices] = useState(() => {
    const pool = new Set<number>([answer])
    const near = [answer + 1, answer - 1, answer + 2, answer - 2, answer + 3, answer - 3, answer + 10]
    for (const n of shuffle(near)) {
      if (pool.size >= 4) break
      if (n >= 0 && !pool.has(n)) pool.add(n)
    }
    return shuffle([...pool])
  })
  const [wrong, setWrong] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const sayIt = () => speak(lang === 'zh' ? problem.questionZh : problem.question, lang)
  useEffect(() => {
    sayIt()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tap = (n: number) => {
    if (done) return
    if (n === answer) {
      setDone(true)
      speak(
        lang === 'zh' ? `答对了！答案是 ${answer}！你真棒！` : `That's right! The answer is ${answer}! Amazing job!`,
        lang,
      )
      onWin()
    } else {
      setWrong(n)
      setTimeout(() => setWrong(null), 450)
    }
  }

  return (
    <Modal title={t('mathTestTitle')} onClose={onClose} cover>
      <p className="hint" style={{ marginTop: 0 }}>{t('mathTestHint')}</p>
      <p className="cn-meaning-prompt">{lang === 'zh' ? problem.questionZh : problem.question}</p>
      {done ? (
        <div className="test-celebrate">
          <div className="test-word">🎉 {problem.answer} 🎉</div>
          <div className="kid-btn-row">
            <button className="btn subtle" onClick={onClose}>{t('doneBtn')}</button>
          </div>
        </div>
      ) : (
        <>
          <div className="cn-choices">
            {choices.map((n) => (
              <button key={n} className={`cn-choice math-choice ${wrong === n ? 'wrong' : ''}`} onClick={() => tap(n)}>
                {n}
              </button>
            ))}
          </div>
          <div className="kid-btn-row">
            <button className="btn subtle speak-btn" onClick={sayIt}>{t('sayAgain')}</button>
            <button className="btn subtle speak-btn" onClick={stopSpeak}>{t('stopBtn')}</button>
          </div>
        </>
      )}
    </Modal>
  )
}

/** Listening game: hear the Chinese word, tap the matching character.
 * Alternates daily: find the character you HEARD, or the one matching a MEANING. */
function CnTestModal({ word, mode, onWin, onClose }: { word: ChineseWordOfDay; mode: 'sound' | 'meaning'; onWin: () => void; onClose: () => void }) {
  const [choices] = useState(() =>
    shuffle([word, ...shuffle(CHINESE_WORDS.filter((w) => w.hanzi !== word.hanzi)).slice(0, 2)]),
  )
  const [wrong, setWrong] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const sayWord = () =>
    mode === 'sound'
      ? speak(`听一听：${word.hanzi}。${word.hanzi}。哪一个字是 ${word.hanzi}？`, 'zh')
      : speak(`找一找：哪个字的意思是——${word.meaningZh}？`, 'zh')
  useEffect(() => {
    sayWord()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tap = (hanzi: string) => {
    if (done) return
    if (hanzi === word.hanzi) {
      setDone(true)
      speak(`答对了！${word.hanzi}，就是${word.meaningZh}。${word.sentence} 你真棒！`, 'zh')
      onWin()
    } else {
      setWrong(hanzi)
      setTimeout(() => setWrong(null), 450)
    }
  }

  return (
    <Modal title={t('cnTestTitle')} onClose={onClose} cover>
      <p className="hint" style={{ marginTop: 0 }}>
        {mode === 'sound' ? t('cnTestHint') : t('cnTestHintMeaning')}
      </p>
      {mode === 'meaning' && !done && <p className="cn-meaning-prompt">“{word.meaning}” · {word.meaningZh}</p>}
      {done ? (
        <div className="test-celebrate">
          <div className="test-word">🎉 {word.hanzi} 🎉</div>
          <p className="kid-meaning">{word.pinyin} · {word.meaning}</p>
          <p className="kid-sentence">“{word.sentence}”</p>
          <div className="kid-btn-row">
            <button className="btn subtle" onClick={onClose}>{t('doneBtn')}</button>
          </div>
        </div>
      ) : (
        <>
          <div className="cn-choices">
            {choices.map((c) => (
              <button
                key={c.hanzi}
                className={`cn-choice ${wrong === c.hanzi ? 'wrong' : ''}`}
                onClick={() => tap(c.hanzi)}
              >
                {c.hanzi}
              </button>
            ))}
          </div>
          <div className="kid-btn-row">
            <button className="btn subtle speak-btn" onClick={sayWord}>{t('sayAgain')}</button>
            <button className="btn subtle speak-btn" onClick={stopSpeak}>{t('stopBtn')}</button>
          </div>
        </>
      )}
    </Modal>
  )
}

/** Adult-gated fuel control: one grown-up maths solve, then add a bonus cell
 * for something SUPER special — or take one back to fix a mistake. */
function SuperBonusModal({
  kidName,
  tank,
  launches,
  onGrant,
  onAddTank,
  onRemove,
  onClose,
}: {
  kidName: string
  tank: number
  launches: number
  onGrant: () => void
  onAddTank: () => void
  onRemove: () => void
  onClose: () => void
}) {
  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState(false)
  const [solved, setSolved] = useState(false)
  const [q] = useState(() => {
    const a = 6 + Math.floor(Math.random() * 4)
    const b = 6 + Math.floor(Math.random() * 4)
    const c = 2 + Math.floor(Math.random() * 8)
    return { text: `${a} × ${b} + ${c}`, answer: a * b + c }
  })
  const check = () => {
    if (Number(answer.trim()) === q.answer) setSolved(true)
    else {
      setWrong(true)
      setAnswer('')
    }
  }
  return (
    <Modal title={t('superBonusTitle')} onClose={onClose}>
      <div className="form">
        {!solved ? (
          <>
            <p className="hint" style={{ marginTop: 0 }}>{t('superBonusDesc', { name: kidName })}</p>
            <label>
              {t('lockQuestion')}
              <div className="lock-question">{q.text} = ?</div>
              <input
                autoFocus
                inputMode="numeric"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && check()}
              />
            </label>
            {wrong && <p className="lock-wrong">{t('wrongAnswer')}</p>}
            <div className="form-actions">
              <span className="spacer" />
              <button className="btn primary" onClick={check} disabled={!answer.trim()}>
                {t('unlock')}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="fuel-now">{t('fuelNow', { tank, n: launches })}</p>
            <div className="kid-btn-row" style={{ justifyContent: 'center' }}>
              <button className="btn primary" onClick={onGrant}>
                {t('superBonusGo')}
              </button>
              <button className="btn subtle" onClick={onAddTank}>
                {t('addFuelCell')}
              </button>
              <button className="btn danger" onClick={onRemove} disabled={launches === 0}>
                {t('removeFuelCell')}
              </button>
            </div>
            <p className="hint" style={{ textAlign: 'center' }}>{t('fuelAdjustHint')}</p>
          </>
        )}
      </div>
    </Modal>
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
