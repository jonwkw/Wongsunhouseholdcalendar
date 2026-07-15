import { useEffect, useMemo, useState } from 'react'
import { StoreProvider, useApp } from './store'
import { LangProvider, useLang, t } from './i18n'
import { TodayView } from './components/TodayView'
import { Timetable } from './components/Timetable'
import { MenuPlanner } from './components/MenuPlanner'
import { KidCorner } from './components/KidCorner'
import { ProfilePage } from './components/ProfilePage'
import { ExplorePage } from './components/ExplorePage'
import { Modal } from './components/shared'
import { MemberFace } from './components/avatars'

const THEMES = [
  { id: 'cream', dot: '#f3e2c4' },
  { id: 'mint', dot: '#a8dcc3' },
  { id: 'sky', dot: '#a9c9e8' },
  { id: 'blush', dot: '#f0b9c8' },
  { id: 'lavender', dot: '#c7b6e8' },
]

function LockModal({ onUnlock, onClose }: { onUnlock: () => void; onClose: () => void }) {
  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState(false)
  // Simple for a grown-up, hard for a 6-year-old
  const q = useMemo(() => {
    const a = 6 + Math.floor(Math.random() * 4)
    const b = 6 + Math.floor(Math.random() * 4)
    const c = 2 + Math.floor(Math.random() * 8)
    return { text: `${a} × ${b} + ${c}`, answer: a * b + c }
  }, [])

  const check = () => {
    if (Number(answer.trim()) === q.answer) onUnlock()
    else {
      setWrong(true)
      setAnswer('')
    }
  }

  return (
    <Modal title={t('lockTitle')} onClose={onClose}>
      <div className="form">
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
      </div>
    </Modal>
  )
}

function Shell() {
  const { data, locked, setLocked, undo, redo, canUndo, canRedo } = useApp()
  const { lang, setLang } = useLang()
  const [tab, setTab] = useState('today')
  const [theme, setTheme] = useState(() => localStorage.getItem('wongsun-theme') ?? 'cream')
  const [showUnlock, setShowUnlock] = useState(false)

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
    { id: 'explore', label: t('tabExplore') },
    { id: 'family', label: t('tabFamily') },
  ]

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div>
            <h1>Wong Sun Family Hub</h1>
            <span className="brand-sub">{t('appSub')}</span>
          </div>
        </div>
        <button className="header-family" onClick={() => setTab('family')} title={t('tabFamily')}>
          {data.members.map((m) => (
            <MemberFace key={m.id} member={m} size={36} />
          ))}
        </button>
        <div className="header-actions">
          {!locked && (
            <div className="history-btns">
              <button className="btn subtle history-btn" title={t('undoTip')} disabled={!canUndo} onClick={undo}>
                ↶ {t('undoLabel')}
              </button>
              <button className="btn subtle history-btn" title={t('redoTip')} disabled={!canRedo} onClick={redo}>
                {t('redoLabel')} ↷
              </button>
            </div>
          )}
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
          <button
            className={`btn subtle lock-btn ${locked ? 'locked' : ''}`}
            title={t('lockTitle')}
            onClick={() => (locked ? setShowUnlock(true) : setLocked(true))}
          >
            {locked ? '🔒' : '🔓'}
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
        {tab === 'explore' && <ExplorePage />}
        {tab === 'family' && <ProfilePage />}
      </main>

      {showUnlock && (
        <LockModal
          onUnlock={() => {
            setLocked(false)
            setShowUnlock(false)
          }}
          onClose={() => setShowUnlock(false)}
        />
      )}
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
