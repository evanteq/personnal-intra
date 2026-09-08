import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, NotebookPen, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_NOTES, DEFAULT_TODOS } from '../data/defaultData'
import { uid } from '../utils/id'
import { addDays, startOfWeek, toDateKey } from '../utils/date'

const dayNameFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })
const rangeFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

function normalizeStatus(todo) {
  if (todo.status) return todo.status
  return todo.done ? 'done' : 'todo'
}

export default function PlanningPage({ onNavigate }) {
  const [rawTodos, setTodos] = useLocalStorage('intra:todos', DEFAULT_TODOS)
  const [rawNotes, setNotes] = useLocalStorage('intra:notes', DEFAULT_NOTES)
  const todos = rawTodos.map((t) => ({ ...t, status: normalizeStatus(t) }))
  const notes = Array.isArray(rawNotes) ? rawNotes : []

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [dragging, setDragging] = useState(null)
  const [dragOverKey, setDragOverKey] = useState(null)
  const [drafts, setDrafts] = useState({})

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const todayKey = toDateKey(new Date())

  const unscheduledTodos = todos.filter((t) => !t.dueDate && t.status !== 'done')
  const unscheduledNotes = notes.filter((n) => !n.scheduledDate)

  function setTodoDate(id, dueDate) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, dueDate } : t)))
  }

  function setNoteDate(id, scheduledDate) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, scheduledDate } : n)))
  }

  function handleDropOn(key) {
    if (dragging) {
      if (dragging.type === 'todo') setTodoDate(dragging.id, key)
      else setNoteDate(dragging.id, key)
    }
    setDragging(null)
    setDragOverKey(null)
  }

  function addTaskForDay(key) {
    const text = (drafts[key] || '').trim()
    if (!text) return
    setTodos((prev) => [...prev, { id: uid(), text, status: 'todo', createdAt: Date.now(), dueDate: key }])
    setDrafts((prev) => ({ ...prev, [key]: '' }))
  }

  function toggleDone(id) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t)))
  }

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      <div className="glass glass-shadow rounded-2xl px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWeekStart((d) => addDays(d, -7))}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
            aria-label="Semaine précédente"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]"
          >
            Aujourd&rsquo;hui
          </button>
          <button
            type="button"
            onClick={() => setWeekStart((d) => addDays(d, 7))}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
            aria-label="Semaine suivante"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <p className="text-sm font-semibold text-[var(--text-primary)] capitalize">
          {rangeFormatter.format(days[0])} – {rangeFormatter.format(days[6])}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-3 flex-1 min-h-0">
        <div
          onDragEnter={(e) => {
            e.preventDefault()
            setDragOverKey('pool')
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            if (dragging) {
              if (dragging.type === 'todo') setTodoDate(dragging.id, null)
              else setNoteDate(dragging.id, null)
            }
            setDragging(null)
            setDragOverKey(null)
          }}
          className={`glass glass-shadow rounded-2xl p-3 flex flex-col gap-2 min-h-0 transition-colors ${
            dragOverKey === 'pool' ? 'ring-2 ring-[var(--accent)]' : ''
          }`}
        >
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide shrink-0">Non planifié</h3>
          <div className="flex flex-col gap-1.5 overflow-y-auto thin-scroll flex-1 min-h-0">
            {unscheduledTodos.map((t) => (
              <div
                key={t.id}
                draggable
                onDragStart={() => setDragging({ type: 'todo', id: t.id })}
                onDragEnd={() => setDragging(null)}
                className="text-xs rounded-lg px-2 py-1.5 glass glass-hover cursor-grab active:cursor-grabbing text-[var(--text-primary)] truncate"
                title={t.text}
              >
                {t.text}
              </div>
            ))}
            {unscheduledNotes.map((n) => (
              <div
                key={n.id}
                draggable
                onDragStart={() => setDragging({ type: 'note', id: n.id })}
                onDragEnd={() => setDragging(null)}
                className="text-xs rounded-lg px-2 py-1.5 glass glass-hover cursor-grab active:cursor-grabbing flex items-center gap-1.5 text-[var(--text-secondary)] truncate"
                title={n.title || 'Sans titre'}
              >
                <NotebookPen size={11} className="shrink-0 text-[var(--accent)]" />
                <span className="truncate">{n.title || 'Sans titre'}</span>
              </div>
            ))}
            {unscheduledTodos.length === 0 && unscheduledNotes.length === 0 && (
              <p className="text-[11px] text-[var(--text-faint)] text-center py-4">Rien à planifier</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 min-h-0 overflow-y-auto thin-scroll">
          {days.map((day) => {
            const key = toDateKey(day)
            const isToday = key === todayKey
            const dayTodos = todos.filter((t) => t.dueDate === key)
            const dayNotes = notes.filter((n) => n.scheduledDate === key)
            const isOver = dragOverKey === key
            return (
              <div
                key={key}
                onDragEnter={(e) => {
                  e.preventDefault()
                  setDragOverKey(key)
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  handleDropOn(key)
                }}
                className={`glass glass-shadow rounded-2xl p-2.5 flex flex-col gap-2 min-h-[170px] lg:min-h-0 transition-colors ${
                  isOver ? 'ring-2 ring-[var(--accent)]' : ''
                }`}
              >
                <div className="flex items-baseline justify-between shrink-0">
                  <span
                    className={`text-xs font-semibold capitalize ${
                      isToday ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {dayNameFormatter.format(day)}
                  </span>
                  <span className={`text-[11px] ${isToday ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]'}`}>
                    {day.getDate()}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 overflow-y-auto thin-scroll flex-1 min-h-0">
                  {dayTodos.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={() => setDragging({ type: 'todo', id: t.id })}
                      onDragEnd={() => setDragging(null)}
                      className="group text-xs rounded-lg px-2 py-1.5 glass glass-hover cursor-grab active:cursor-grabbing flex items-start gap-1.5"
                    >
                      <input
                        type="checkbox"
                        checked={t.status === 'done'}
                        onChange={() => toggleDone(t.id)}
                        className="mt-0.5 shrink-0 accent-[var(--accent)]"
                      />
                      <span
                        className={`truncate flex-1 ${
                          t.status === 'done' ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text-primary)]'
                        }`}
                        title={t.text}
                      >
                        {t.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTodoDate(t.id, null)}
                        aria-label="Retirer du planning"
                        className="opacity-0 group-hover:opacity-100 text-[var(--text-faint)] hover:text-red-500 shrink-0"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  {dayNotes.map((n) => (
                    <div
                      key={n.id}
                      draggable
                      onDragStart={() => setDragging({ type: 'note', id: n.id })}
                      onDragEnd={() => setDragging(null)}
                      className="group text-xs rounded-lg px-2 py-1.5 glass glass-hover cursor-grab active:cursor-grabbing flex items-center gap-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => onNavigate('notes')}
                        className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                        title={n.title || 'Sans titre'}
                      >
                        <NotebookPen size={11} className="shrink-0 text-[var(--accent)]" />
                        <span className="truncate text-[var(--text-secondary)]">{n.title || 'Sans titre'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoteDate(n.id, null)}
                        aria-label="Retirer du planning"
                        className="opacity-0 group-hover:opacity-100 text-[var(--text-faint)] hover:text-red-500 shrink-0"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    addTaskForDay(key)
                  }}
                  className="shrink-0"
                >
                  <input
                    value={drafts[key] || ''}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder="+ tâche"
                    className="w-full min-w-0 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-2 py-1 text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)]"
                  />
                </form>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
