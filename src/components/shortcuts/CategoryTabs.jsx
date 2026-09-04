import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'

export default function CategoryTabs({ categories, activeId, onSelect, onAddCategory, onRenameCategory, onDeleteCategory }) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState('')
  const [addingNew, setAddingNew] = useState(false)
  const [newDraft, setNewDraft] = useState('')

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

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[var(--surface-border)]">
      {categories.map((cat) => {
        const isActive = cat.id === activeId
        const isEditing = editingId === cat.id
        return (
          <div
            key={cat.id}
            className={`group flex items-center gap-1.5 px-3 py-2.5 -mb-px text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-[var(--accent)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isEditing ? (
              <>
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
              </>
            ) : (
              <>
                <button onClick={() => onSelect(cat.id)}>{cat.name}</button>
                <span className="hidden group-hover:flex items-center gap-1 ml-1">
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
              </>
            )}
          </div>
        )
      })}

      {addingNew ? (
        <div className="flex items-center gap-1.5 px-3 py-2.5 -mb-px text-sm border-b-2 border-transparent">
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
          className="flex items-center gap-1 px-3 py-2.5 -mb-px text-sm border-b-2 border-transparent text-[var(--text-faint)] hover:text-[var(--text-primary)]"
        >
          <Plus size={14} />
          Catégorie
        </button>
      )}
    </div>
  )
}
