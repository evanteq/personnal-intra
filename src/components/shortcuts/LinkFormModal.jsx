import { useEffect, useState } from 'react'
import { Globe, X } from 'lucide-react'
import { ICON_NAMES, getIcon } from '../../data/iconOptions'
import { getFaviconUrl } from '../../utils/favicon'

const EMPTY = { title: '', url: '', icon: null, categoryId: '' }

export default function LinkFormModal({ open, initial, categories, defaultCategoryId, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [previewFailed, setPreviewFailed] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { ...EMPTY, categoryId: defaultCategoryId })
      setError('')
      setPreviewFailed(false)
    }
  }, [open, initial, defaultCategoryId])

  const typedUrl = form.url.trim()
  const previewUrl = typedUrl && !/^https?:\/\//i.test(typedUrl) ? `https://${typedUrl}` : typedUrl
  const faviconPreview = !previewFailed ? getFaviconUrl(previewUrl) : null

  if (!open) return null

  if (categories.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
        style={{ backgroundColor: 'var(--scrim)' }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm rounded-2xl glass p-6 shadow-[var(--shadow-lg)] text-center"
          style={{ backgroundColor: 'var(--modal-bg)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Créez d'abord une catégorie</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Il vous faut au moins une catégorie avant de pouvoir ajouter un lien. Utilisez le bouton "+ Catégorie"
            au-dessus de la grille.
          </p>
          <button type="button" onClick={onClose} className="btn-accent px-4 py-2 rounded-lg text-sm font-medium">
            Compris
          </button>
        </div>
      </div>
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    const title = form.title.trim()
    let url = form.url.trim()
    if (!title || !url) {
      setError('Le titre et l’URL sont obligatoires.')
      return
    }
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`
    }
    try {
      new URL(url)
    } catch {
      setError('URL invalide.')
      return
    }
    onSave({ ...form, title, url })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ backgroundColor: 'var(--scrim)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl glass p-6 shadow-[var(--shadow-lg)]"
        style={{ backgroundColor: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{initial ? 'Modifier le lien' : 'Ajouter un lien'}</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Titre</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Nom du site"
              className="w-full rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">URL</label>
            <input
              value={form.url}
              onChange={(e) => {
                setPreviewFailed(false)
                setForm((f) => ({ ...f, url: e.target.value }))
              }}
              placeholder="https://exemple.com"
              className="w-full rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Catégorie</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} style={{ backgroundColor: 'var(--modal-bg)', color: 'var(--text-primary)' }}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-2">Icône</label>
            <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto thin-scroll pr-1">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, icon: null }))}
                title="Icône automatique du site"
                className={`flex items-center justify-center h-8 w-8 rounded-lg overflow-hidden transition-colors ${
                  !form.icon
                    ? 'bg-[var(--accent-soft)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {faviconPreview ? (
                  <img
                    src={faviconPreview}
                    alt=""
                    className="w-4 h-4"
                    onError={() => setPreviewFailed(true)}
                  />
                ) : (
                  <Globe size={16} className={!form.icon ? 'text-[var(--accent)]' : undefined} />
                )}
              </button>
              {ICON_NAMES.map((name) => {
                const Icon = getIcon(name)
                const active = form.icon === name
                return (
                  <button
                    type="button"
                    key={name}
                    onClick={() => setForm((f) => ({ ...f, icon: name }))}
                    className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                      active
                        ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-[var(--text-faint)] mt-1.5">
              {form.icon ? 'Icône personnalisée sélectionnée.' : "Icône du site récupérée automatiquement (via Google)."}
            </p>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            >
              Annuler
            </button>
            <button type="submit" className="btn-accent px-4 py-2 rounded-lg text-sm font-medium">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
