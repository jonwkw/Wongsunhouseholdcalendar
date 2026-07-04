import { useState } from 'react'
import { StoreProvider } from './store'
import { TodayView } from './components/TodayView'
import { Timetable } from './components/Timetable'
import { MenuPlanner } from './components/MenuPlanner'
import { FamilyBoard } from './components/FamilyBoard'
import { FamilyModal } from './components/FamilyModal'

const TABS = [
  { id: 'today', label: '🏡 Today', title: 'Today & next 2 days, with weather' },
  { id: 'timetable', label: '🗓️ Timetable', title: 'Weekly & monthly timetable' },
  { id: 'menu', label: '🍽️ Menu', title: 'Meal planner' },
  { id: 'board', label: '📌 Board', title: 'Requests & reminders' },
]

function Shell() {
  const [tab, setTab] = useState('today')
  const [showFamily, setShowFamily] = useState(false)

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-emoji">🏡</span>
          <div>
            <h1>Wong Sun Family Hub</h1>
            <span className="brand-sub">our week, our meals, our home</span>
          </div>
        </div>
        <button className="btn subtle" onClick={() => setShowFamily(true)}>
          👨‍👩‍👧‍👦 Edit family
        </button>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)} title={t.title}>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'today' && <TodayView goTo={setTab} />}
        {tab === 'timetable' && <Timetable />}
        {tab === 'menu' && <MenuPlanner />}
        {tab === 'board' && <FamilyBoard />}
      </main>

      {showFamily && <FamilyModal onClose={() => setShowFamily(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
