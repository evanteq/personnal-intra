import { useLocalStorage } from './useLocalStorage'
import { DEFAULT_TODOS } from '../data/defaultData'
import { uid } from '../utils/id'

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
      { id: uid(), status, createdAt: Date.now(), dueDate: null, description: '', ...values },
    ])
  }

  function updateTodo(id, patch) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return { todos, addTodo, updateTodo, deleteTodo }
}
