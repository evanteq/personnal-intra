import { useEffect, useState } from 'react'
import { Globe2, Plus, X } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { uid } from '../../utils/id'
import { getUtcOffsetLabel, searchTimezones } from '../../data/timezones'

const DEFAULT_ZONES = [
  { id: 'shanghai', label: 'Shanghai', timeZone: 'Asia/Shanghai' },
  { id: 'los-angeles', label: 'Los Angeles', timeZone: 'America/Los_Angeles' },
]

export default function TimezoneBanner() {
  const [zones, setZones] = useLocalStorage('intra:worldClockZones', DEFAULT_ZONES)
  const [now, setNow] = useState(new Date())
  const [adding, setAdding] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const results = searchTimezones(
    query,
    zones.map((z) => z.timeZone),
  )

  function addZone(city) {
    setZones((prev) => [...prev, { id: uid(), label: city.city, timeZone: city.timeZone }])
    setQuery('')
    setAdding(false)
  }

  function removeZone(id) {
    setZones((prev) => prev.filter((z) => z.id !== id))
  }

  return (
    <div className="relative z-30 glass glass-shadow rounded-2xl px-2 py-1 flex items-stretch divide-x divide-[var(--surface-border)] animate-fade-in">
      {zones.map((zone) => (
        <div key={zone.id} className="group relative flex-1 flex items-center justify-center gap-2 px-4 py-3 min-w-0">
          <Globe2 size={15} className="text-[var(--accent)] shrink-0" />
          <div className="flex flex-col leading-tight items-center min-w-0">
            <span className="text-xs text-[var(--text-muted)] truncate max-w-full flex items-center gap-1">
              {zone.label}
              <span className="text-[10px] text-[var(--text-faint)]">{getUtcOffsetLabel(zone.timeZone, now)}</span>
            </span>
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
        <div className="relative flex-1 flex items-center gap-2 px-4 py-2 min-w-[220px]">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setAdding(false)
            }}
            placeholder="Ville ou pays (ex : Espagne)…"
            className="w-full bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
          />
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="p-1 rounded-lg text-[var(--text-faint)] hover:text-[var(--text-primary)] shrink-0"
          >
            <X size={14} />
          </button>

          {query.trim() && (
            <ul
              className="absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden z-20 border border-[var(--surface-border)] shadow-[var(--shadow-lg)] max-h-64 overflow-y-auto thin-scroll"
              style={{ backgroundColor: 'var(--modal-bg)' }}
            >
              {results.length > 0 ? (
                results.map((r) => (
                  <li key={`${r.timeZone}-${r.city}`}>
                    <button
                      type="button"
                      onClick={() => addZone(r)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--surface-hover)]"
                    >
                      <span className="text-[var(--text-primary)]">
                        {r.city} <span className="text-[var(--text-faint)]">· {r.country}</span>
                      </span>
                      <span className="text-xs text-[var(--text-faint)] shrink-0 ml-2">{getUtcOffsetLabel(r.timeZone)}</span>
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-sm text-[var(--text-faint)]">Aucun résultat</li>
              )}
            </ul>
          )}
        </div>
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
