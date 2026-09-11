import { useEffect, useState } from 'react'
import { CalendarClock, CalendarDays, Plus, Repeat } from 'lucide-react'
import { useTodos } from '../hooks/useTodos'
import KanbanColumn from '../components/todo/KanbanColumn'
import TaskModal from '../components/todo/TaskModal'
import { parseDateKey, toDateKey } from '../utils/date'

const COLUMNS = [
  { key: 'todo', label: 'À faire' },
  { key: 'doing', label: 'En cours' },
  { key: 'done', label: 'Terminé' },
]

const dueDateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

function DeadlineCard({ todo, onOpen }) {
  const overdue = todo.dueDate < toDateKey(new Date())
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`shrink-0 flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border text-left transition-colors hover:bg-[var(--surface-hover)] ${
        overdue ? 'border-red-500/40' : 'border-[var(--surface-border)]'
      }`}
      title={todo.text}
    >
      <span
        className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-[10px] font-semibold ${
          overdue ? 'text-red-500 bg-red-500/10' : 'text-[var(--accent)]'
        }`}
        style={overdue ? undefined : { backgroundColor: 'var(--accent-soft)' }}
      >
        <CalendarDays size={12} />
      </span>
      <span className="text-sm text-[var(--text-primary)] truncate max-w-[160px]">{todo.text}</span>
      {todo.recur && <Repeat size={11} className="text-[var(--text-faint)] shrink-0" />}
      <span className={`text-xs shrink-0 ${overdue ? 'text-red-500 font-medium' : 'text-[var(--text-faint)]'}`}>
        {dueDateFormatter.format(parseDateKey(todo.dueDate))}
      </span>
    </button>
  )
}

export default function TodoPage({ openTarget, onOpenTargetHandled }) {
  const { todos, addTodo, updateTodo, deleteTodo } = useTodos()

  const [draggedId, setDraggedId] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const [dragOverCardId, setDragOverCardId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)

  useEffect(() => {
    if (openTarget?.type !== 'todo') return
    const todo = todos.find((t) => t.id === openTarget.id)
    if (!todo) return
    setEditingTodo(todo)
    setModalOpen(true)
    onOpenTargetHandled?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTarget])

  function moveTodoTo(id, status) {
    updateTodo(id, { status })
  }

  function moveTodoByOffset(id, offset) {
    const index = COLUMNS.findIndex((c) => c.key === todos.find((t) => t.id === id)?.status)
    const nextIndex = index + offset
    if (nextIndex < 0 || nextIndex >= COLUMNS.length) return
    moveTodoTo(id, COLUMNS[nextIndex].key)
  }

  function makeCardDragHandlers(id) {
    return {
      onDragStart: () => setDraggedId(id),
      onDragEnter: (e) => {
        e.preventDefault()
        setDragOverCardId(id)
      },
      onDragOver: (e) => e.preventDefault(),
      onDragEnd: () => {
        setDraggedId(null)
        setDragOverColumn(null)
        setDragOverCardId(null)
      },
    }
  }

  function makeColumnDragHandlers(status) {
    return {
      onDragEnter: (e) => {
        e.preventDefault()
        setDragOverColumn(status)
      },
      onDragOver: (e) => e.preventDefault(),
      onDrop: (e) => {
        e.preventDefault()
        if (draggedId) moveTodoTo(draggedId, status)
        setDraggedId(null)
        setDragOverColumn(null)
        setDragOverCardId(null)
      },
    }
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

  const upcoming = todos
    .filter((t) => t.dueDate && t.status !== 'done')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      <div className="flex justify-end shrink-0">
        <button
          type="button"
          onClick={openCreate}
          className="btn-accent flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
        >
          <Plus size={16} />
          Ajouter une tâche
        </button>
      </div>

      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 shrink-0"
        style={{ backgroundColor: 'var(--accent-soft)' }}
      >
        <div className="flex items-center gap-2 shrink-0 text-[var(--accent)]">
          <CalendarClock size={16} />
          <h3 className="text-sm font-semibold">Prochaines échéances</h3>
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto thin-scroll py-0.5">
          {upcoming.map((todo) => (
            <DeadlineCard key={todo.id} todo={todo} onOpen={() => openEdit(todo)} />
          ))}
          {upcoming.length === 0 && (
            <p className="text-xs text-[var(--text-muted)]">Aucune échéance à venir</p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        {COLUMNS.map((col, i) => (
          <KanbanColumn
            key={col.key}
            label={col.label}
            todos={todos.filter((t) => t.status === col.key)}
            onMove={(id, dir) => moveTodoByOffset(id, dir)}
            onDelete={deleteTodo}
            onOpenTask={openEdit}
            isOver={dragOverColumn === col.key}
            columnDragHandlers={makeColumnDragHandlers(col.key)}
            makeCardDragHandlers={makeCardDragHandlers}
            dragOverCardId={dragOverCardId}
            canMoveLeft={i > 0}
            canMoveRight={i < COLUMNS.length - 1}
          />
        ))}
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
