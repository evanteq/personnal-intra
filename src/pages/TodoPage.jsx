import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_TODOS } from '../data/defaultData'
import { uid } from '../utils/id'
import KanbanColumn from '../components/todo/KanbanColumn'

const COLUMNS = [
  { key: 'todo', label: 'À faire' },
  { key: 'doing', label: 'En cours' },
  { key: 'done', label: 'Terminé' },
]

function normalizeStatus(todo) {
  if (todo.status) return todo.status
  return todo.done ? 'done' : 'todo'
}

export default function TodoPage() {
  const [rawTodos, setTodos] = useLocalStorage('intra:todos', DEFAULT_TODOS)
  const todos = rawTodos.map((t) => ({ ...t, status: normalizeStatus(t) }))

  const [draggedId, setDraggedId] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const [dragOverCardId, setDragOverCardId] = useState(null)

  function addTodo(status, text) {
    setTodos((prev) => [...prev, { id: uid(), text, status, createdAt: Date.now() }])
  }

  function moveTodoTo(id, status) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  function moveTodoByOffset(id, offset) {
    const index = COLUMNS.findIndex((c) => c.key === todos.find((t) => t.id === id)?.status)
    const nextIndex = index + offset
    if (nextIndex < 0 || nextIndex >= COLUMNS.length) return
    moveTodoTo(id, COLUMNS[nextIndex].key)
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
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

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full min-h-0">
      {COLUMNS.map((col, i) => (
        <KanbanColumn
          key={col.key}
          status={col.key}
          label={col.label}
          todos={todos.filter((t) => t.status === col.key)}
          onAdd={(text) => addTodo(col.key, text)}
          onMove={(id, dir) => moveTodoByOffset(id, dir)}
          onDelete={deleteTodo}
          isOver={dragOverColumn === col.key}
          columnDragHandlers={makeColumnDragHandlers(col.key)}
          makeCardDragHandlers={makeCardDragHandlers}
          dragOverCardId={dragOverCardId}
          canMoveLeft={i > 0}
          canMoveRight={i < COLUMNS.length - 1}
        />
      ))}
    </div>
  )
}
