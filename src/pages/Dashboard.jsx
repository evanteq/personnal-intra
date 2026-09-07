import { useEffect, useState } from 'react'
import { ArrowRight, CircleCheck, Link2, ListTodo, NotebookPen, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_CATEGORIES, DEFAULT_LINKS, DEFAULT_NOTES, DEFAULT_TODOS } from '../data/defaultData'
import { getIcon } from '../data/iconOptions'
import { getFaviconUrl } from '../utils/favicon'
import TimezoneBanner from '../components/dashboard/TimezoneBanner'
import QuickLinkPicker from '../components/dashboard/QuickLinkPicker'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

const QUICK_LINK_COUNT = 25

function normalizeStatus(todo) {
  if (todo.status) return todo.status
  return todo.done ? 'done' : 'todo'
}

function emptySlots() {
  return Array(QUICK_LINK_COUNT).fill(null)
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 flex-1 min-w-[140px]">
      <Icon size={18} className="text-[var(--accent)] shrink-0" />
      <div>
        <p className="text-xl font-semibold text-[var(--text-primary)] leading-none">{value}</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
      </div>
    </div>
  )
}

function SectionCard({ title, onSeeAll, children, className = '' }) {
  return (
    <div className={`glass glass-shadow rounded-2xl p-4 flex flex-col gap-2 min-h-0 h-full ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        <button
          type="button"
          onClick={onSeeAll}
          className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
        >
          Voir tout
          <ArrowRight size={12} />
        </button>
      </div>
      {children}
    </div>
  )
}

export default function Dashboard({ onNavigate }) {
  const [links] = useLocalStorage('intra:links', DEFAULT_LINKS)
  const [categories] = useLocalStorage('intra:categories', DEFAULT_CATEGORIES)
  const [rawNotes] = useLocalStorage('intra:notes', DEFAULT_NOTES)
  const [rawTodos] = useLocalStorage('intra:todos', DEFAULT_TODOS)
  const [quickSlots, setQuickSlots] = useLocalStorage('intra:quickSlots', () => {
    const seeded = [...links].sort((a, b) => a.order - b.order).slice(0, QUICK_LINK_COUNT).map((l) => l.id)
    return [...seeded, ...emptySlots()].slice(0, QUICK_LINK_COUNT)
  })

  const [pickerSlot, setPickerSlot] = useState(null)
  const [dragIndex, setDragIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const notes = Array.isArray(rawNotes) ? rawNotes : []
  const todos = rawTodos.map((t) => ({ ...t, status: normalizeStatus(t) }))

  const todoCount = todos.filter((t) => t.status === 'todo').length
  const doingCount = todos.filter((t) => t.status === 'doing').length
  const doneCount = todos.filter((t) => t.status === 'done').length
  const latestNote = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)[0]

  // Drop dangling references if a pinned shortcut was deleted elsewhere.
  useEffect(() => {
    const validIds = new Set(links.map((l) => l.id))
    setQuickSlots((prev) => {
      let changed = false
      const next = prev.map((id) => {
        if (id && !validIds.has(id)) {
          changed = true
          return null
        }
        return id
      })
      return changed ? next : prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links])

  function assignSlot(index, linkId) {
    setQuickSlots((prev) => {
      const next = [...prev]
      while (next.length < QUICK_LINK_COUNT) next.push(null)
      next[index] = linkId
      return next
    })
    setPickerSlot(null)
  }

  function clearSlot(index) {
    setQuickSlots((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
  }

  function swapSlots(fromIndex, toIndex) {
    setQuickSlots((prev) => {
      const next = [...prev]
      ;[next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]]
      return next
    })
  }

  function handleDropOn(index) {
    if (dragIndex !== null && dragIndex !== index) swapSlots(dragIndex, index)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const availableLinks = links.filter((l) => !quickSlots.includes(l.id))

  return (
    <div className="flex flex-col gap-3 h-full min-h-0 overflow-y-auto thin-scroll pr-1">
      <TimezoneBanner />

      <div className="glass glass-shadow rounded-2xl flex flex-wrap divide-x divide-[var(--surface-border)] shrink-0">
        <Stat icon={Link2} value={links.length} label="Raccourcis" />
        <Stat icon={NotebookPen} value={notes.length} label="Notes" />
        <Stat icon={ListTodo} value={todoCount + doingCount} label="Tâches en cours" />
        <Stat icon={CircleCheck} value={doneCount} label="Tâches terminées" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-3 flex-1 min-h-0">
        <SectionCard title="Raccourcis rapides" onSeeAll={() => onNavigate('shortcuts')}>
          <div className="grid grid-cols-5 grid-rows-5 gap-2 flex-1 min-h-0 h-full w-full">
            {Array.from({ length: QUICK_LINK_COUNT }).map((_, index) => {
              const link = links.find((l) => l.id === quickSlots[index])
              const isDragOver = dragOverIndex === index

              if (link) {
                const Icon = getIcon(link.icon)
                const faviconUrl = !link.icon ? getFaviconUrl(link.url) : null
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      setDragOverIndex(index)
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      handleDropOn(index)
                    }}
                    onDragEnd={() => {
                      setDragIndex(null)
                      setDragOverIndex(null)
                    }}
                    className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-xl p-2 h-full w-full hover:bg-[var(--surface-hover)] transition-colors cursor-grab active:cursor-grabbing ${
                      isDragOver ? 'ring-2 ring-[var(--accent)]' : ''
                    }`}
                    title={link.title}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearSlot(index)
                      }}
                      aria-label="Retirer des raccourcis rapides"
                      className="absolute top-0.5 right-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 text-[var(--text-faint)] hover:text-red-500 transition-opacity"
                    >
                      <X size={11} />
                    </button>
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-lg overflow-hidden shrink-0"
                      style={{ backgroundColor: 'var(--accent-soft)' }}
                    >
                      {faviconUrl ? (
                        <img src={faviconUrl} alt="" className="w-5 h-5" draggable={false} />
                      ) : (
                        <Icon size={16} className="text-[var(--accent)]" />
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--text-secondary)] truncate w-full text-center">
                      {link.title}
                    </span>
                  </a>
                )
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPickerSlot(index)}
                  onDragEnter={(e) => {
                    e.preventDefault()
                    setDragOverIndex(index)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleDropOn(index)
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-2 h-full w-full border border-dashed border-[var(--surface-border)] text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/60 transition-colors ${
                    isDragOver ? 'ring-2 ring-[var(--accent)]' : ''
                  }`}
                  title="Ajouter un raccourci"
                >
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg text-lg leading-none">+</span>
                  <span className="text-[11px]">Ajouter</span>
                </button>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard title="Dernière note" onSeeAll={() => onNavigate('notes')}>
          {latestNote ? (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--text-primary)]">{latestNote.title || 'Sans titre'}</p>
                <span className="text-[11px] text-[var(--text-faint)] shrink-0 ml-2">
                  {dateFormatter.format(latestNote.updatedAt)}
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-2 whitespace-pre-wrap line-clamp-[10] overflow-hidden">
                {latestNote.content || 'Note vide.'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-faint)] text-center py-4">Aucune note pour le moment</p>
          )}
        </SectionCard>
      </div>

      <QuickLinkPicker
        open={pickerSlot !== null}
        links={availableLinks}
        categories={categories}
        onPick={(linkId) => assignSlot(pickerSlot, linkId)}
        onClose={() => setPickerSlot(null)}
      />
    </div>
  )
}
