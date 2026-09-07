import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { getIcon } from '../../data/iconOptions'
import { getFaviconUrl } from '../../utils/favicon'

export default function QuickLinkPicker({ open, links, categories, onPick, onClose }) {
  const [query, setQuery] = useState('')

  if (!open) return null

  const q = query.trim().toLowerCase()
  const filtered = links.filter((l) => !q || l.title.toLowerCase().includes(q))

  function categoryName(id) {
    return categories.find((c) => c.id === id)?.name ?? ''
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'var(--scrim)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl glass p-5 shadow-[var(--shadow-lg)] flex flex-col gap-3 max-h-[70vh]"
        style={{ backgroundColor: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Choisir un raccourci</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2">
          <Search size={14} className="text-[var(--text-muted)] shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            className="w-full bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
          />
        </div>

        <ul className="flex-1 overflow-y-auto thin-scroll flex flex-col gap-1 -mx-1 px-1">
          {filtered.map((link) => {
            const Icon = getIcon(link.icon)
            const faviconUrl = !link.icon ? getFaviconUrl(link.url) : null
            return (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => onPick(link.id)}
                  className="w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[var(--surface-hover)] text-left"
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden shrink-0"
                    style={{ backgroundColor: 'var(--accent-soft)' }}
                  >
                    {faviconUrl ? (
                      <img src={faviconUrl} alt="" className="w-4 h-4" draggable={false} />
                    ) : (
                      <Icon size={14} className="text-[var(--accent)]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">{link.title}</p>
                    <p className="text-xs text-[var(--text-faint)] truncate">{categoryName(link.categoryId)}</p>
                  </div>
                </button>
              </li>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-[var(--text-faint)] text-center py-6">
              {links.length === 0 ? 'Aucun raccourci disponible — créez-en depuis la page Raccourcis.' : 'Aucun résultat.'}
            </p>
          )}
        </ul>
      </div>
    </div>
  )
}
