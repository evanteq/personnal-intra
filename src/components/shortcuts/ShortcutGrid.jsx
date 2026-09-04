import { useState } from 'react'
import { Plus } from 'lucide-react'
import ShortcutCard from './ShortcutCard'

export default function ShortcutGrid({ links, onEdit, onDelete, onReorder, onAddClick }) {
  const [dragId, setDragId] = useState(null)
  const [overId, setOverId] = useState(null)

  function handleDrop(targetId) {
    if (dragId && dragId !== targetId) {
      onReorder(dragId, targetId)
    }
    setDragId(null)
    setOverId(null)
  }

  return (
    <div className="flex-1 overflow-y-auto thin-scroll -mx-1 px-1">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-2">
        {links.map((link) => (
          <ShortcutCard
            key={link.id}
            link={link}
            onEdit={onEdit}
            onDelete={onDelete}
            isDragOver={overId === link.id && dragId !== link.id}
            dragHandlers={{
              onDragStart: () => setDragId(link.id),
              onDragEnter: (e) => {
                e.preventDefault()
                setOverId(link.id)
              },
              onDragOver: (e) => e.preventDefault(),
              onDrop: (e) => {
                e.preventDefault()
                handleDrop(link.id)
              },
              onDragEnd: () => {
                setDragId(null)
                setOverId(null)
              },
            }}
          />
        ))}

        <button
          onClick={onAddClick}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl p-4 min-h-[104px] border border-dashed border-[var(--surface-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/60 transition-colors"
        >
          <Plus size={20} />
          <span className="text-sm">Ajouter un lien</span>
        </button>
      </div>
    </div>
  )
}
