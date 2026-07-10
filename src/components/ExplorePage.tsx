import { useState } from 'react'
import { EXPLORE_IDEAS, ideaOfTheDay } from '../data/explore'
import type { ExploreIdea } from '../data/explore'
import { t } from '../i18n'
import type { TKey } from '../i18n'

const CATS = ['all', 'play', 'nature', 'indoor', 'eat', 'new'] as const
const CAT_EMOJI: Record<string, string> = { all: '🌈', play: '🛝', nature: '🌳', indoor: '🎨', eat: '🍽️', new: '🆕' }

/** Curated Singapore family ideas: playgrounds, outings, rainy-day spots and kid-friendly eats. */
export function ExplorePage() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('all')
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
      <span className="explore-source">via {i.source}</span>
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
    </div>
  )
}
