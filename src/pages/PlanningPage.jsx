import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useTodos } from '../hooks/useTodos'
import { useLocalStorage } from '../hooks/useLocalStorage'
import TaskModal from '../components/todo/TaskModal'
import { addDays, startOfWeek, toDateKey } from '../utils/date'

const dayNameFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })
const rangeFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

const VIEW_OPTIONS = [
  { key: 'work', label: 'Semaine de travail' },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
]

function TaskChip({ todo, fading, onOpen, onToggle, onUnschedule, onDragStart, onDragEnd }) {
  const checked = fading || todo.status === 'done'
  return (
    <div
      draggable={!fading}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={fading ? undefined : onOpen}
      className={`group text-xs rounded-lg px-2 py-1.5 glass glass-hover flex items-start gap-1.5 ${
        fading ? 'task-completing' : 'cursor-pointer'
      }`}
      title={todo.text}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        className="mt-0.5 shrink-0 accent-[var(--accent)]"
      />
      <span className="relative flex-1 min-w-0">
        <span className={`block truncate ${checked && !fading ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text-primary)]'}`}>
          {todo.text}
        </span>
        {fading && <span className="task-strike-line" />}
      </span>
      {todo.dueDate && !fading && (
        <button
          type="button"
          onClick={onUnschedule}
          aria-label="Retirer du planning"
          className="opacity-0 group-hover:opacity-100 text-[var(--text-faint)] hover:text-red-500 shrink-0"
        >
          <X size={11} />
        </button>
      )}
    </div>
  )
}

