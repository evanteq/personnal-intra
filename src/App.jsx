import { useState } from 'react'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { useLocalStorage } from './hooks/useLocalStorage'

import HeaderBar from './components/layout/HeaderBar'
import NavSidebar from './components/layout/NavSidebar'
import SettingsPanel from './components/settings/SettingsPanel'

import Dashboard from './pages/Dashboard'
import ShortcutsPage from './pages/ShortcutsPage'
import NotesPage from './pages/NotesPage'
import TodoPage from './pages/TodoPage'

const PAGES = {
  dashboard: Dashboard,
  shortcuts: ShortcutsPage,
  notes: NotesPage,
  todo: TodoPage,
}

function AppShell() {
  const { settings } = useSettings()
  const [page, setPage] = useLocalStorage('intra:page', 'dashboard')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const backgroundStyle =
    settings.background.type === 'default'
      ? { backgroundImage: 'radial-gradient(circle at 20% 20%, var(--bg-from) 0%, var(--bg-via) 55%, var(--bg-to) 100%)' }
      : { backgroundImage: `url(${settings.background.value})` }

  const ActivePage = PAGES[page] ?? Dashboard

  return (
    <div className="min-h-screen w-full relative text-[var(--text-primary)]">
      <div className="fixed inset-0 -z-20 bg-cover bg-center transition-[background-image] duration-500" style={backgroundStyle} />
      <div className="fixed inset-0 -z-10 transition-colors duration-300" style={{ backgroundColor: 'var(--overlay)' }} />

      <div className="relative z-10 min-h-screen flex flex-col gap-4 p-4 md:p-6 max-w-[1600px] mx-auto">
        <HeaderBar onOpenSettings={() => setSettingsOpen(true)} />

        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
          <NavSidebar page={page} onNavigate={setPage} />
          <main className="flex-1 min-h-0">
            <ActivePage onNavigate={setPage} />
          </main>
        </div>
      </div>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <AppShell />
    </SettingsProvider>
  )
}
