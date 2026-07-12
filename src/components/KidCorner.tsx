import { useEffect, useRef, useState } from 'react'
import type { TouchEvent as ReactTouchEvent } from 'react'
import { useApp, uid } from '../store'
import { activitiesOn, addDays, prettyDate, prettyTime, relativeLabel, todayKey, fromKey, weekdayName } from '../utils/dates'
import { useForecast } from '../utils/useForecast'
import { weatherEmoji } from '../utils/weather'
import { mathProblemFor, missionFor, wordFor, cnWordFor, rocketFor, ROCKETS, CHINESE_WORDS } from '../data/kidContent'
import type { WordOfDay, ChineseWordOfDay } from '../data/kidContent'
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

  const totalDays = data.starDays.length + data.bonusFuel
  const launches = Math.floor(totalDays / 5)
  const tank = totalDays % 5

  // Super bonus (adult-gated): the current tank fills right up — no shortcut
  // theatrics, just fuel. Rosco sees the FULL tank first, then the rocket
  // lifts off by the normal rule (a full tank always launches).
  const [showSuperBonus, setShowSuperBonus] = useState(false)
  const grantSuperBonus = () => {
    setShowSuperBonus(false)
    update((d) => {
      const total = d.starDays.length + d.bonusFuel
      const need = 5 - (total % 5) // whatever it takes to fill this tank
      // show the old rocket with its brimming tank for a moment…
      setCelebrateLevel(Math.min(Math.floor(total / 5), ROCKETS.length - 1))
      setLaunching(false)
      if (launchTimer.current) clearTimeout(launchTimer.current)
      // …then the usual lift-off plays out
      launchTimer.current = setTimeout(() => {
        setLaunching(true)
        launchTimer.current = setTimeout(() => {
          setLaunching(false)
          setCelebrateLevel(null)
        }, 3200)
      }, 1400)
      return { ...d, bonusFuel: d.bonusFuel + need }
    })
  }
  const { rocket, level } = rocketFor(launches)
  const todaySkipped = data.kidSkips[today] ?? []
  const todayItems = itemsFor(today).filter((i) => !todaySkipped.includes(i.id))
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
      const daySkips = d.kidSkips[selectedDay] ?? []
      const dayItems = d.kidChecklist.filter((i) => (!i.date || i.date === selectedDay) && !daySkips.includes(i.id))
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
            {!locked && !isFuture && (
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
        <div className={`kid-card word ${challenges.includes('word') ? 'challenge-done' : ''}`}>
          {challenges.includes('word') && <span className="done-badge">{t('completeTag')}</span>}
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

        <div className={`kid-card cnword ${challenges.includes('cnword') ? 'challenge-done' : ''}`}>
          {challenges.includes('cnword') && <span className="done-badge">{t('completeTag')}</span>}
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

        <div className={`kid-card math ${challenges.includes('math') ? 'challenge-done' : ''}`}>
          {challenges.includes('math') && <span className="done-badge">{t('completeTag')}</span>}
          <h3>{t('mathOfDay')}</h3>
          <p className="kid-question">{lang === 'zh' ? math.questionZh : math.question}</p>
          {showAnswer && (
            <div className="kid-answer">
              {t('answerIs', { n: math.answer })}
              {!challenges.includes('math') && (
                <button className="btn primary gotit-btn" onClick={() => markChallenge('math')}>
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
            <button className="btn subtle" onClick={() => { stopSpeak(); setShowAnswer(false); setMathN((n) => Math.max(0, n - 1)) }}>
              ◀
            </button>
            <button className="btn subtle" onClick={() => { stopSpeak(); setShowAnswer(false); setMathN((n) => n + 1) }}>
              {t('nextOne')}
            </button>
          </div>
        </div>

        <div className={`kid-card mission ${challenges.includes('mission') ? 'challenge-done' : ''}`}>
          {challenges.includes('mission') && <span className="done-badge">{t('completeTag')}</span>}
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
            {!challenges.includes('mission') && (
              <button className="btn primary" onClick={() => markChallenge('mission')}>
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
          onGrant={grantSuperBonus}
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
          onWin={() => markChallenge('word')}
          onClose={() => { stopSpeak(); setShowSpellTest(false) }}
        />
      )}
      {showCnTest && (
        <CnTestModal
          word={cnWord}
          mode={now.getDate() % 2 === 0 ? 'sound' : 'meaning'}
          onWin={() => markChallenge('cnword')}
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

/** Adult-gated instant full tank for something SUPER special (helped grandma,
 * brave at the dentist…). The grown-up maths keeps little fingers out. */
function SuperBonusModal({ kidName, onGrant, onClose }: { kidName: string; onGrant: () => void; onClose: () => void }) {
  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState(false)
  const [q] = useState(() => {
    const a = 6 + Math.floor(Math.random() * 4)
    const b = 6 + Math.floor(Math.random() * 4)
    const c = 2 + Math.floor(Math.random() * 8)
    return { text: `${a} × ${b} + ${c}`, answer: a * b + c }
  })
  const check = () => {
    if (Number(answer.trim()) === q.answer) onGrant()
    else {
      setWrong(true)
      setAnswer('')
    }
  }
  return (
    <Modal title={t('superBonusTitle')} onClose={onClose}>
      <div className="form">
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
            {t('superBonusGo')}
          </button>
        </div>
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
