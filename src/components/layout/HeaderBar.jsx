import Clock from '../clock/Clock'
import SettingsButton from './SettingsButton'
import ThemeToggle from './ThemeToggle'
import WeatherInline from './WeatherInline'

export default function HeaderBar({ onOpenSettings }) {
  return (
    <header className="glass glass-shadow rounded-2xl px-6 py-3 flex items-center justify-between gap-4 animate-fade-in">
      <Clock />
      <div className="flex items-center gap-4">
        <WeatherInline />
        <div className="w-px h-6 bg-[var(--surface-border)]" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <SettingsButton onClick={onOpenSettings} />
        </div>
      </div>
    </header>
  )
}
