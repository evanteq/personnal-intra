import { Search } from 'lucide-react'

export default function SearchButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Rechercher"
      className="flex items-center justify-center w-10 h-10 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
    >
      <Search size={18} />
    </button>
  )
}
