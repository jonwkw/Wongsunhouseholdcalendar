import { useState } from 'react'
import { StoreProvider, useApp } from './store'
import { TodayView } from './components/TodayView'
import { Timetable } from './components/Timetable'
import { MenuPlanner } from './components/MenuPlanner'
import { Weather } from './components/Weather'
import { FamilyBoard } from './components/FamilyBoard'
import { FamilyModal } from './components/FamilyModal'
import { Avatar } from './components/shared'

const TABS = [
  { id: 'today', label: '🏡 Today', title: 'Today & next 2 days' },
  { id: 'timetable', label: '🗓️ Timetable', title: 'Weekly timetable' },
  { id: 'menu', label: '🍽️ Menu', title: 'Meal planner' },
  { id: 'weather', label: '🌤️ Weather', title: 'Forecast & reminders' },
  { id: 'board', label: '📌 Board', title: 'Requests & reminders' },
]

function Shell() {
  const { data, currentMember, setCurrentMemberId } = useApp()
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

        <div className="who">
          <span className="who-label">Who's here?</span>
          {data.members.map((m) => (
            <button
              key={m.id}
              className={`who-btn ${currentMember?.id === m.id ? 'on' : ''}`}
              style={currentMember?.id === m.id ? { borderColor: m.color, background: m.color + '22' } : undefined}
              onClick={() => setCurrentMemberId(m.id)}
              title={m.name}
            >
              <Avatar member={m} size={30} />
              <span className="who-name">{m.name}</span>
            </button>
          ))}
          <button className="icon-btn" title="Edit family" onClick={() => setShowFamily(true)}>
            ⚙️
          </button>
        </div>
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
        {tab === 'weather' && <Weather />}
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
