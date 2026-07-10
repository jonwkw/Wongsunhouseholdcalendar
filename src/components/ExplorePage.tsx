import { useState } from 'react'
import { EXPLORE_IDEAS, EXPLORE_UPDATED, SOURCE_LINKS, ideaOfTheDay, mapUrl } from '../data/explore'
import type { ExploreIdea } from '../data/explore'
import { t } from '../i18n'
import type { TKey } from '../i18n'
import { prettyDate } from '../utils/dates'
import { Modal } from './shared'

const CATS = ['all', 'play', 'nature', 'indoor', 'eat', 'new'] as const
const CAT_EMOJI: Record<string, string> = { all: '🌈', play: '🛝', nature: '🌳', indoor: '🎨', eat: '🍽️', new: '🆕' }

/** Curated Singapore family ideas: playgrounds, outings, rainy-day spots and kid-friendly eats. */
export function ExplorePage() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('all')
  const [showSources, setShowSources] = useState(false)
  const pick = ideaOfTheDay(new Date())
  const ideas = EXPLORE_IDEAS.filter((i) => cat === 'all' || i.category === cat)

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
        <div className="explore-updated">
          <span className="hint">{t('exploreUpdated', { d: prettyDate(EXPLORE_UPDATED) })}</span>
          <button className="btn subtle" onClick={() => setShowSources(true)}>
            {t('refreshBtn')}
          </button>
        </div>
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

      <p className="hint">{t('exploreCredit')}</p>

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
