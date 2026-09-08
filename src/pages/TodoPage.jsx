import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTodos } from '../hooks/useTodos'
import KanbanColumn from '../components/todo/KanbanColumn'
import TaskModal from '../components/todo/TaskModal'

const COLUMNS = [
  { key: 'todo', label: 'À faire' },
  { key: 'doing', label: 'En cours' },
  { key: 'done', label: 'Terminé' },
]

export default function TodoPage() {
  const { todos, addTodo, updateTodo, deleteTodo } = useTodos()

  const [draggedId, setDraggedId] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const [dragOverCardId, setDragOverCardId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)

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
