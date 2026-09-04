import { useEffect, useState } from 'react'
import { NotebookPen, Plus, Trash2 } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_NOTES } from '../data/defaultData'
import { uid } from '../utils/id'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function normalizeNotes(raw) {
  if (Array.isArray(raw)) return raw
  return DEFAULT_NOTES
}

export default function NotesPage() {
  const [rawNotes, setNotes] = useLocalStorage('intra:notes', DEFAULT_NOTES)
  const notes = normalizeNotes(rawNotes)
  const [selectedId, setSelectedId] = useState(notes[0]?.id ?? null)
  const [confirmingId, setConfirmingId] = useState(null)

  // Legacy data (single string note) gets migrated to the array format once.
  useEffect(() => {
    if (!Array.isArray(rawNotes)) {
      const legacyText = typeof rawNotes === 'string' ? rawNotes.trim() : ''
      setNotes(
        legacyText
          ? [{ id: uid(), title: 'Note', content: legacyText, updatedAt: Date.now() }]
          : DEFAULT_NOTES,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!notes.some((n) => n.id === selectedId)) {
      setSelectedId(notes[0]?.id ?? null)
    }
  }, [notes, selectedId])

  const selected = notes.find((n) => n.id === selectedId) ?? null

  function createNote() {
    const note = { id: uid(), title: 'Nouvelle note', content: '', updatedAt: Date.now() }
    setNotes((prev) => [note, ...prev])
    setSelectedId(note.id)
  }

  function updateNote(id, patch) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)))
  }

  function deleteNote(id) {
    if (confirmingId !== id) {
      setConfirmingId(id)
      setTimeout(() => setConfirmingId((c) => (c === id ? null : c)), 2500)
      return
    }
    setNotes((prev) => prev.filter((n) => n.id !== id))
    setConfirmingId(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 min-h-0 h-full">
      <div className="glass glass-shadow rounded-2xl p-3 flex flex-col gap-2 min-h-0">
        <button
          type="button"
          onClick={createNote}
          className="btn-accent flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium"
        >
          <Plus size={16} />
          Nouvelle note
        </button>

        <ul className="flex flex-col gap-1.5 overflow-y-auto thin-scroll pr-1 mt-1">
          {notes.map((note) => {
            const active = note.id === selectedId
            const confirming = confirmingId === note.id
            return (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(note.id)}
                  className={`group w-full text-left rounded-xl px-3 py-2.5 transition-colors ${
                    active ? '' : 'hover:bg-[var(--surface-hover)]'
                  }`}
                  style={active ? { backgroundColor: 'var(--accent-soft)' } : undefined}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{note.title || 'Sans titre'}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                        {note.content ? note.content.slice(0, 60) : 'Note vide'}
                      </p>
                      <p className="text-[10px] text-[var(--text-faint)] mt-1">{dateFormatter.format(note.updatedAt)}</p>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNote(note.id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation()
                          deleteNote(note.id)
                        }
                      }}
                      className={`shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 ${
                        confirming ? 'text-red-500 opacity-100' : 'text-[var(--text-faint)] hover:text-red-500'
                      }`}
                      title={confirming ? 'Cliquer à nouveau pour confirmer' : 'Supprimer'}
                    >
                      <Trash2 size={13} />
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="glass glass-shadow rounded-2xl p-5 flex flex-col gap-3 min-h-0">
        {selected ? (
          <>
            <input
              value={selected.title}
              onChange={(e) => updateNote(selected.id, { title: e.target.value })}
              placeholder="Titre de la note"
              className="w-full bg-transparent outline-none text-lg font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
            />
            <textarea
              value={selected.content}
              onChange={(e) => updateNote(selected.id, { content: e.target.value })}
              placeholder="Écrivez ici…"
              className="flex-1 w-full resize-none rounded-xl bg-[var(--surface-bg)] border border-[var(--surface-border)] p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] thin-scroll"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--text-faint)]">
            <NotebookPen size={32} />
            <p className="text-sm">Aucune note. Créez-en une pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  )
}
