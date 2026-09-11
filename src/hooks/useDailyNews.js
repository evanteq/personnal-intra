import { useEffect, useState } from 'react'

// Both are live RSS feeds, read through rss2json's free key-free endpoint
// (the feeds themselves don't send CORS headers, so a direct browser fetch
// would be blocked — rss2json re-serves them as CORS-friendly JSON).
const GENERAL_FEED = 'https://www.francetvinfo.fr/titres.rss'
const DIGITAL_FEED = 'https://www.numerama.com/feed/'
const RSS2JSON_URL = 'https://api.rss2json.com/v1/api.json?rss_url='
const GENERAL_COUNT = 4
const DIGITAL_COUNT = 6
const STORAGE_KEY = 'intra:dailyNews'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function mapItems(items, category, count, source) {
  return (items || [])
    .filter((a) => a.title && a.link)
    .slice(0, count)
    .map((a) => ({ title: a.title.trim(), url: a.link, category, source }))
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

async function fetchFeed(url) {
  const res = await fetch(RSS2JSON_URL + encodeURIComponent(url))
  const data = await res.json()
  if (data.status !== 'ok') throw new Error('feed error')
  return data.items
}

/**
 * Fetches a small daily mix of headlines (40% general / 60% digital) once
 * per calendar day, cached in localStorage so repeat visits the same day
 * don't refetch. No backend involved — rss2json's free endpoint lets the
 * browser read these RSS feeds directly without an API key.
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
    Promise.all([fetchFeed(GENERAL_FEED), fetchFeed(DIGITAL_FEED)])
      .then(([general, digital]) => {
        if (cancelled) return
        const items = [
          ...mapItems(general, 'general', GENERAL_COUNT, 'France Info'),
          ...mapItems(digital, 'digital', DIGITAL_COUNT, 'Numerama'),
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
