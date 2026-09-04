import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2, MapPin } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import { WEATHER_CODES } from '../../data/weatherCodes'
import WorldClock from '../clock/WorldClock'

const FALLBACK_LOCATION = { label: 'Paris', latitude: 48.8566, longitude: 2.3522 }
const REFRESH_MS = 15 * 60 * 1000

export default function TodayPanel() {
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

  return (
    <div className="glass glass-shadow rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 animate-fade-in">
      <div className="flex items-center gap-4 shrink-0">
        {status === 'loading' && <Loader2 size={36} className="animate-spin text-[var(--text-muted)] shrink-0" />}
        {status === 'error' && <AlertTriangle size={36} className="text-amber-500 shrink-0" />}
        {status === 'ok' && <Icon size={36} className="text-[var(--accent)] shrink-0" />}
        <div>
          <p className="text-2xl font-semibold text-[var(--text-primary)] leading-none">
            {status === 'ok' && current ? `${Math.round(current.temperature_2m)}°C` : status === 'error' ? 'N/A' : '…'}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
            <MapPin size={11} />
            {coords?.label ?? 'Météo'}
            {status === 'ok' && ` · ${info.label}`}
          </p>
        </div>
      </div>

      <div className="hidden sm:block w-px self-stretch bg-[var(--surface-border)]" />

      <WorldClock />

      {coords?.isFallback && status === 'ok' && (
        <p className="text-[11px] text-[var(--text-faint)] sm:ml-auto">
          Position par défaut — configurez votre ville dans les paramètres
        </p>
      )}
    </div>
  )
}