export default function PlanningPage() {
  const { todos, addTodo, updateTodo, deleteTodo } = useTodos()
  const [viewMode, setViewMode] = useLocalStorage('intra:planningView', 'week')
  const [anchor, setAnchor] = useState(() => new Date())
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverKey, setDragOverKey] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [fadingIds, setFadingIds] = useState(() => new Set())

  const todayKey = toDateKey(new Date())

  const days = useMemo(() => {
    if (viewMode === 'month') {
      const year = anchor.getFullYear()
      const month = anchor.getMonth()
      const firstOfMonth = new Date(year, month, 1)
      const lastOfMonth = new Date(year, month + 1, 0)
      const gridStart = startOfWeek(firstOfMonth)
      const gridEndWeekStart = startOfWeek(lastOfMonth)
      const totalDays = Math.round((addDays(gridEndWeekStart, 6) - gridStart) / 86400000) + 1
      return Array.from({ length: totalDays }, (_, i) => addDays(gridStart, i))
    }
    const weekStart = startOfWeek(anchor)
    const count = viewMode === 'work' ? 5 : 7
    return Array.from({ length: count }, (_, i) => addDays(weekStart, i))
  }, [anchor, viewMode])

  const unscheduled = todos.filter((t) => !t.dueDate && (t.status !== 'done' || fadingIds.has(t.id)))

  function goPrev() {
    setAnchor((d) => (viewMode === 'month' ? new Date(d.getFullYear(), d.getMonth() - 1, 1) : addDays(d, -7)))
  }

  function goNext() {
    setAnchor((d) => (viewMode === 'month' ? new Date(d.getFullYear(), d.getMonth() + 1, 1) : addDays(d, 7)))
  }

  function goToday() {
    setAnchor(new Date())
  }

  function handleDropOn(key) {
    if (draggingId) updateTodo(draggingId, { dueDate: key })
    setDraggingId(null)
    setDragOverKey(null)
  }

  function openCreate() {
    setEditingTodo(null)
    setModalOpen(true)
  }

  function openEdit(todo) {
    setEditingTodo(todo)
    setModalOpen(true)
  }

  function handleSave(values) {
    if (editingTodo) updateTodo(editingTodo.id, values)
    else addTodo(values)
    setModalOpen(false)
  }

  function handleDelete() {
    if (editingTodo) deleteTodo(editingTodo.id)
    setModalOpen(false)
  }

  const headerLabel =
    viewMode === 'month'
      ? monthFormatter.format(anchor)
      : `${rangeFormatter.format(days[0])} – ${rangeFormatter.format(days[days.length - 1])}`

  function chipProps(todo) {
    return {
      todo,
      fading: fadingIds.has(todo.id),
      onOpen: () => openEdit(todo),
      onToggle: (e) => {
        e.stopPropagation()
        if (todo.status === 'done') {
          updateTodo(todo.id, { status: 'todo' })
          return
        }
        setFadingIds((prev) => new Set(prev).add(todo.id))
        setTimeout(() => {
          updateTodo(todo.id, { status: 'done' })
          setFadingIds((prev) => {
            const next = new Set(prev)
            next.delete(todo.id)
            return next
          })
        }, 1000)
      },
      onUnschedule: (e) => {
        e.stopPropagation()
        updateTodo(todo.id, { dueDate: null })
      },
      onDragStart: () => setDraggingId(todo.id),
      onDragEnd: () => setDraggingId(null),
    }
  }

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      <div className="glass glass-shadow rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
            aria-label="Précédent"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]"
          >
            Aujourd&rsquo;hui
          </button>
          <button
            type="button"
            onClick={goNext}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
            aria-label="Suivant"
          >
            <ChevronRight size={16} />
          </button>
          <p className="text-sm font-semibold text-[var(--text-primary)] capitalize ml-2">{headerLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-lg p-1" style={{ backgroundColor: 'var(--surface-bg)' }}>
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setViewMode(opt.key)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors"
                style={
                  viewMode === opt.key
                    ? { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }
                    : { color: 'var(--text-muted)' }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="btn-accent flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium"
          >
            <Plus size={16} />
            Ajouter une tâche
          </button>
        </div>
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
            if (draggingId) updateTodo(draggingId, { dueDate: null })
            setDraggingId(null)
            setDragOverKey(null)
          }}
          className={`glass glass-shadow rounded-2xl p-3 flex flex-col gap-2 min-h-0 transition-colors ${
            dragOverKey === 'pool' ? 'ring-2 ring-[var(--accent)]' : ''
          }`}
        >
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide shrink-0">Non planifié</h3>
          <div className="flex flex-col gap-1.5 overflow-y-auto thin-scroll flex-1 min-h-0">
            {unscheduled.map((t) => (
              <TaskChip key={t.id} {...chipProps(t)} />
            ))}
            {unscheduled.length === 0 && (
              <p className="text-[11px] text-[var(--text-faint)] text-center py-4">Rien à planifier</p>
            )}
          </div>
        </div>

        {viewMode === 'month' ? (
          <div className="flex flex-col gap-2 min-h-0">
            <div className="grid grid-cols-7 gap-2 shrink-0 px-0.5">
              {days.slice(0, 7).map((d) => (
                <span
                  key={toDateKey(d)}
                  className="text-[11px] font-semibold text-[var(--text-faint)] text-center capitalize"
                >
                  {dayNameFormatter.format(d)}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 min-h-0 flex-1 overflow-y-auto thin-scroll auto-rows-[minmax(90px,auto)]">
              {days.map((day) => {
                const key = toDateKey(day)
                const isToday = key === todayKey
                const inMonth = day.getMonth() === anchor.getMonth()
                const isWeekend = day.getDay() === 0 || day.getDay() === 6
                const dayTodos = todos.filter((t) => t.dueDate === key && (t.status !== 'done' || fadingIds.has(t.id)))
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
                    className={`glass rounded-xl p-2 flex flex-col gap-1.5 min-h-0 transition-colors ${
                      isOver ? 'ring-2 ring-[var(--accent)]' : ''
                    } ${isWeekend ? 'day-weekend' : ''} ${!inMonth ? 'opacity-40' : ''}`}
                  >
                    <span
                      className={`text-[11px] font-semibold shrink-0 ${isToday ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]'}`}
                    >
                      {day.getDate()}
                    </span>
                    <div className="flex flex-col gap-1 overflow-y-auto thin-scroll flex-1 min-h-0">
                      {dayTodos.map((t) => (
                        <TaskChip key={t.id} {...chipProps(t)} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              viewMode === 'work' ? 'lg:grid-cols-5' : 'lg:grid-cols-7'
            } gap-2 min-h-0 overflow-y-auto thin-scroll`}
          >
            {days.map((day) => {
              const key = toDateKey(day)
              const isToday = key === todayKey
              const dayTodos = todos.filter((t) => t.dueDate === key && (t.status !== 'done' || fadingIds.has(t.id)))
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
                      <TaskChip key={t.id} {...chipProps(t)} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <TaskModal
        open={modalOpen}
        todo={editingTodo}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
