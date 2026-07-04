import { useState } from 'react'
import { StoreProvider, useApp } from './store'
import { TodayView } from './components/TodayView'
import { Timetable } from './components/Timetable'
import { MenuPlanner } from './components/MenuPlanner'
import { KidCorner } from './components/KidCorner'
import { FamilyModal } from './components/FamilyModal'

function Shell() {
  const { data } = useApp()
  const [tab, setTab] = useState('today')
  const [showFamily, setShowFamily] = useState(false)

  const kid = data.members.find((m) => m.isChild)
  const tabs = [
    { id: 'today', label: '🏡 Today', title: 'Weather, next few days, and the family board' },
    { id: 'timetable', label: '🗓️ Timetable', title: '4-week timetable' },
    { id: 'menu', label: '🍽️ Menu', title: 'Meal planner' },
    ...(kid ? [{ id: 'kid', label: `⭐ ${kid.name}`, title: `${kid.name}'s corner` }] : []),
  ]

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
        {tabs.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)} title={t.title}>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'today' && <TodayView goTo={setTab} />}
        {tab === 'timetable' && <Timetable />}
        {tab === 'menu' && <MenuPlanner />}
        {tab === 'kid' && <KidCorner />}
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
