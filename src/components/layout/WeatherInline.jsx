import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import { WEATHER_CODES } from '../../data/weatherCodes'

const FALLBACK_LOCATION = { label: 'Paris', latitude: 48.8566, longitude: 2.3522 }
const REFRESH_MS = 15 * 60 * 1000

export default function WeatherInline() {
  const { settings } = useSettings()
  const [coords, setCoords] = useState(null)
  const [current, setCurrent] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false

    async function resolveCoords() {
      if (settings.weatherLocation) return settings.weatherLocation

      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 }),
          )
          return {
            label: 'Position actuelle',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }
        } catch {
          return { ...FALLBACK_LOCATION, isFallback: true }
        }
      }
      return { ...FALLBACK_LOCATION, isFallback: true }
    }

    resolveCoords().then((c) => {
      if (!cancelled) setCoords(c)
    })

    return () => {
      cancelled = true
    }
  }, [settings.weatherLocation])

  useEffect(() => {
    if (!coords) return
    let cancelled = false

    async function fetchWeather() {
      setStatus('loading')
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&timezone=auto`
        const res = await fetch(url)
        if (!res.ok) throw new Error('bad response')
        const json = await res.json()
        if (!cancelled) {
          setCurrent(json.current)
          setStatus('ok')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [coords])

  const info = current ? WEATHER_CODES[current.weather_code] ?? WEATHER_CODES.default : WEATHER_CODES.default
  const Icon = info.icon

  const tooltip =
    status === 'ok'
      ? `${coords?.label ?? 'Météo'} · ${info.label}${
          coords?.isFallback ? ' — position par défaut, configurez votre ville dans les paramètres' : ''
        }`
      : status === 'error'
        ? 'Météo indisponible pour le moment'
        : undefined

  return (
    <div className="flex items-center gap-2" title={tooltip}>
      {status === 'loading' && <Loader2 size={17} className="animate-spin text-[var(--text-muted)] shrink-0" />}
      {status === 'error' && <AlertTriangle size={17} className="text-amber-500 shrink-0" />}
      {status === 'ok' && <Icon size={17} className="text-[var(--accent)] shrink-0" />}
      <span className="text-sm font-medium tabular-nums text-[var(--text-primary)]">
        {status === 'ok' && current ? `${Math.round(current.temperature_2m)}°C` : status === 'error' ? 'N/A' : '…'}
      </span>
      <span className="hidden sm:inline text-xs text-[var(--text-muted)]">{coords?.label ?? 'Météo'}</span>
    </div>
  )
}
