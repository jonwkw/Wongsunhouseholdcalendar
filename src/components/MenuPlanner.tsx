import { useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import type { Dish, MealSlot, MenuEntry } from '../types'
import { useApp, uid } from '../store'
import { addDays, fromKey, mondayOf, prettyDate, todayKey, weekDays, DAY_SHORT } from '../utils/dates'
import { MemberChips, MemberToggle, Modal, tagColor } from './shared'
import { setDragPayload, getDragPayload, leavesTarget } from '../utils/dnd'

const SLOTS: MealSlot[] = ['breakfast', 'snack-am', 'lunch', 'snack-pm', 'dinner']
const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: '🌅 Breakfast',
  'snack-am': '🍎 Snack (AM)',
  lunch: '☀️ Lunch',
  'snack-pm': '🍪 Snack (PM)',
  dinner: '🌙 Dinner',
}

export function MenuPlanner() {
  const { data, update } = useApp()
  const today = todayKey()
  const [monday, setMonday] = useState(() => mondayOf(today))
  const [placingDish, setPlacingDish] = useState<Dish | null>(null)
  const [showDishForm, setShowDishForm] = useState(false)
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
        <p className="hint">Click a dish to add it to the menu (you pick the day and meal) — or drag it straight onto a meal box. You can also tap any box and just type.</p>
        {data.dishes.map((dish) => (
          <div
            key={dish.id}
            className="library-card"
            draggable
            onDragStart={(e) => setDragPayload(e, { id: dish.id })}
            onClick={() => setPlacingDish(dish)}
            title="Click to add this dish to the menu"
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
      </aside>

      <div className="timetable-main">
        <div className="week-nav">
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, -7))}>← Prev</button>
          <button className="btn subtle" onClick={() => setMonday(mondayOf(today))}>This week</button>
          <strong className="week-label">Menu for the week</strong>
          <button className="btn subtle" onClick={() => setMonday((m) => addDays(m, 7))}>Next →</button>
        </div>

        <div className="menu-grid" style={{ gridTemplateColumns: `90px repeat(7, minmax(0, 1fr))` }}>
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
              onEntryClick={setEditingEntry}
              typing={typing}
              typedName={typedName}
              setTypedName={setTypedName}
              saveTyped={saveTyped}
              cancelTyped={() => setTyping(null)}
            />
          ))}
        </div>

        <p className="hint">Tap a placed meal to rename it, tag who it's for, or remove it.</p>
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
  const [slot, setSlot] = useState<MealSlot>(dish.slot === 'breakfast' || dish.slot === 'lunch' || dish.slot === 'dinner' ? dish.slot : dish.slot === 'snack' ? 'snack-pm' : 'dinner')

  return (
    <Modal title={`Add ${dish.emoji} ${dish.name} to the menu`} onClose={onClose}>
      <div className="form">
        <label>
          Which day?
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Which meal?
          <select value={slot} onChange={(e) => setSlot(e.target.value as MealSlot)}>
            {SLOTS.map((s) => (
              <option key={s} value={s}>
                {SLOT_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <div className="form-actions">
          <span className="spacer" />
          <button className="btn primary" onClick={() => onPlace(date, slot)}>
            Add to menu
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
      <div className="menu-slot-label">{SLOT_LABEL[slot]}</div>
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
                title="Tap to edit / tag people"
                onClick={(e) => {
                  e.stopPropagation()
                  onEntryClick(entry)
                }}
              >
                <div className="menu-entry-top">
                  <span>{entry.emoji}</span>
                  <span className="menu-entry-name">{entry.dishName}</span>
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

/** Edit a placed meal: rename, tag people, or remove */
function MealModal({ entry, onClose }: { entry: MenuEntry; onClose: () => void }) {
  const { update } = useApp()
  const [name, setName] = useState(entry.dishName)
  const [memberIds, setMemberIds] = useState<string[]>(entry.memberIds)

  const save = () => {
    if (!name.trim()) return
    update((d) => ({
      ...d,
      menuEntries: d.menuEntries.map((m) =>
        m.id === entry.id ? { ...m, dishName: name.trim(), memberIds } : m,
      ),
    }))
    onClose()
  }

  const remove = () => {
    update((d) => ({ ...d, menuEntries: d.menuEntries.filter((m) => m.id !== entry.id) }))
    onClose()
  }

  return (
    <Modal title={`${SLOT_LABEL[entry.slot]} · ${prettyDate(entry.date)}`} onClose={onClose}>
      <div className="form">
        <label>
          Dish
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} />
        </label>
        <label>Who is it for?</label>
        <MemberToggle selected={memberIds} onChange={setMemberIds} />
        <div className="form-actions">
          <button className="btn danger" onClick={remove}>
            Remove
          </button>
          <span className="spacer" />
          <button className="btn primary" onClick={save} disabled={!name.trim()}>
            Save
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
