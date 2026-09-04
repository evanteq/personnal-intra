import { useEffect, useMemo, useState } from 'react'
import { Globe2, Plus, X } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { uid } from '../../utils/id'

const DEFAULT_ZONES = [
  { id: 'shanghai', label: 'Shanghai', timeZone: 'Asia/Shanghai' },
  { id: 'los-angeles', label: 'Los Angeles', timeZone: 'America/Los_Angeles' },
]

const FALLBACK_TIMEZONES = [
  'Europe/Paris', 'Europe/London', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome', 'Europe/Moscow',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo', 'America/Mexico_City',
  'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Singapore', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Hong_Kong',
  'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland', 'Africa/Cairo', 'Africa/Johannesburg',
]

function getTimezoneList() {
  try {
    const list = Intl.supportedValuesOf('timeZone')
    if (Array.isArray(list) && list.length) return list
  } catch {
    // Intl.supportedValuesOf unsupported — fall back to a curated list below.
  }
  return FALLBACK_TIMEZONES
}

function labelFromTimeZone(tz) {
  const city = tz.split('/').pop() ?? tz
  return city.replace(/_/g, ' ')
}

export default function TimezoneBanner() {
  const [zones, setZones] = useLocalStorage('intra:worldClockZones', DEFAULT_ZONES)
  const [now, setNow] = useState(new Date())
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  const tzOptions = useMemo(() => getTimezoneList(), [])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  function addZone(e) {
    e.preventDefault()
    const tz = draft.trim()
    if (!tz || !tzOptions.includes(tz) || zones.some((z) => z.timeZone === tz)) return
    setZones((prev) => [...prev, { id: uid(), label: labelFromTimeZone(tz), timeZone: tz }])
    setDraft('')
    setAdding(false)
  }

  function removeZone(id) {
    setZones((prev) => prev.filter((z) => z.id !== id))
  }

  return (
    <div className="glass glass-shadow rounded-2xl px-2 py-1 flex items-stretch divide-x divide-[var(--surface-border)] animate-fade-in">
      {zones.map((zone) => (
        <div key={zone.id} className="group relative flex-1 flex items-center justify-center gap-2 px-4 py-3 min-w-0">
          <Globe2 size={15} className="text-[var(--accent)] shrink-0" />
          <div className="flex flex-col leading-tight items-center min-w-0">
            <span className="text-xs text-[var(--text-muted)] truncate max-w-full">{zone.label}</span>
            <span className="text-sm font-medium tabular-nums text-[var(--text-primary)]">
              {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: zone.timeZone })}
            </span>
          </div>
          <button
            onClick={() => removeZone(zone.id)}
            aria-label={`Retirer ${zone.label}`}
            className="absolute top-1 right-1 p-0.5 rounded opacity-0 group-hover:opacity-100 text-[var(--text-faint)] hover:text-red-500 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={addZone} className="flex-1 flex items-center gap-2 px-4 py-2 min-w-[220px]">
          <input
            autoFocus
            list="timezone-options"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setAdding(false)
            }}
            placeholder="Ville ou fuseau (ex : Tokyo)…"
            className="w-full bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
          />
          <datalist id="timezone-options">
            {tzOptions.map((tz) => (
              <option key={tz} value={tz} />
            ))}
          </datalist>
          <button type="submit" className="btn-accent px-2.5 py-1 rounded-lg text-xs font-medium shrink-0">
            OK
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="p-1 rounded-lg text-[var(--text-faint)] hover:text-[var(--text-primary)] shrink-0"
          >
            <X size={14} />
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          aria-label="Ajouter un fuseau horaire"
          className="flex items-center justify-center px-4 text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors shrink-0"
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  )
}
