import { useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import type { Dish, MealSlot, MenuEntry } from '../types'
import { useApp, uid } from '../store'
import { addDays, fromKey, mondayOf, prettyDate, todayKey, weekDays } from '../utils/dates'
import { t, dayShort } from '../i18n'
import type { TKey } from '../i18n'
import { MemberChips, MemberToggle, Modal, tagColor } from './shared'
import { MemberFace } from './avatars'
import { setDragPayload, getDragPayload, leavesTarget } from '../utils/dnd'

const FOOD_TYPES = ['meat', 'veg', 'carb', 'soup', 'fruit', 'other']
const CUISINES = ['chinese', 'malay', 'indian', 'western', 'japanese', 'other']

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']
const slotLabel = (s: MealSlot): string =>
  s === 'breakfast' ? t('breakfast') : s === 'lunch' ? t('lunch') : t('dinner')

export function MenuPlanner() {
  const { data, update, locked } = useApp()
  const today = todayKey()
  const [monday, setMonday] = useState(() => mondayOf(today))
  const [placingDish, setPlacingDish] = useState<Dish | null>(null)
  const [showDishForm, setShowDishForm] = useState(false)
  const [groupBy, setGroupBy] = useState<'none' | 'type' | 'cuisine'>('none')

  /** Most recent date (up to today) a dish appeared on the menu */
  const lastServed = (dishName: string): string | null => {
    const dates = data.menuEntries
      .filter((m) => m.dishName === dishName && m.date <= today)
      .map((m) => m.date)
      .sort()
    return dates.length ? dates[dates.length - 1] : null
  }

  const daysSince = (dateKey: string | null): number | null => {
    if (!dateKey) return null
    return Math.round((fromKey(today).getTime() - fromKey(dateKey).getTime()) / 86400000)
  }

  /** Average of everyone's stars across every time this dish was served */
  const avgRating = (dishName: string): number | null => {
    const all = data.menuEntries
      .filter((m) => m.dishName === dishName)
      .flatMap((m) => Object.values(m.ratings ?? {}))
    if (all.length === 0) return null
    return all.reduce((a, b) => a + b, 0) / all.length
  }

  // Recommendation score: well-rated dishes you haven't had in a while float up.
  // rating (default 3.5) counts double; every ~9 days since last served adds a point (capped).
  const recommended = [...data.dishes]
    .map((dish) => {
      const since = daysSince(lastServed(dish.name))
      return { dish, score: (avgRating(dish.name) ?? 3.5) * 2 + Math.min(since ?? 45, 45) / 9 }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.dish)

  const servedLabel = (dishName: string): string => {
    const since = daysSince(lastServed(dishName))
    if (since === null) return t('never')
    if (since === 0) return t('todayWord')
    return t('daysAgo', { n: since })
  }

  const groups: { label: string; dishes: Dish[] }[] =
    groupBy === 'none'
      ? [{ label: '', dishes: data.dishes }]
      : (groupBy === 'type' ? FOOD_TYPES : CUISINES)
          .map((key) => ({
            label: t((groupBy === 'type' ? `ft_${key}` : `cu_${key}`) as TKey),
            dishes: data.dishes.filter((d) => (groupBy === 'type' ? d.foodType ?? 'other' : d.cuisine ?? 'other') === key),
          }))
          .filter((g) => g.dishes.length > 0)
  const [typing, setTyping] = useState<{ date: string; slot: MealSlot } | null>(null)
  const [typedName, setTypedName] = useState('')
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<MenuEntry | null>(null)

  const days = useMemo(() => weekDays(monday), [monday])

  const addEntry = (date: string, slot: MealSlot, dishName: string, emoji: string) => {
    update((d) => ({
      ...d,
      menuEntries: [
        ...d.menuEntries,
        { id: uid('m'), date, slot, dishName, emoji, memberIds: [] },
      ],
    }))
  }

  const onDrop = (e: DragEvent, date: string, slot: MealSlot) => {
    e.preventDefault()
    setDragOver(null)
    const payload = getDragPayload<{ id: string }>(e)
    const dish = payload && data.dishes.find((x) => x.id === payload.id)
    if (dish) addEntry(date, slot, dish.name, dish.emoji)
  }

  const onCellClick = (date: string, slot: MealSlot) => {
    if (locked) return
    setTyping({ date, slot })
    setTypedName('')
  }

  const saveTyped = () => {
    if (typing && typedName.trim()) addEntry(typing.date, typing.slot, typedName.trim(), '🍽️')
    setTyping(null)
  }

  return (
    <div className="timetable-layout">
      <aside className="library">
        <h3>{t('dishLibrary')}</h3>

        {recommended.length > 0 && (
          <div className="rec-box">
            <div className="rec-title">{t('recommended')}</div>
            {recommended.map((dish) => (
              <button key={dish.id} className="rec-chip" onClick={() => !locked && setPlacingDish(dish)}>
                {dish.emoji} {dish.name}
              </button>
            ))}
          </div>
        )}

        <div className="group-toggle">
          {(['none', 'type', 'cuisine'] as const).map((g) => (
            <button key={g} className={`filter-btn ${groupBy === g ? 'on' : ''}`} onClick={() => setGroupBy(g)}>
              {t(g === 'none' ? 'groupNone' : g === 'type' ? 'groupType' : 'groupCuisine')}
            </button>
          ))}
        </div>

        {groups.map((g) => (
          <div key={g.label || 'all'}>
            {g.label && <div className="group-label">{g.label}</div>}
            {g.dishes.map((dish) => {
              const rating = avgRating(dish.name)
              return (
                <div
                  key={dish.id}
                  className="library-card dish"
                  draggable={!locked}
                  onDragStart={(e) => setDragPayload(e, { id: dish.id })}
                  onClick={() => !locked && setPlacingDish(dish)}
                >
                  <div className="dish-top">
                    <span className="card-emoji">{dish.emoji}</span>
                    <span className="card-title">{dish.name}</span>
                    {!locked && (
                      <button
                        className="icon-btn tiny"
                        onClick={(e) => {
                          e.stopPropagation()
                          update((d) => ({ ...d, dishes: d.dishes.filter((x) => x.id !== dish.id) }))
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {dish.description && <div className="dish-desc">{dish.description}</div>}
                  <div className="dish-meta">
                    <span>🕓 {t('lastServed')}: {servedLabel(dish.name)}</span>
                    {rating !== null && <span className="dish-stars">★ {rating.toFixed(1)}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        {!locked && (
          <button className="btn subtle full" onClick={() => setShowDishForm(true)}>
            {t('newDish')}
          </button>
        )}
      </aside>

      <div className="timetable-main">
        <div className="week-nav">
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, -7))}>{t('prevShort')}</button>
          <button className="btn subtle" onClick={() => setMonday(mondayOf(today))}>{t('thisWeek')}</button>
          <strong className="week-label">{t('menuWeekTitle')}</strong>
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, 7))}>{t('nextShort')}</button>
        </div>

        <div className="menu-grid" style={{ gridTemplateColumns: `90px repeat(7, minmax(0, 1fr))` }}>
          <div />
          {days.map((date) => {
            const d = fromKey(date)
            return (
              <div key={date} className={`menu-day-head ${date === today ? 'today' : ''}`}>
                {dayShort(d.getDay())} {d.getDate()}
                {date === today && <span className="today-tag">{t('today')}</span>}
              </div>
            )
          })}

          {SLOTS.map((slot) => (
            <MenuRow
              key={slot}
              slot={slot}
              days={days}
              dragOver={dragOver}
              setDragOver={setDragOver}
              onDrop={onDrop}
              onCellClick={onCellClick}
              onEntryClick={(entry) => !locked && setEditingEntry(entry)}
              typing={typing}
              typedName={typedName}
              setTypedName={setTypedName}
              saveTyped={saveTyped}
              cancelTyped={() => setTyping(null)}
            />
          ))}
        </div>

        <p className="hint">{t('tapMealHint')}</p>
      </div>

      {showDishForm && <DishModal onClose={() => setShowDishForm(false)} />}
      {editingEntry && <MealModal entry={editingEntry} onClose={() => setEditingEntry(null)} />}
      {placingDish && (
        <PlaceDishModal
          dish={placingDish}
          onPlace={(date, slot) => {
            addEntry(date, slot, placingDish.name, placingDish.emoji)
            setPlacingDish(null)
          }}
          onClose={() => setPlacingDish(null)}
        />
      )}
    </div>
  )
}

/** Pick which day and meal a clicked dish goes to */
function PlaceDishModal({
  dish,
  onPlace,
  onClose,
}: {
  dish: Dish
  onPlace: (date: string, slot: MealSlot) => void
  onClose: () => void
}) {
  const [date, setDate] = useState(todayKey())
  const [slot, setSlot] = useState<MealSlot>(dish.slot === 'breakfast' || dish.slot === 'lunch' || dish.slot === 'dinner' ? dish.slot : 'dinner')

  return (
    <Modal title={t('addDishTitle', { dish: `${dish.emoji} ${dish.name}` })} onClose={onClose}>
      <div className="form">
        <label>
          {t('whichDayQ')}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          {t('whichMeal')}
          <select value={slot} onChange={(e) => setSlot(e.target.value as MealSlot)}>
            {SLOTS.map((s) => (
              <option key={s} value={s}>
                {slotLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <div className="form-actions">
          <span className="spacer" />
          <button className="btn primary" onClick={() => onPlace(date, slot)}>
            {t('addToMenuBtn')}
          </button>
        </div>
      </div>
    </Modal>
  )
}

interface RowProps {
  slot: MealSlot
  days: string[]
  dragOver: string | null
  setDragOver: (k: string | null) => void
  onDrop: (e: DragEvent, date: string, slot: MealSlot) => void
  onCellClick: (date: string, slot: MealSlot) => void
  onEntryClick: (entry: MenuEntry) => void
  typing: { date: string; slot: MealSlot } | null
  typedName: string
  setTypedName: (v: string) => void
  saveTyped: () => void
  cancelTyped: () => void
}

function MenuRow(props: RowProps) {
  const { data } = useApp()
  const {
    slot, days, dragOver, setDragOver, onDrop, onCellClick, onEntryClick,
    typing, typedName, setTypedName, saveTyped, cancelTyped,
  } = props

  return (
    <>
      <div className="menu-slot-label">{slotLabel(slot)}</div>
      {days.map((date) => {
        const key = `${date}|${slot}`
        const entries = data.menuEntries.filter((m) => m.date === date && m.slot === slot)
        const isTyping = typing?.date === date && typing?.slot === slot
        return (
          <div
            key={key}
            className={`menu-cell ${dragOver === key ? 'drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'copy'
              setDragOver(key)
            }}
            onDragLeave={(e) => {
              if (leavesTarget(e) && dragOver === key) setDragOver(null)
            }}
            onDrop={(e) => onDrop(e, date, slot)}
            onClick={() => !isTyping && onCellClick(date, slot)}
          >
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="menu-entry"
                style={{ borderLeft: `4px solid ${tagColor(entry.memberIds, data.members)}` }}
                onClick={(e) => {
                  e.stopPropagation()
                  onEntryClick(entry)
                }}
              >
                <div className="menu-entry-top">
                  <span>{entry.emoji}</span>
                  <span className="menu-entry-name">{entry.dishName}</span>
                  {entry.ratings && Object.keys(entry.ratings).length > 0 && (
                    <span className="dish-stars">
                      ★{(Object.values(entry.ratings).reduce((a, b) => a + b, 0) / Object.values(entry.ratings).length).toFixed(1)}
                    </span>
                  )}
                </div>
                {entry.memberIds.length > 0 && (
                  <div className="menu-entry-tags">
                    <MemberChips memberIds={entry.memberIds} />
                  </div>
                )}
              </div>
            ))}
            {isTyping ? (
              <input
                autoFocus
                className="menu-inline-input"
                value={typedName}
                placeholder={t('typeDish')}
                onChange={(e) => setTypedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTyped()
                  if (e.key === 'Escape') cancelTyped()
                }}
                onBlur={saveTyped}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              entries.length === 0 && <span className="menu-empty">＋</span>
            )}
          </div>
        )
      })}
    </>
  )
}

/** Edit a placed meal: rename, tag people, rate it, or remove */
function MealModal({ entry, onClose }: { entry: MenuEntry; onClose: () => void }) {
  const { data, update } = useApp()
  const [name, setName] = useState(entry.dishName)
  const [memberIds, setMemberIds] = useState<string[]>(entry.memberIds)
  const [ratings, setRatings] = useState<Record<string, number>>(entry.ratings ?? {})
  const [rater, setRater] = useState<string>('')

  const save = () => {
    if (!name.trim()) return
    update((d) => ({
      ...d,
      menuEntries: d.menuEntries.map((m) =>
        m.id === entry.id ? { ...m, dishName: name.trim(), memberIds, ratings } : m,
      ),
    }))
    onClose()
  }

  const remove = () => {
    update((d) => ({ ...d, menuEntries: d.menuEntries.filter((m) => m.id !== entry.id) }))
    onClose()
  }

  return (
    <Modal title={`${slotLabel(entry.slot)} · ${prettyDate(entry.date)}`} onClose={onClose}>
      <div className="form">
        <label>
          {t('dish')}
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} />
        </label>
        <label>{t('whoFor')}</label>
        <MemberToggle selected={memberIds} onChange={setMemberIds} />

        <label>{t('rateMeal')}</label>
        <p className="hint" style={{ margin: 0 }}>{t('whoRating')}</p>
        <div className="rating-faces">
          {data.members.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`rating-face ${rater === m.id ? 'on' : ''}`}
              style={rater === m.id ? { borderColor: m.color, background: m.color + '22' } : undefined}
              onClick={() => setRater(rater === m.id ? '' : m.id)}
            >
              <MemberFace member={m} size={30} />
              {ratings[m.id] && <span className="rating-mini">★{ratings[m.id]}</span>}
            </button>
          ))}
        </div>
        {rater && (
          <div className="star-row">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`star-btn ${(ratings[rater] ?? 0) >= n ? 'on' : ''}`}
                onClick={() => setRatings((r) => ({ ...r, [rater]: n }))}
              >
                ★
              </button>
            ))}
          </div>
        )}

        <div className="form-actions">
          <button className="btn danger" onClick={remove}>
            {t('remove')}
          </button>
          <span className="spacer" />
          <button className="btn primary" onClick={save} disabled={!name.trim()}>
            {t('save')}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function DishModal({ onClose }: { onClose: () => void }) {
  const { update } = useApp()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🍽️')
  const [slot, setSlot] = useState<Dish['slot']>('any')
  const [description, setDescription] = useState('')
  const [foodType, setFoodType] = useState('other')
  const [cuisine, setCuisine] = useState('chinese')

  const FOOD_EMOJI = ['🍽️', '🍗', '🐟', '🥬', '🍜', '🥚', '🥞', '🍉', '🍚', '🍝', '🍕', '🥟', '🍤', '🥣', '🍞', '🧁']

  const save = () => {
    if (!name.trim()) return
    update((d) => ({
      ...d,
      dishes: [
        ...d.dishes,
        { id: uid('d'), name: name.trim(), emoji, slot, description: description.trim() || undefined, foodType, cuisine },
      ],
    }))
    onClose()
  }

  return (
    <Modal title={t('newDish').replace('＋ ', '')} onClose={onClose}>
      <div className="form">
        <label>
          {t('dishName')}
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t('egDish')} onKeyDown={(e) => e.key === 'Enter' && save()} />
        </label>
        <label>{t('icon')}</label>
        <div className="emoji-picker">
          {FOOD_EMOJI.map((e) => (
            <button key={e} type="button" className={`emoji-opt ${emoji === e ? 'on' : ''}`} onClick={() => setEmoji(e)}>
              {e}
            </button>
          ))}
        </div>
        <label>
          {t('description')}
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="form-row">
          <label>
            {t('foodTypeLabel')}
            <select value={foodType} onChange={(e) => setFoodType(e.target.value)}>
              {FOOD_TYPES.map((k) => (
                <option key={k} value={k}>{t(`ft_${k}` as TKey)}</option>
              ))}
            </select>
          </label>
          <label>
            {t('cuisineLabel')}
            <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
              {CUISINES.map((k) => (
                <option key={k} value={k}>{t(`cu_${k}` as TKey)}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          {t('usuallyForMeal')}
          <select value={slot} onChange={(e) => setSlot(e.target.value as Dish['slot'])}>
            <option value="any">{t('anyMeal')}</option>
            <option value="breakfast">{t('breakfastPlain')}</option>
            <option value="lunch">{t('lunchPlain')}</option>
            <option value="dinner">{t('dinnerPlain')}</option>
          </select>
        </label>
        <div className="form-actions">
          <span className="spacer" />
          <button className="btn primary" onClick={save} disabled={!name.trim()}>
            {t('addDish')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
