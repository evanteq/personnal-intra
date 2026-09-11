import { useLocalStorage } from './useLocalStorage'
import { DEFAULT_TODOS } from '../data/defaultData'
import { uid } from '../utils/id'
import { advanceDateKey } from '../utils/date'

function normalizeStatus(todo) {
  if (todo.status) return todo.status
  return todo.done ? 'done' : 'todo'
}

export function useTodos() {
  const [rawTodos, setTodos] = useLocalStorage('intra:todos', DEFAULT_TODOS)
  const todos = rawTodos.map((t) => ({ ...t, status: normalizeStatus(t) }))

  function addTodo(values, status = 'todo') {
    setTodos((prev) => [
      ...prev,
      { id: uid(), status, createdAt: Date.now(), dueDate: null, dueTime: null, description: '', recur: null, ...values },
    ])
  }

  function updateTodo(id, patch) {
    setTodos((prev) => {
      const current = prev.find((t) => t.id === id)
      const justCompleted = patch.status === 'done' && current && normalizeStatus(current) !== 'done'
      const fullPatch = justCompleted ? { ...patch, completedAt: Date.now() } : patch
      const next = prev.map((t) => (t.id === id ? { ...t, ...fullPatch } : t))
      if (justCompleted && current.recur && current.dueDate) {
        next.push({
          id: uid(),
          text: current.text,
          description: current.description || '',
          status: 'todo',
          recur: current.recur,
          dueDate: advanceDateKey(current.dueDate, current.recur),
          dueTime: current.dueTime || null,
          createdAt: Date.now(),
        })
      }
      return next
    })
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return { todos, addTodo, updateTodo, deleteTodo }
}
