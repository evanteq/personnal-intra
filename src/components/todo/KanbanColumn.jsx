import { useState } from 'react'
import { Plus } from 'lucide-react'
import KanbanCard from './KanbanCard'

export default function KanbanColumn({
  label,
  todos,
  onAdd,
  onMove,
  onDelete,
  isOver,
  columnDragHandlers,
  makeCardDragHandlers,
  dragOverCardId,
  canMoveLeft,
  canMoveRight,
}) {
  const [draft, setDraft] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    onAdd(text)
    setDraft('')
  }

  return (
    <div
      {...columnDragHandlers}
      className={`flex flex-col gap-3 rounded-2xl p-4 glass min-h-0 flex-1 transition-colors ${
        isOver ? 'ring-2 ring-[var(--accent)]' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{label}</h3>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full text-[var(--text-muted)]"
          style={{ backgroundColor: 'var(--surface-bg)' }}
        >
          {todos.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto thin-scroll pr-1 flex-1 min-h-[80px]">
        {todos.map((todo) => (
          <KanbanCard
            key={todo.id}
            todo={todo}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            onMove={(dir) => onMove(todo.id, dir)}
            onDelete={onDelete}
            isDragOver={dragOverCardId === todo.id}
            dragHandlers={makeCardDragHandlers(todo.id)}
          />
        ))}
        {todos.length === 0 && (
          <p className="text-xs text-[var(--text-faint)] text-center py-4">Aucune tâche</p>
        )}
      </div>

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ajouter une tâche…"
          className="flex-1 min-w-0 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          aria-label="Ajouter"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] shrink-0"
        >
          <Plus size={16} />
        </button>
      </form>
    </div>
  )
}
