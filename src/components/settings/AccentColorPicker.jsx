import { Check } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'

const PRESETS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#22c55e', '#14b8a6', '#3b82f6']

export default function AccentColorPicker() {
  const { settings, setAccentColor } = useSettings()

  return (
    <div>
      <p className="text-xs text-[var(--text-muted)] mb-2">Couleur d'accent</p>
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((color) => {
          const active = settings.accentColor.toLowerCase() === color.toLowerCase()
          return (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              aria-label={color}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--surface-border)]"
              style={{ backgroundColor: color }}
            >
              {active && <Check size={14} className="text-white drop-shadow" />}
            </button>
          )
        })}
        <label className="w-8 h-8 rounded-full overflow-hidden border border-[var(--surface-border)] cursor-pointer relative">
          <input
            type="color"
            value={settings.accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <div
            className="w-full h-full"
            style={{
              background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
            }}
          />
        </label>
      </div>
    </div>
  )
}
