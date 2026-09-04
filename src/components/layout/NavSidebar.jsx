import { Kanban, LayoutDashboard, Link2, NotebookPen } from 'lucide-react'

const PAGES = [
  { key: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
  { key: 'shortcuts', label: 'Raccourcis', icon: Link2 },
  { key: 'notes', label: 'Notes', icon: NotebookPen },
  { key: 'todo', label: 'To-Do', icon: Kanban },
]

export default function NavSidebar({ page, onNavigate }) {
  return (
    <nav className="flex md:flex-col gap-1 glass glass-shadow rounded-2xl p-2 md:p-3 animate-fade-in">
      {PAGES.map(({ key, label, icon: Icon }) => {
        const active = page === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onNavigate(key)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors flex-1 md:flex-none ${
              active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
            style={active ? { backgroundColor: 'var(--accent-soft)' } : undefined}
          >
            <Icon size={18} className="shrink-0" style={active ? { color: 'var(--accent)' } : undefined} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
