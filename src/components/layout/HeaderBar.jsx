import Clock from '../clock/Clock'
import SettingsButton from './SettingsButton'
import ThemeToggle from './ThemeToggle'

export default function HeaderBar({ onOpenSettings }) {
  return (
    <header className="glass glass-shadow rounded-2xl px-6 py-4 flex items-center justify-between animate-fade-in">
      <Clock />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <SettingsButton onClick={onOpenSettings} />
      </div>
    </header>
  )
}
