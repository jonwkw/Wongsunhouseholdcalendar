import { useEffect, useState } from 'react'
import { StoreProvider, useApp } from './store'
import { LangProvider, useLang, t } from './i18n'
import { TodayView } from './components/TodayView'
import { Timetable } from './components/Timetable'
import { MenuPlanner } from './components/MenuPlanner'
import { KidCorner } from './components/KidCorner'
import { ProfilePage } from './components/ProfilePage'

const THEMES = [
  { id: 'cream', dot: '#f3e2c4' },
  { id: 'mint', dot: '#a8dcc3' },
  { id: 'sky', dot: '#a9c9e8' },
  { id: 'blush', dot: '#f0b9c8' },
  { id: 'lavender', dot: '#c7b6e8' },
]

function Shell() {
  const { data } = useApp()
  const { lang, setLang } = useLang()
  const [tab, setTab] = useState('today')
  const [theme, setTheme] = useState(() => localStorage.getItem('wongsun-theme') ?? 'cream')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('wongsun-theme', theme)
  }, [theme])

  const kid = data.members.find((m) => m.isChild)
  const tabs = [
    { id: 'today', label: t('tabToday') },
    { id: 'timetable', label: t('tabTimetable') },
    { id: 'menu', label: t('tabMenu') },
    ...(kid ? [{ id: 'kid', label: `🚀 ${kid.name}` }] : []),
    { id: 'family', label: t('tabFamily') },
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
          <div className="theme-dots" title={t('themeLabel')}>
            {THEMES.map((th) => (
              <button
                key={th.id}
                className={`theme-dot ${theme === th.id ? 'on' : ''}`}
                style={{ background: th.dot }}
                onClick={() => setTheme(th.id)}
              />
            ))}
          </div>
          <button
            className="btn subtle lang-toggle"
            title={lang === 'en' ? 'Switch to Chinese' : '切换到英文'}
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          >
            {lang === 'en' ? '🇨🇳 中文' : '🇬🇧 English'}
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
        {tab === 'family' && <ProfilePage />}
      </main>
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
