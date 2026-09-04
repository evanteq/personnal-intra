import Clock from '../clock/Clock'
import GreetingDate from './GreetingDate'
import SettingsButton from './SettingsButton'
import ThemeToggle from './ThemeToggle'
import WeatherInline from './WeatherInline'

export default function HeaderBar({ onOpenSettings }) {
  return (
    <header className="glass glass-shadow rounded-2xl px-6 py-3 grid grid-cols-1 md:grid-cols-3 items-center gap-3 animate-fade-in">
      <div className="order-2 md:order-1 flex justify-center md:justify-start">
        <GreetingDate />
      </div>

      <div className="order-1 md:order-2 flex justify-center">
        <Clock />
      </div>

      <div className="order-3 flex items-center justify-center md:justify-end gap-4">
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
