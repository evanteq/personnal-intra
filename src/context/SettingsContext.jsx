import { createContext, useContext, useEffect, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { rotateHue } from '../utils/color'

function getDefaultTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

const DEFAULT_SETTINGS = () => ({
  accentColor: '#6366f1',
  background: { type: 'default', value: '' },
  weatherLocation: null, // { label, latitude, longitude } — null means "auto-detect"
  theme: getDefaultTheme(),
})

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [storedSettings, setSettings] = useLocalStorage('intra:settings', DEFAULT_SETTINGS)
  // Merge in case settings were saved before a new field (e.g. theme) existed.
  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS(), ...storedSettings }), [storedSettings])

  useEffect(() => {
    const root = document.documentElement.style
    root.setProperty('--accent', settings.accentColor)
    root.setProperty('--accent-soft', `${settings.accentColor}33`)
    // Triadic harmony (+/-120deg) so the school-week and leave/other calendar
    // tints always look intentional next to whatever accent color is chosen.
    const school = rotateHue(settings.accentColor, 120)
    const other = rotateHue(settings.accentColor, -120)
    root.setProperty('--school-color', school)
    root.setProperty('--school-soft', `${school}38`)
    root.setProperty('--other-color', other)
    root.setProperty('--other-soft', `${other}38`)
  }, [settings.accentColor])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  const value = useMemo(
    () => ({
      settings,
      setAccentColor: (accentColor) => setSettings((s) => ({ ...s, accentColor })),
      setBackground: (background) => setSettings((s) => ({ ...s, background })),
      setWeatherLocation: (weatherLocation) => setSettings((s) => ({ ...s, weatherLocation })),
      setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
      toggleTheme: () => setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    [settings, setSettings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider')
  return ctx
}
