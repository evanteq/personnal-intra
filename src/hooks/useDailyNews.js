import { useEffect, useState } from 'react'

// All of these are live RSS feeds, read through rss2json's free key-free
// endpoint (the feeds themselves don't send CORS headers, so a direct
// browser fetch would be blocked — rss2json re-serves them as CORS-friendly
// JSON). The free tier caps each feed at its own 10 latest items, which is
// why several feeds get merged per category before picking the best ones.
const GENERAL_FEEDS = [{ url: 'https://www.francetvinfo.fr/titres.rss', source: 'France Info' }]
const DIGITAL_FEEDS = [
  { url: 'https://www.numerama.com/feed/', source: 'Numerama' },
  { url: 'https://www.frandroid.com/feed', source: 'Frandroid' },
  { url: 'https://www.lemonde.fr/pixels/rss_full.xml', source: 'Le Monde Pixels' },
]
const RSS2JSON_URL = 'https://api.rss2json.com/v1/api.json?rss_url='
const GENERAL_COUNT = 4
const DIGITAL_COUNT = 6
const STORAGE_KEY = 'intra:dailyNews'

// Deals, buying guides and listicles aren't "news" — drop them outright.
const NOISE_PATTERN =
  /promo|bon plan|code promo|réduction|soldes|black friday|comparatif|meilleurs? (jeux|smartphones?|écouteurs|casques|forfaits?|vpn|tv)|classement|à \d+[.,]?\d*\s?€|pour \d+[.,]?\d*\s?€/i

// Product launches, big-name announcements and reveals — the stuff worth
// knowing about first — score higher than routine coverage.
const SIGNAL_PATTERN =
  /annonce|dévoile|lance[nr]?\b|lancement|sortie|disponible dès|officiel(le)?|présente|rachète|racheté|rebranding|nouveau logo|change de logo|faille|piratage|cyberattaque|levée de fonds|intelligence artificielle|\bIA\b|chatgpt|openai|gemini|claude|anthropic|google|apple|iphone|android|microsoft|meta\b|samsung|tesla|spacex|nvidia/i

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function scoreTitle(title) {
  return SIGNAL_PATTERN.test(title) ? 1 : 0
}

function mapAndRank(items, category, count, source) {
  const seen = new Set()
  const candidates = items
    .filter((a) => a.title && a.link)
    .filter((a) => !NOISE_PATTERN.test(a.title))
    .filter((a) => {
      if (seen.has(a.link)) return false
      seen.add(a.link)
      return true
    })
    .map((a) => ({ title: a.title.trim(), url: a.link, category, source: a.source || source, score: scoreTitle(a.title) }))

  candidates.sort((a, b) => b.score - a.score)
  return candidates.slice(0, count).map(({ score, ...item }) => item)
}

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupted cache, ignore
  }
  return { date: null, items: [] }
}

async function fetchFeed({ url, source }) {
  const res = await fetch(RSS2JSON_URL + encodeURIComponent(url))
  const data = await res.json()
  if (data.status !== 'ok') throw new Error('feed error')
  return (data.items || []).map((item) => ({ ...item, source }))
}

async function fetchCategory(feeds) {
  const results = await Promise.allSettled(feeds.map(fetchFeed))
  return results.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value)
}

/**
 * Fetches a small daily mix of headlines (40% general / 60% digital) once
 * per calendar day, cached in localStorage so repeat visits the same day
 * don't refetch. No backend involved — rss2json's free endpoint lets the
 * browser read these RSS feeds directly without an API key. Deals/listicle
 * noise is filtered out, and real announcements (product launches, big
 * tech/AI reveals, rebrands...) are ranked above routine coverage.
 */
export function useDailyNews() {
  const [state, setState] = useState(readCache)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (state.date === todayKey() && state.items.length > 0) return
    let cancelled = false
    setLoading(true)
    setError(false)
    Promise.all([fetchCategory(GENERAL_FEEDS), fetchCategory(DIGITAL_FEEDS)])
      .then(([general, digital]) => {
        if (cancelled) return
        if (general.length === 0 && digital.length === 0) throw new Error('all feeds failed')
        const items = [
          ...mapAndRank(general, 'general', GENERAL_COUNT),
          ...mapAndRank(digital, 'digital', DIGITAL_COUNT),
        ]
        const next = { date: todayKey(), items }
        setState(next)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          // storage full or unavailable — keep the fetched items in memory anyway
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { items: state.items, loading, error }
}
