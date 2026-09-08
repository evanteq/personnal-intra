import KanbanCard from './KanbanCard'

export default function KanbanColumn({
  label,
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
