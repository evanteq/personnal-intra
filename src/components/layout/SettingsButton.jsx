import { Settings } from 'lucide-react'

export default function SettingsButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ouvrir les paramètres"
      className="flex items-center justify-center w-10 h-10 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
    >
      <Settings size={20} />
    </button>
  )
}
