import { useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import type { Dish, MealSlot } from '../types'
import { useApp, uid } from '../store'
import { addDays, fromKey, mondayOf, todayKey, weekDays, DAY_SHORT } from '../utils/dates'
import { Avatar, Modal } from './shared'

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']
const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: '🌅 Breakfast',
  lunch: '☀️ Lunch',
  dinner: '🌙 Dinner',
  snack: '🍪 Snack',
}

export function MenuPlanner() {
  const { data, update, currentMember } = useApp()
  const today = todayKey()
  const [monday, setMonday] = useState(() => mondayOf(today))
  const [armedDish, setArmedDish] = useState<string | null>(null)
  const [showDishForm, setShowDishForm] = useState(false)
  const [typing, setTyping] = useState<{ date: string; slot: MealSlot } | null>(null)
  const [typedName, setTypedName] = useState('')
  const [dragOver, setDragOver] = useState<string | null>(null)

  const days = useMemo(() => weekDays(monday), [monday])

  const addEntry = (date: string, slot: MealSlot, dishName: string, emoji: string) => {
    update((d) => ({
      ...d,
      menuEntries: [
        ...d.menuEntries,
        { id: uid('m'), date, slot, dishName, emoji, byMemberId: currentMember?.id },
      ],
    }))
  }

  const placeDish = (dish: Dish, date: string, slot: MealSlot) => addEntry(date, slot, dish.name, dish.emoji)

  const onDrop = (e: DragEvent, date: string, slot: MealSlot) => {
    e.preventDefault()
    setDragOver(null)
    try {
      const { id } = JSON.parse(e.dataTransfer.getData('application/json')) as { id: string }
      const dish = data.dishes.find((x) => x.id === id)
      if (dish) placeDish(dish, date, slot)
    } catch {
      // ignore malformed drops
    }
  }

  const onCellClick = (date: string, slot: MealSlot) => {
    if (armedDish) {
      const dish = data.dishes.find((x) => x.id === armedDish)
      if (dish) placeDish(dish, date, slot)
      setArmedDish(null)
      return
    }
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
        <h3>🍲 Dish library</h3>
        <p className="hint">Drag a dish onto a meal — or tap it, then tap a meal box. You can also tap any box and just type.</p>
        {data.dishes.map((dish) => (
          <div
            key={dish.id}
            className={`library-card ${armedDish === dish.id ? 'armed' : ''}`}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify({ id: dish.id }))}
            onClick={() => setArmedDish(armedDish === dish.id ? null : dish.id)}
          >
            <span className="card-emoji">{dish.emoji}</span>
            <span className="card-title">{dish.name}</span>
            {dish.slot !== 'any' && <span className="card-time">{dish.slot}</span>}
            <button
              className="icon-btn tiny"
              title="Remove dish"
              onClick={(e) => {
                e.stopPropagation()
                update((d) => ({ ...d, dishes: d.dishes.filter((x) => x.id !== dish.id) }))
              }}
            >
              ✕
            </button>
          </div>
        ))}
        <button className="btn subtle full" onClick={() => setShowDishForm(true)}>
          ＋ New dish
        </button>
        {armedDish && <p className="armed-hint">👉 Now tap a meal box to place it</p>}
      </aside>

      <div className="timetable-main">
        <div className="week-nav">
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, -7))}>← Prev</button>
          <button className="btn subtle" onClick={() => setMonday(mondayOf(today))}>This week</button>
          <strong className="week-label">Menu for the week</strong>
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, 7))}>Next →</button>
        </div>

        <div className="menu-grid" style={{ gridTemplateColumns: `90px repeat(7, 1fr)` }}>
          <div />
          {days.map((date) => {
            const d = fromKey(date)
            return (
              <div key={date} className={`menu-day-head ${date === today ? 'today' : ''}`}>
                {DAY_SHORT[d.getDay()]} {d.getDate()}
                {date === today && <span className="today-tag">Today</span>}
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
              typing={typing}
              typedName={typedName}
              setTypedName={setTypedName}
              saveTyped={saveTyped}
              cancelTyped={() => setTyping(null)}
              armed={Boolean(armedDish)}
            />
          ))}
        </div>
        <p className="hint">
          Tip: anyone can fill this in — entries show who added them (currently{' '}
          {currentMember ? `${currentMember.emoji} ${currentMember.name}` : 'nobody'}).
        </p>
      </div>

      {showDishForm && <DishModal onClose={() => setShowDishForm(false)} />}
    </div>
  )
}

