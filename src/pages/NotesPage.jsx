import { useEffect, useRef, useState } from 'react'
import { Bold, Heading2, Italic, List, NotebookPen, Plus, Tag, Trash2, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_NOTES } from '../data/defaultData'
import { uid } from '../utils/id'
import { stripHtml } from '../utils/html'
import PageHeader from '../components/layout/PageHeader'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function normalizeNotes(raw) {
  if (Array.isArray(raw)) return raw.map((n) => ({ tags: [], ...n }))
  return DEFAULT_NOTES
}

export default function NotesPage({ openTarget, onOpenTargetHandled }) {
  const [rawNotes, setNotes] = useLocalStorage('intra:notes', DEFAULT_NOTES)
  const notes = normalizeNotes(rawNotes)
  const [selectedId, setSelectedId] = useState(notes[0]?.id ?? null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [activeTag, setActiveTag] = useState(null)
  const [tagDraft, setTagDraft] = useState('')
  const editorRef = useRef(null)

  useEffect(() => {
    if (openTarget?.type !== 'note') return
    if (!notes.some((n) => n.id === openTarget.id)) return
    setSelectedId(openTarget.id)
    setActiveTag(null)
    onOpenTargetHandled?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTarget])

  // Legacy data (single string note) gets migrated to the array format once.
  useEffect(() => {
    if (!Array.isArray(rawNotes)) {
      const legacyText = typeof rawNotes === 'string' ? rawNotes.trim() : ''
      setNotes(
        legacyText
          ? [{ id: uid(), title: 'Note', content: legacyText, tags: [], updatedAt: Date.now() }]
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

  // Avoid an unsent tag draft from one note bleeding visually into the next.
  useEffect(() => {
    setTagDraft('')
  }, [selectedId])

  const selected = notes.find((n) => n.id === selectedId) ?? null

  // The editable area is uncontrolled (to keep the caret stable while typing);
  // only push note.content into it when switching to a different note.
  useEffect(() => {
    if (editorRef.current && editorRef.current.dataset.noteId !== selectedId) {
      editorRef.current.innerHTML = selected?.content || ''
      editorRef.current.dataset.noteId = selectedId || ''
    }
  }, [selectedId, selected?.content])

  const allTags = [...new Set(notes.flatMap((n) => n.tags || []))].sort()
  const visibleNotes = activeTag ? notes.filter((n) => (n.tags || []).includes(activeTag)) : notes

  function createNote() {
    const note = { id: uid(), title: 'Nouvelle note', content: '', tags: [], updatedAt: Date.now() }
    setNotes((prev) => [note, ...prev])
    setSelectedId(note.id)
  }

  function updateNote(id, patch) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)))
  }

  function handleEditorInput() {
    if (!selected || !editorRef.current) return
    updateNote(selected.id, { content: editorRef.current.innerHTML })
  }

  function format(command, value) {
    if (!editorRef.current) return
    editorRef.current.focus()
    document.execCommand(command, false, value)
    handleEditorInput()
  }

  function handleEditorKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      document.execCommand(e.shiftKey ? 'insertLineBreak' : 'insertParagraph')
      handleEditorInput()
    }
  }

  function addTag(id, tag) {
    const clean = tag.replace(/,/g, '').trim().toLowerCase()
    if (!clean) return
    const note = notes.find((n) => n.id === id)
    if (!note || (note.tags || []).includes(clean)) return
    updateNote(id, { tags: [...(note.tags || []), clean] })
  }

  function removeTag(id, tag) {
    const note = notes.find((n) => n.id === id)
    if (!note) return
    updateNote(id, { tags: (note.tags || []).filter((t) => t !== tag) })
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
    <div className="flex flex-col gap-4 min-h-0 h-full">
      <PageHeader title="Notes" count={notes.length} />

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 min-h-0 flex-1">
      <div className="glass glass-shadow rounded-2xl p-3 flex flex-col gap-2 min-h-0">
        <button
          type="button"
          onClick={createNote}
          className="btn-accent flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium"
        >
          <Plus size={16} />
          Nouvelle note
        </button>

        {allTags.length > 0 && (
          <div className="mt-1">
            <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wide mb-1">
              Filtrer par tag {activeTag ? `(${activeTag})` : ''}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag((t) => (t === tag ? null : tag))}
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors"
                style={
                  activeTag === tag
                    ? { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }
                    : { backgroundColor: 'var(--surface-bg)', color: 'var(--text-muted)' }
                }
              >
                <Tag size={9} />
                {tag}
              </button>
              ))}
            </div>
          </div>
        )}

        <ul className="flex flex-col gap-1.5 overflow-y-auto thin-scroll pr-1 mt-1">
          {visibleNotes.map((note) => {
            const active = note.id === selectedId
            const confirming = confirmingId === note.id
            const preview = stripHtml(note.content)
            return (
              <li key={note.id} className="animate-fade-in">
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
                      <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{preview ? preview.slice(0, 60) : 'Note vide'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-[var(--text-faint)]">{dateFormatter.format(note.updatedAt)}</p>
                        {(note.tags || []).length > 0 && (
                          <p className="text-[10px] text-[var(--text-faint)] truncate">
                            {note.tags.map((t) => `#${t}`).join(' ')}
                          </p>
                        )}
                      </div>
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
          {visibleNotes.length === 0 && (
            <p className="text-xs text-[var(--text-faint)] text-center py-4">Aucune note avec ce tag.</p>
          )}
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

            <div className="flex flex-wrap items-center gap-1.5">
              {(selected.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                  style={{ backgroundColor: 'var(--surface-bg)', color: 'var(--text-muted)' }}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(selected.id, tag)}
                    aria-label={`Retirer le tag ${tag}`}
                    className="hover:text-red-500"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    addTag(selected.id, tagDraft)
                    setTagDraft('')
                  }
                }}
                placeholder="+ tag"
                className="w-16 bg-transparent outline-none text-[11px] text-[var(--text-muted)] placeholder:text-[var(--text-faint)]"
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => format('formatBlock', 'h2')}
                aria-label="Titre"
                title="Titre"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              >
                <Heading2 size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => format('bold')}
                aria-label="Gras"
                title="Gras"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => format('italic')}
                aria-label="Italique"
                title="Italique"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => format('insertUnorderedList')}
                aria-label="Liste à puces"
                title="Liste à puces"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              >
                <List size={15} />
              </button>
            </div>

            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onKeyDown={handleEditorKeyDown}
              data-placeholder="Écrivez ici…"
              className="flex-1 w-full overflow-y-auto thin-scroll rounded-xl bg-[var(--surface-bg)] border border-[var(--surface-border)] p-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-semibold empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--text-faint)]"
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
    </div>
  )
}
