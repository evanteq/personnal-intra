import { useState } from 'react'
import { Link2, SearchX } from 'lucide-react'
import ShortcutCard from './ShortcutCard'

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--text-faint)]">
      <Icon size={32} />
      <p className="text-sm">{message}</p>
    </div>
  )
}

export default function ShortcutGrid({ links, onEdit, onDelete, onReorder, highlightId, filtered }) {
  const [dragId, setDragId] = useState(null)
  const [overId, setOverId] = useState(null)

  function handleDrop(targetId) {
    if (dragId && dragId !== targetId) {
      onReorder(dragId, targetId)
    }
    setDragId(null)
    setOverId(null)
  }

  if (links.length === 0) {
    return filtered ? (
      <EmptyState icon={SearchX} message="Aucun raccourci ne correspond à cette recherche." />
    ) : (
      <EmptyState icon={Link2} message="Aucun raccourci dans cette catégorie. Utilisez le bouton “Ajouter un lien”." />
    )
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
            isHighlighted={highlightId === link.id}
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
      </div>
    </div>
  )
}
