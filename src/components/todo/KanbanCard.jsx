import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, GripVertical, Trash2 } from 'lucide-react'
import { parseDateKey, toDateKey } from '../../utils/date'

const dueDateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

export default function KanbanCard({ todo, canMoveLeft, canMoveRight, onMove, onDelete, dragHandlers, isDragOver }) {
  const [confirming, setConfirming] = useState(false)
  const overdue = todo.dueDate && todo.dueDate < toDateKey(new Date()) && todo.status !== 'done'

  function handleDelete() {
    if (confirming) {
      onDelete(todo.id)
    } else {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 2500)
    }
  }

  return (
    <div
      draggable
      {...dragHandlers}
      className={`group flex flex-col gap-2 rounded-xl p-3 glass glass-hover cursor-grab active:cursor-grabbing animate-fade-in ${
        isDragOver ? 'ring-2 ring-[var(--accent)]' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <GripVertical size={14} className="text-[var(--text-faint)] mt-0.5 shrink-0" />
        <p className="flex-1 min-w-0 text-sm text-[var(--text-primary)] break-words">{todo.text}</p>
        <button
          onClick={handleDelete}
          aria-label="Supprimer la tâche"
          className={`shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--surface-hover)] ${
            confirming ? 'text-red-500 opacity-100' : 'text-[var(--text-faint)] hover:text-red-500'
          }`}
        >
          <Trash2 size={13} />
        </button>
      </div>
      {todo.dueDate && (
        <span
          className={`inline-flex items-center gap-1 self-start text-[10px] px-1.5 py-0.5 rounded-full ${
            overdue ? 'text-red-500 bg-red-500/10' : 'text-[var(--text-muted)]'
          }`}
          style={overdue ? undefined : { backgroundColor: 'var(--surface-bg)' }}
        >
          <CalendarDays size={10} />
          {dueDateFormatter.format(parseDateKey(todo.dueDate))}
        </span>
      )}
      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onMove(-1)}
          disabled={!canMoveLeft}
          aria-label="Déplacer vers la colonne précédente"
          className="p-1 rounded-md text-[var(--text-faint)] hover:text-[var(--text-primary)] disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onMove(1)}
          disabled={!canMoveRight}
          aria-label="Déplacer vers la colonne suivante"
          className="p-1 rounded-md text-[var(--text-faint)] hover:text-[var(--text-primary)] disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
