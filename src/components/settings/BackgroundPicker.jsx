import { useState } from 'react'
import { Image as ImageIcon, RotateCcw, Upload } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'

const MAX_SIZE_MB = 4

export default function BackgroundPicker() {
  const { settings, setBackground } = useSettings()
  const [urlDraft, setUrlDraft] = useState('')
  const [error, setError] = useState('')

  function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image trop lourde (max ${MAX_SIZE_MB} Mo) — le stockage local est limité.`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => setBackground({ type: 'image', value: reader.result })
    reader.onerror = () => setError("Impossible de lire l'image.")
    reader.readAsDataURL(file)
  }

  function applyUrl(e) {
    e.preventDefault()
    const url = urlDraft.trim()
    if (!url) return
    setBackground({ type: 'url', value: url })
    setUrlDraft('')
    setError('')
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-muted)]">Image de fond</p>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] cursor-pointer">
          <Upload size={14} />
          Importer
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
        <button
          type="button"
          onClick={() => setBackground({ type: 'default', value: '' })}
          className="flex items-center gap-2 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
        >
          <RotateCcw size={14} />
          Réinitialiser
        </button>
      </div>

      <form onSubmit={applyUrl} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2">
          <ImageIcon size={14} className="text-[var(--text-muted)] shrink-0" />
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="URL d'une image…"
            className="w-full bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
          />
        </div>
        <button type="submit" className="btn-accent px-3 py-2 rounded-lg text-sm font-medium">
          OK
        </button>
      </form>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {settings.background.type !== 'default' && (
        <div className="rounded-lg overflow-hidden border border-[var(--surface-border)] h-20">
          <img src={settings.background.value} alt="Aperçu du fond" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  )
}