interface RowProps {
  slot: MealSlot
  days: string[]
  dragOver: string | null
  setDragOver: (k: string | null) => void
  onDrop: (e: DragEvent, date: string, slot: MealSlot) => void
  onCellClick: (date: string, slot: MealSlot) => void
  typing: { date: string; slot: MealSlot } | null
  typedName: string
  setTypedName: (v: string) => void
  saveTyped: () => void
  cancelTyped: () => void
  armed: boolean
}

function MenuRow(props: RowProps) {
  const { data, update, memberById } = useApp()
  const { slot, days, dragOver, setDragOver, onDrop, onCellClick, typing, typedName, setTypedName, saveTyped, cancelTyped, armed } = props

  return (
    <>
      <div className="menu-slot-label">{SLOT_LABEL[slot]}</div>
      {days.map((date) => {
        const key = `${date}|${slot}`
        const entries = data.menuEntries.filter((m) => m.date === date && m.slot === slot)
        const isTyping = typing?.date === date && typing?.slot === slot
        return (
          <div
            key={key}
            className={`menu-cell ${dragOver === key ? 'drag-over' : ''} ${armed ? 'placeable' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(key)
            }}
            onDragLeave={() => dragOver === key && setDragOver(null)}
            onDrop={(e) => onDrop(e, date, slot)}
            onClick={() => !isTyping && onCellClick(date, slot)}
          >
            {entries.map((entry) => {
              const by = memberById(entry.byMemberId)
              return (
                <div key={entry.id} className="menu-entry" onClick={(e) => e.stopPropagation()}>
                  <span>{entry.emoji}</span>
                  <span className="menu-entry-name">{entry.dishName}</span>
                  {by && <Avatar member={by} size={16} />}
                  <button
                    className="icon-btn tiny"
                    onClick={() =>
                      update((d) => ({ ...d, menuEntries: d.menuEntries.filter((x) => x.id !== entry.id) }))
                    }
                  >
                    ✕
                  </button>
                </div>
              )
            })}
            {isTyping ? (
              <input
                autoFocus
                className="menu-inline-input"
                value={typedName}
                placeholder="Type dish…"
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

function DishModal({ onClose }: { onClose: () => void }) {
  const { update } = useApp()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🍽️')
  const [slot, setSlot] = useState<Dish['slot']>('any')

  const FOOD_EMOJI = ['🍽️', '🍗', '🐟', '🥬', '🍜', '🥚', '🥞', '🍉', '🍚', '🍝', '🍕', '🥟', '🍤', '🥣', '🍞', '🧁']

  const save = () => {
    if (!name.trim()) return
    update((d) => ({ ...d, dishes: [...d.dishes, { id: uid('d'), name: name.trim(), emoji, slot }] }))
    onClose()
  }

  return (
    <Modal title="New dish" onClose={onClose}>
      <div className="form">
        <label>
          Dish name
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mee goreng" onKeyDown={(e) => e.key === 'Enter' && save()} />
        </label>
        <label>Icon</label>
        <div className="emoji-picker">
          {FOOD_EMOJI.map((e) => (
            <button key={e} type="button" className={`emoji-opt ${emoji === e ? 'on' : ''}`} onClick={() => setEmoji(e)}>
              {e}
            </button>
          ))}
        </div>
        <label>
          Usually for
          <select value={slot} onChange={(e) => setSlot(e.target.value as Dish['slot'])}>
            <option value="any">Any meal</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </label>
        <div className="form-actions">
          <span className="spacer" />
          <button className="btn primary" onClick={save} disabled={!name.trim()}>
            Add dish
          </button>
        </div>
      </div>
    </Modal>
  )
}
