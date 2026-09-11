import { useEffect, useRef, useState } from 'react'
import { Bold, Eye, Heading2, Italic, List, NotebookPen, Pencil, Plus, Tag, Trash2, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_NOTES } from '../data/defaultData'
import { uid } from '../utils/id'
import { renderMarkdown } from '../utils/markdown'

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
  const [previewMode, setPreviewMode] = useState(false)
  const textareaRef = useRef(null)

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

  useEffect(() => {
    setPreviewMode(false)
  }, [selectedId])

  const selected = notes.find((n) => n.id === selectedId) ?? null

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

  function addTag(id, tag) {
    const clean = tag.trim().toLowerCase()
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

  function wrapSelection(before, after = before) {
    const el = textareaRef.current
    if (!el || !selected) return
    const { selectionStart, selectionEnd, value } = el
    const chunk = value.slice(selectionStart, selectionEnd)
    const nextValue = value.slice(0, selectionStart) + before + chunk + after + value.slice(selectionEnd)
    updateNote(selected.id, { content: nextValue })
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = selectionStart + before.length
      el.selectionEnd = selectionStart + before.length + chunk.length
    })
  }

  function prefixLine(prefix) {
    const el = textareaRef.current
    if (!el || !selected) return
    const { selectionStart, value } = el
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
    const nextValue = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    updateNote(selected.id, { content: nextValue })
    requestAnimationFrame(() => {
      el.focus()
      const pos = selectionStart + prefix.length
      el.selectionStart = el.selectionEnd = pos
    })
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

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
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
        )}

        <ul className="flex flex-col gap-1.5 overflow-y-auto thin-scroll pr-1 mt-1">
          {visibleNotes.map((note) => {
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
            <div className="flex items-center gap-2">
              <input
                value={selected.title}
                onChange={(e) => updateNote(selected.id, { title: e.target.value })}
                placeholder="Titre de la note"
                className="flex-1 min-w-0 bg-transparent outline-none text-lg font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
              />
              <button
                type="button"
                onClick={() => setPreviewMode((p) => !p)}
                className="shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                style={previewMode ? { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' } : undefined}
              >
                {previewMode ? <Pencil size={13} /> : <Eye size={13} />}
                {previewMode ? 'Éditer' : 'Aperçu'}
              </button>
            </div>

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

            {previewMode ? (
              <div
                className="flex-1 w-full overflow-y-auto thin-scroll rounded-xl bg-[var(--surface-bg)] border border-[var(--surface-border)] p-4 text-sm text-[var(--text-primary)] [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_h4]:text-sm [&_h4]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_p]:mb-1 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) || '<p class="text-[var(--text-faint)]">Note vide.</p>' }}
              />
            ) : (
              <>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => prefixLine('## ')}
                    aria-label="Titre"
                    title="Titre"
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                  >
                    <Heading2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => wrapSelection('**')}
                    aria-label="Gras"
                    title="Gras"
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                  >
                    <Bold size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => wrapSelection('*')}
                    aria-label="Italique"
                    title="Italique"
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                  >
                    <Italic size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => prefixLine('- ')}
                    aria-label="Liste à puces"
                    title="Liste à puces"
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                  >
                    <List size={15} />
                  </button>
                </div>
                <textarea
                  ref={textareaRef}
                  value={selected.content}
                  onChange={(e) => updateNote(selected.id, { content: e.target.value })}
                  placeholder="Écrivez ici… (# titre, **gras**, *italique*, - liste)"
                  className="flex-1 w-full resize-none rounded-xl bg-[var(--surface-bg)] border border-[var(--surface-border)] p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] thin-scroll"
                />
              </>
            )}
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
