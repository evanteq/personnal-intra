import { useEffect, useState } from 'react'
import { Kanban, NotebookPen, Search, X } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useTodos } from '../../hooks/useTodos'
import { DEFAULT_CATEGORIES, DEFAULT_LINKS, DEFAULT_NOTES } from '../../data/defaultData'
import { getIcon } from '../../data/iconOptions'
import { getFaviconUrl } from '../../utils/favicon'

const MAX_PER_GROUP = 5

export default function GlobalSearch({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState('')
  const [links] = useLocalStorage('intra:links', DEFAULT_LINKS)
  const [categories] = useLocalStorage('intra:categories', DEFAULT_CATEGORIES)
  const [notes] = useLocalStorage('intra:notes', DEFAULT_NOTES)
  const { todos } = useTodos()

  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const q = query.trim().toLowerCase()

  function categoryName(id) {
    return categories.find((c) => c.id === id)?.name ?? ''
  }

  const matchedLinks = q ? links.filter((l) => l.title.toLowerCase().includes(q)).slice(0, MAX_PER_GROUP) : []
  const matchedNotes = q
    ? notes
        .filter((n) => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q))
        .slice(0, MAX_PER_GROUP)
    : []
  const matchedTodos = q ? todos.filter((t) => t.text.toLowerCase().includes(q)).slice(0, MAX_PER_GROUP) : []
  const hasResults = matchedLinks.length > 0 || matchedNotes.length > 0 || matchedTodos.length > 0

  function go(page) {
    onNavigate(page)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 animate-fade-in"
      style={{ backgroundColor: 'var(--scrim)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl glass shadow-[var(--shadow-lg)] flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--surface-border)]">
          <Search size={16} className="text-[var(--text-muted)] shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans raccourcis, notes, tâches…"
            className="w-full bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
          />
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto thin-scroll p-2">
          {!q && (
            <p className="text-xs text-[var(--text-faint)] text-center py-6">Commencez à taper pour rechercher.</p>
          )}
          {q && !hasResults && <p className="text-xs text-[var(--text-faint)] text-center py-6">Aucun résultat.</p>}

          {matchedLinks.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wide">Raccourcis</p>
              {matchedLinks.map((link) => {
                const Icon = getIcon(link.icon)
                const faviconUrl = !link.icon ? getFaviconUrl(link.url) : null
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => go('shortcuts')}
                    className="w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[var(--surface-hover)] text-left"
                  >
                    <div
                      className="flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden shrink-0"
                      style={{ backgroundColor: 'var(--accent-soft)' }}
                    >
                      {faviconUrl ? (
                        <img src={faviconUrl} alt="" className="w-4 h-4" draggable={false} />
                      ) : (
                        <Icon size={13} className="text-[var(--accent)]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--text-primary)] truncate">{link.title}</p>
                      <p className="text-[11px] text-[var(--text-faint)] truncate">{categoryName(link.categoryId)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {matchedNotes.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wide">Notes</p>
              {matchedNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => go('notes')}
                  className="w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[var(--surface-hover)] text-left"
                >
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                    style={{ backgroundColor: 'var(--accent-soft)' }}
                  >
                    <NotebookPen size={13} className="text-[var(--accent)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">{note.title || 'Sans titre'}</p>
                    <p className="text-[11px] text-[var(--text-faint)] truncate">{note.content?.slice(0, 60)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {matchedTodos.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wide">Tâches</p>
              {matchedTodos.map((todo) => (
                <button
                  key={todo.id}
                  type="button"
                  onClick={() => go('todo')}
                  className="w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[var(--surface-hover)] text-left"
                >
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                    style={{ backgroundColor: 'var(--accent-soft)' }}
                  >
                    <Kanban size={13} className="text-[var(--accent)]" />
                  </div>
                  <p className="text-sm text-[var(--text-primary)] truncate">{todo.text}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-1 px-4 py-2 border-t border-[var(--surface-border)] text-[10px] text-[var(--text-faint)]">
          <kbd className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-bg)' }}>
            Esc
          </kbd>
          pour fermer
        </div>
      </div>
    </div>
  )
}
