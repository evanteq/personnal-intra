import KanbanCard from './KanbanCard'

const COLUMN_THEMES = {
  slate: { fg: '#94a3b8', bg: 'rgba(148, 163, 184, 0.16)' },
  amber: { fg: '#f59e0b', bg: 'rgba(245, 158, 11, 0.16)' },
  emerald: { fg: '#10b981', bg: 'rgba(16, 185, 129, 0.16)' },
}

export default function KanbanColumn({
  label,
  theme = 'slate',
  todos,
  onMove,
  onDelete,
  onOpenTask,
  isOver,
  columnDragHandlers,
  makeCardDragHandlers,
  dragOverCardId,
  canMoveLeft,
  canMoveRight,
}) {
  const t = COLUMN_THEMES[theme]
  return (
    <div
      {...columnDragHandlers}
      className={`flex flex-col gap-3 rounded-2xl p-4 pt-3.5 glass min-h-0 flex-1 transition-colors ${
        isOver ? 'ring-2 ring-[var(--accent)]' : ''
      }`}
      style={{ borderTopWidth: '3px', borderTopColor: t.fg }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: t.fg }}>
          {label}
        </h3>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: t.bg, color: t.fg }}
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
            onOpen={() => onOpenTask(todo)}
            isDragOver={dragOverCardId === todo.id}
            dragHandlers={makeCardDragHandlers(todo.id)}
          />
        ))}
        {todos.length === 0 && (
          <p className="text-xs text-[var(--text-faint)] text-center py-4">Aucune tâche</p>
        )}
      </div>
    </div>
  )
}
