import { useEffect, useState } from 'react'
import { CalendarDays, Plus, Repeat } from 'lucide-react'
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
      className="flex flex-col gap-1.5 rounded-xl p-3 glass glass-hover text-left w-full"
    >
      <div className="flex items-center gap-1.5">
        {todo.recur && <Repeat size={11} className="text-[var(--text-faint)] shrink-0" />}
        <p className="flex-1 min-w-0 text-sm text-[var(--text-primary)] truncate">{todo.text}</p>
      </div>
      <span
        className={`inline-flex items-center gap-1 self-start text-[10px] px-1.5 py-0.5 rounded-full ${
          overdue ? 'text-red-500 bg-red-500/10' : 'text-[var(--text-muted)]'
        }`}
        style={overdue ? undefined : { backgroundColor: 'var(--surface-bg)' }}
      >
        <CalendarDays size={10} />
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

        <div className="flex flex-col gap-3 rounded-2xl p-4 glass min-h-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Échéances</h3>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full text-[var(--text-muted)]"
              style={{ backgroundColor: 'var(--surface-bg)' }}
            >
              {upcoming.length}
            </span>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto thin-scroll pr-1 flex-1 min-h-[80px]">
            {upcoming.map((todo) => (
              <DeadlineCard key={todo.id} todo={todo} onOpen={() => openEdit(todo)} />
            ))}
            {upcoming.length === 0 && (
              <p className="text-xs text-[var(--text-faint)] text-center py-4">Aucune échéance</p>
            )}
          </div>
        </div>
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
