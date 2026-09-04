import { useState } from 'react'
import { Loader2, LocateFixed, Moon, RotateCcw, Search, Sun, X } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import AccentColorPicker from './AccentColorPicker'
import BackgroundPicker from './BackgroundPicker'

export default function SettingsPanel({ open, onClose }) {
  const { settings, setWeatherLocation, setTheme } = useSettings()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)

  function handleReset() {
    if (!confirmingReset) {
      setConfirmingReset(true)
      setTimeout(() => setConfirmingReset(false), 3000)
      return
    }
    Object.keys(localStorage)
      .filter((key) => key.startsWith('intra:'))
      .forEach((key) => localStorage.removeItem(key))
    window.location.reload()
  }

  async function handleSearch(e) {
    e.preventDefault()
    const name = query.trim()
    if (!name) return
    setSearching(true)
    setResults([])
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=fr&format=json`
      const res = await fetch(url)
      const json = await res.json()
      setResults(json.results ?? [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  function pickResult(r) {
    setWeatherLocation({
      label: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
      latitude: r.latitude,
      longitude: r.longitude,
    })
    setResults([])
    setQuery('')
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ backgroundColor: 'var(--scrim)' }}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm p-5 overflow-y-auto thin-scroll transition-transform duration-300 shadow-[var(--shadow-lg)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--panel-bg)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Paramètres</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={20} />
          </button>
        </div>

        <section className="flex flex-col gap-5 mb-8">
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">Apparence</h3>

          <div>
            <p className="text-xs text-[var(--text-muted)] mb-2">Thème</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm"
                style={{
                  borderColor: settings.theme === 'light' ? 'var(--accent)' : 'var(--surface-border)',
                  backgroundColor: settings.theme === 'light' ? 'var(--accent-soft)' : 'var(--surface-bg)',
                  color: settings.theme === 'light' ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                <Sun size={14} />
                Clair
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm"
                style={{
                  borderColor: settings.theme === 'dark' ? 'var(--accent)' : 'var(--surface-border)',
                  backgroundColor: settings.theme === 'dark' ? 'var(--accent-soft)' : 'var(--surface-bg)',
                  color: settings.theme === 'dark' ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                <Moon size={14} />
                Sombre
              </button>
            </div>
          </div>

          <AccentColorPicker />
          <BackgroundPicker />
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">Météo</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Localisation actuelle :{' '}
            <span className="text-[var(--text-secondary)]">
              {settings.weatherLocation?.label ?? 'automatique (géolocalisation)'}
            </span>
          </p>

          <button
            type="button"
            onClick={() => setWeatherLocation(null)}
            className="self-start flex items-center gap-2 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
          >
            <LocateFixed size={14} />
            Utiliser ma position actuelle
          </button>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2">
              <Search size={14} className="text-[var(--text-muted)] shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une ville…"
                className="w-full bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
              />
            </div>
            <button type="submit" className="btn-accent px-3 py-2 rounded-lg text-sm font-medium">
              {searching ? <Loader2 size={14} className="animate-spin" /> : 'OK'}
            </button>
          </form>

          {results.length > 0 && (
            <ul className="flex flex-col gap-1 rounded-lg border border-[var(--surface-border)] overflow-hidden">
              {results.map((r) => (
                <li key={`${r.latitude}-${r.longitude}`}>
                  <button
                    onClick={() => pickResult(r)}
                    className="w-full text-left px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                  >
                    {[r.name, r.admin1, r.country].filter(Boolean).join(', ')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3 mt-8 pt-6 border-t border-[var(--surface-border)]">
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">Données</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Raccourcis, notes, tâches et préférences sont stockés uniquement dans ce navigateur.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className={`self-start flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              confirmingReset
                ? 'text-red-500 border-red-500/40 bg-red-500/10'
                : 'text-[var(--text-secondary)] border-[var(--surface-border)] bg-[var(--surface-bg)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <RotateCcw size={14} />
            {confirmingReset ? 'Cliquer à nouveau pour confirmer' : 'Réinitialiser toutes les données'}
          </button>
        </section>
      </aside>
    </>
  )
}
