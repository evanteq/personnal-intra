import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'

export default function CategoryTabs({
  categories,
  activeId,
  onSelect,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onReorderCategories,
  linkCounts,
}) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState('')
  const [addingNew, setAddingNew] = useState(false)
  const [newDraft, setNewDraft] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [overId, setOverId] = useState(null)

  function startEdit(cat) {
    setEditingId(cat.id)
    setDraft(cat.name)
  }

  function commitEdit() {
    const name = draft.trim()
    if (name) onRenameCategory(editingId, name)
    setEditingId(null)
    setDraft('')
  }

  function commitNew() {
    const name = newDraft.trim()
    if (name) onAddCategory(name)
    setNewDraft('')
    setAddingNew(false)
  }

  function handleDrop(targetId) {
    if (dragId && dragId !== targetId) {
      onReorderCategories?.(dragId, targetId)
    }
    setDragId(null)
    setOverId(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-[var(--surface-border)]">
      {categories.map((cat) => {
        const isActive = cat.id === activeId
        const isEditing = editingId === cat.id
        const count = linkCounts?.[cat.id] ?? 0
        return (
          <div
            key={cat.id}
            draggable={editMode && !isEditing}
            onDragStart={() => setDragId(cat.id)}
            onDragEnter={(e) => {
              if (!editMode) return
              e.preventDefault()
              setOverId(cat.id)
            }}
            onDragOver={(e) => editMode && e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(cat.id)
            }}
            onDragEnd={() => {
              setDragId(null)
              setOverId(null)
            }}
            className={`flex items-center gap-1 rounded-xl transition-colors ${editMode ? 'cursor-grab active:cursor-grabbing' : ''} ${
              overId === cat.id && dragId !== cat.id ? 'ring-2 ring-[var(--accent)]' : ''
            }`}
          >
            {isEditing ? (
              <div className="flex items-center gap-1.5 px-3 py-2">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="bg-transparent outline-none border-b border-[var(--surface-border)] w-28 text-[var(--text-primary)]"
                />
                <button onClick={commitEdit} className="text-emerald-500 hover:text-emerald-400">
                  <Check size={14} />
                </button>
                <button onClick={() => setEditingId(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onSelect(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[var(--accent)] shadow-[var(--shadow-sm)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                  style={isActive ? { backgroundColor: 'var(--accent-soft)' } : undefined}
                >
                  {cat.name}
                  {count > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-normal leading-none"
                      style={{
                        backgroundColor: isActive ? 'var(--accent)' : 'var(--surface-bg)',
                        color: isActive ? '#fff' : 'var(--text-faint)',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
                {editMode && (
                  <span className="flex items-center gap-1 ml-1">
                    <button
                      onClick={() => startEdit(cat)}
                      aria-label={`Renommer ${cat.name}`}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      <Pencil size={12} />
                    </button>
                    {categories.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Supprimer la catégorie "${cat.name}" et ses liens ?`)) {
                            onDeleteCategory(cat.id)
                          }
                        }}
                        aria-label={`Supprimer ${cat.name}`}
                        className="text-[var(--text-muted)] hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </span>
                )}
              </>
            )}
          </div>
        )
      })}

      {addingNew ? (
        <div className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl" style={{ backgroundColor: 'var(--surface-bg)' }}>
          <input
            autoFocus
            placeholder="Nom de la catégorie"
            value={newDraft}
            onChange={(e) => setNewDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitNew()
              if (e.key === 'Escape') setAddingNew(false)
            }}
            className="bg-transparent outline-none w-32 text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
          />
          <button onClick={commitNew} className="text-emerald-500 hover:text-emerald-400">
            <Check size={14} />
          </button>
          <button onClick={() => setAddingNew(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
        >
          <Plus size={14} />
          Catégorie
        </button>
      )}

      <button
        onClick={() => {
          setEditMode((v) => !v)
          setEditingId(null)
        }}
        aria-label={editMode ? 'Terminer la modification des catégories' : 'Modifier les catégories'}
        title={editMode ? 'Terminer' : 'Modifier les catégories'}
        className={`flex items-center gap-1 px-2.5 py-2 rounded-xl ml-auto text-sm transition-colors ${
          editMode ? 'text-[var(--accent)]' : 'text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
        }`}
        style={editMode ? { backgroundColor: 'var(--accent-soft)' } : undefined}
      >
        {editMode ? <Check size={14} /> : <Pencil size={14} />}
      </button>
    </div>
  )
}
