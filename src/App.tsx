import { useState } from 'react'
import { StoreProvider, useApp } from './store'
import { LangProvider, useLang, t } from './i18n'
import { TodayView } from './components/TodayView'
import { Timetable } from './components/Timetable'
import { MenuPlanner } from './components/MenuPlanner'
import { KidCorner } from './components/KidCorner'
import { FamilyModal } from './components/FamilyModal'

function Shell() {
  const { data } = useApp()
  const { lang, setLang } = useLang()
  const [tab, setTab] = useState('today')
  const [showFamily, setShowFamily] = useState(false)

  const kid = data.members.find((m) => m.isChild)
  const tabs = [
    { id: 'today', label: t('tabToday') },
    { id: 'timetable', label: t('tabTimetable') },
    { id: 'menu', label: t('tabMenu') },
    ...(kid ? [{ id: 'kid', label: `⭐ ${kid.name}` }] : []),
  ]

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-emoji">🏡</span>
          <div>
            <h1>Wong Sun Family Hub</h1>
            <span className="brand-sub">{t('appSub')}</span>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn subtle lang-toggle"
            title={lang === 'en' ? 'Switch to Chinese' : '切换到英文'}
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          >
            {lang === 'en' ? '🇨🇳 中文' : '🇬🇧 English'}
          </button>
          <button className="btn subtle" onClick={() => setShowFamily(true)}>
            {t('editFamily')}
          </button>
        </div>
      </header>

      <nav className="tabs">
        {tabs.map((tb) => (
          <button key={tb.id} className={`tab ${tab === tb.id ? 'on' : ''}`} onClick={() => setTab(tb.id)}>
            {tb.label}
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
    <LangProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </LangProvider>
  )
}
