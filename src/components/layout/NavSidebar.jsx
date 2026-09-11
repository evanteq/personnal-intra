import { useState } from 'react'
import { CalendarDays, Kanban, LayoutDashboard, Link2, NotebookPen } from 'lucide-react'
import ateqLogo from '../../assets/ateq-logo.png'
import { useLocalStorage } from '../../hooks/useLocalStorage'

const PAGE_DEFS = {
  dashboard: { label: 'Accueil', icon: LayoutDashboard },
  shortcuts: { label: 'Raccourcis', icon: Link2 },
  notes: { label: 'Notes', icon: NotebookPen },
  planning: { label: 'Calendrier', icon: CalendarDays },
  todo: { label: 'Tâches', icon: Kanban },
}

const DEFAULT_ORDER = ['dashboard', 'shortcuts', 'notes', 'planning', 'todo']

export default function NavSidebar({ page, onNavigate }) {
  const [order, setOrder] = useLocalStorage('intra:navOrder', DEFAULT_ORDER)
  const [draggedKey, setDraggedKey] = useState(null)
  const [dragOverKey, setDragOverKey] = useState(null)

  const validOrder = order.filter((k) => PAGE_DEFS[k])
  const missing = Object.keys(PAGE_DEFS).filter((k) => !validOrder.includes(k))
  const items = [...validOrder, ...missing]

  function reorder(dragKey, targetKey) {
    if (dragKey === targetKey) return
    const fromIndex = items.indexOf(dragKey)
    const toIndex = items.indexOf(targetKey)
    if (fromIndex === -1 || toIndex === -1) return
    const next = [...items]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setOrder(next)
  }

  return (
    <div className="flex md:flex-col gap-1 glass glass-shadow rounded-2xl p-2 md:p-3 animate-fade-in">
      <div className="hidden md:flex items-center justify-center px-2 pb-3 mb-1 border-b border-[var(--surface-border)]">
        <img src={ateqLogo} alt="ATEQ" className="h-10 w-auto max-w-full rounded-md bg-white px-3 py-2" />
      </div>

      <nav className="flex md:flex-col gap-1 flex-1">
        {items.map((key) => {
          const { label, icon: Icon } = PAGE_DEFS[key]
          const active = page === key
          const isOver = dragOverKey === key && draggedKey !== key

          return (
            <button
              key={key}
              type="button"
              draggable
              onDragStart={() => setDraggedKey(key)}
              onDragEnter={(e) => {
                e.preventDefault()
                setDragOverKey(key)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (draggedKey) reorder(draggedKey, key)
                setDraggedKey(null)
                setDragOverKey(null)
              }}
              onDragEnd={() => {
                setDraggedKey(null)
                setDragOverKey(null)
              }}
              onClick={() => onNavigate(key)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors flex-1 md:flex-none cursor-grab active:cursor-grabbing ${
                active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              } ${isOver ? 'ring-2 ring-[var(--accent)]' : ''}`}
              style={active ? { backgroundColor: 'var(--accent-soft)' } : undefined}
            >
              <Icon size={18} className="shrink-0" style={active ? { color: 'var(--accent)' } : undefined} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
