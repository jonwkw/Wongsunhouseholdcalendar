// Live "what's new" for the Explore tab, pulled on demand from Google News
// RSS search (which indexes Time Out, Honeycombers, DanielFoodDiary, Sassy
// Mama, TheSmartLocal…). Browsers can't read the feed directly (no CORS),
// so we go through public CORS relays with fallbacks.

export interface FeedItem {
  title: string
  link: string
  source: string
  date: number
}

export interface FreshNews {
  whatsOn: FeedItem[]
  newFood: FeedItem[]
  fetchedAt: number
}

const CACHE_KEY = 'wongsun-fresh'
const CACHE_TTL = 3 * 60 * 60 * 1000 // refresh automatically every ~3h; button forces it

const QUERIES = {
  newFood: '"new restaurant" OR "new cafe" OR "now open" singapore when:21d',
  whatsOn: '"things to do" singapore "this weekend" OR "this week" when:7d',
}

function gnUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-SG&gl=SG&ceid=SG:en`
}

/** Try a few routes to the feed: CORS relays first, then direct */
async function fetchXml(url: string): Promise<string> {
  const routes = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    url,
  ]
  let lastError: unknown
  for (const route of routes) {
    try {
      const res = await fetch(route)
      if (res.ok) {
        const text = await res.text()
        if (text.includes('<rss') || text.includes('<item')) return text
      }
      lastError = new Error(`HTTP ${res.status}`)
    } catch (e) {
      lastError = e
    }
  }
  throw lastError instanceof Error ? lastError : new Error('feed unreachable')
}

function parseRss(xml: string, limit: number): FeedItem[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const items: FeedItem[] = []
  for (const it of Array.from(doc.querySelectorAll('item')).slice(0, limit)) {
    const source = it.querySelector('source')?.textContent?.trim() ?? ''
    let title = it.querySelector('title')?.textContent?.trim() ?? ''
    // Google News appends " - Source" to titles; the source has its own tag
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3))
    const link = it.querySelector('link')?.textContent?.trim() ?? ''
    const date = Date.parse(it.querySelector('pubDate')?.textContent ?? '') || 0
    if (title && link) items.push({ title, link, source, date })
  }
  return items
}

export function cachedFresh(): FreshNews | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return JSON.parse(raw) as FreshNews
  } catch {
    // corrupted cache — refetch
  }
  return null
}

export async function fetchFresh(force = false): Promise<FreshNews> {
  const cached = cachedFresh()
  if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached

  const [whatsOnXml, newFoodXml] = await Promise.all([
    fetchXml(gnUrl(QUERIES.whatsOn)),
    fetchXml(gnUrl(QUERIES.newFood)),
  ])
  const fresh: FreshNews = {
    whatsOn: parseRss(whatsOnXml, 8),
    newFood: parseRss(newFoodXml, 10),
    fetchedAt: Date.now(),
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(fresh))
  return fresh
}

/** "3h ago" style label */
export function agoLabel(ts: number, lang: 'en' | 'zh'): string {
  const mins = Math.max(1, Math.round((Date.now() - ts) / 60000))
  if (mins < 60) return lang === 'zh' ? `${mins}分钟前` : `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return lang === 'zh' ? `${hours}小时前` : `${hours}h ago`
  const days = Math.round(hours / 24)
  return lang === 'zh' ? `${days}天前` : `${days}d ago`
}
