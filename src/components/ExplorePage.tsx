import { useEffect, useState } from 'react'
import { EXPLORE_IDEAS, SOURCE_LINKS, ideaOfTheDay, mapUrl } from '../data/explore'
import type { ExploreIdea } from '../data/explore'
import { fetchFresh, cachedFresh, agoLabel } from '../utils/feeds'
import type { FreshNews, FeedItem } from '../utils/feeds'
import { t, getLang } from '../i18n'
import type { TKey } from '../i18n'
import { Modal } from './shared'

const CATS = ['all', 'play', 'nature', 'indoor', 'eat'] as const
const CAT_EMOJI: Record<string, string> = { all: '🌈', play: '🛝', nature: '🌳', indoor: '🎨', eat: '🍽️' }

/** Live "fresh right now" feeds + curated evergreen Singapore family ideas. */
export function ExplorePage() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('all')
  const [showSources, setShowSources] = useState(false)
  const [fresh, setFresh] = useState<FreshNews | null>(cachedFresh)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const pick = ideaOfTheDay(new Date())
  const ideas = EXPLORE_IDEAS.filter((i) => cat === 'all' || i.category === cat)

  const refresh = async (force: boolean) => {
    setLoading(true)
    setError(false)
    try {
      setFresh(await fetchFresh(force))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const newsList = (items: FeedItem[]) => (
    <ul className="news-list">
      {items.map((item) => (
        <li key={item.link}>
          <a className="news-item" href={item.link} target="_blank" rel="noreferrer">
            <span className="news-title">{item.title}</span>
            <span className="news-meta">
              {item.source}
              {item.date > 0 && <> · {agoLabel(item.date, getLang())}</>}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )

  const card = (i: ExploreIdea, big = false) => (
    <div key={i.name} className={`explore-card ${big ? 'big' : ''} cat-${i.category}`}>
      <div className="explore-top">
        <span className="explore-emoji">{i.emoji}</span>
        <div className="explore-titles">
          <strong>{i.name}</strong>
          <span className="explore-area">📍 {i.area}</span>
        </div>
        {i.free && <span className="free-tag">{t('freeTag')}</span>}
      </div>
      <p className="explore-desc">{i.desc}</p>
      <div className="explore-foot">
        <span className="explore-source">via {i.source}</span>
        <a className="map-link" href={mapUrl(i)} target="_blank" rel="noreferrer">
          {t('mapBtn')}
        </a>
      </div>
    </div>
  )

  return (
    <div className="explore-page">
      <div className="explore-hero">
        <div>
          <h2>{t('exploreTitle')}</h2>
          <p className="hint" style={{ margin: 0 }}>{t('exploreSub')}</p>
        </div>
      </div>

      {/* live section: pulled from the web on demand */}
      <div className="fresh-section">
        <div className="fresh-head">
          <h3>🗞️ {t('freshTitle')}</h3>
          <div className="fresh-actions">
            {fresh && !loading && <span className="hint fetched-ago">{t('fetchedAgo', { t: agoLabel(fresh.fetchedAt, getLang()) })}</span>}
            <button className="btn primary" onClick={() => refresh(true)} disabled={loading}>
              {loading ? t('freshFetching') : t('refreshNow')}
            </button>
            <a className="btn subtle" href="https://www.timeout.com/singapore/things-to-do" target="_blank" rel="noreferrer">
              {t('timeoutBtn')}
            </a>
          </div>
        </div>
        {error && (
          <p className="hint fresh-error">
            {t('freshError')}{' '}
            <button className="linklike" onClick={() => setShowSources(true)}>{t('refreshBtn')}</button>
          </p>
        )}
        {fresh && (
          <div className="fresh-cols">
            <div className="fresh-col">
              <h4>🎭 {t('whatsOnTitle')}</h4>
              {newsList(fresh.whatsOn)}
            </div>
            <div className="fresh-col">
              <h4>🍽️ {t('newFoodTitle')}</h4>
              {newsList(fresh.newFood)}
            </div>
          </div>
        )}
        {!fresh && loading && <p className="hint">{t('freshFetching')}</p>}
      </div>

      <div className="pick-of-day">
        <div className="pick-label">{t('pickOfDay')}</div>
        {card(pick, true)}
      </div>

      <div className="filter-row">
        {CATS.map((c) => (
          <button key={c} className={`filter-btn ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
            {CAT_EMOJI[c]} {t(`cat_${c}` as TKey)}
          </button>
        ))}
      </div>

      <div className="explore-grid">{ideas.map((i) => card(i))}</div>

      <p className="hint">
        {t('exploreCredit')}{' '}
        <button className="linklike" onClick={() => setShowSources(true)}>{t('refreshBtn')}</button>
      </p>

      {showSources && (
        <Modal title={t('refreshTitle')} onClose={() => setShowSources(false)}>
          <p className="hint" style={{ marginTop: 0 }}>{t('refreshHint')}</p>
          <div className="source-list">
            {SOURCE_LINKS.map((s) => (
              <a key={s.url} className="source-row" href={s.url} target="_blank" rel="noreferrer">
                <strong>{s.name} ↗</strong>
                <span>{s.what}</span>
              </a>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
