import { useEffect, useState } from 'react'
import { Monitor } from 'lucide-react'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { useLocalStorage } from './hooks/useLocalStorage'

import HeaderBar from './components/layout/HeaderBar'
import NavSidebar from './components/layout/NavSidebar'
import SettingsPanel from './components/settings/SettingsPanel'
import GlobalSearch from './components/search/GlobalSearch'

import Dashboard from './pages/Dashboard'
import ShortcutsPage from './pages/ShortcutsPage'
import NotesPage from './pages/NotesPage'
import PlanningPage from './pages/PlanningPage'
import TodoPage from './pages/TodoPage'

const PAGES = {
  dashboard: Dashboard,
  shortcuts: ShortcutsPage,
  notes: NotesPage,
  planning: PlanningPage,
  todo: TodoPage,
}

function AppShell() {
  const { settings } = useSettings()
  const [page, setPage] = useLocalStorage('intra:page', 'dashboard')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openTarget, setOpenTarget] = useState(null)

  function handleOpenResult({ page: targetPage, type, id }) {
    setPage(targetPage)
    setOpenTarget({ type, id })
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const isDark = settings.theme !== 'light'
  const orbBlend = isDark ? 'black' : 'white'
  const arcBlend = isDark ? 'white' : 'black'
  const arcColor = `color-mix(in srgb, color-mix(in srgb, var(--accent) 22%, ${arcBlend}) 23%, transparent)`
  const orbColor = `color-mix(in srgb, color-mix(in srgb, var(--accent) 35%, ${orbBlend}) 27%, transparent)`

  const backgroundStyle =
    settings.background.type === 'default'
      ? {
          backgroundImage: [
            `radial-gradient(85vmax circle at 22% 130%, transparent 52%, ${arcColor} 55.5%, transparent 60%)`,
            `radial-gradient(ellipse 55% 45% at 74% 20%, ${orbColor} 0%, transparent 65%)`,
            'radial-gradient(circle at 20% 20%, var(--bg-from) 0%, var(--bg-via) 55%, var(--bg-to) 100%)',
          ].join(', '),
        }
      : { backgroundImage: `url(${settings.background.value})` }

  const ActivePage = PAGES[page] ?? Dashboard

  return (
    <div className="h-screen w-full relative text-[var(--text-primary)] overflow-hidden">
      <div className="fixed inset-0 -z-20 bg-cover bg-center transition-[background-image] duration-500" style={backgroundStyle} />
      <div className="fixed inset-0 -z-10 transition-colors duration-300" style={{ backgroundColor: 'var(--overlay)' }} />

      <div className="lg:hidden relative z-10 h-full flex flex-col items-center justify-center text-center gap-3 p-6">
        <Monitor size={40} className="text-[var(--text-faint)]" />
        <p className="text-base font-semibold text-[var(--text-primary)]">Accueil Evan est disponible sur ordinateur</p>
        <p className="text-sm text-[var(--text-muted)] max-w-xs">
          Cette application est optimisée pour un écran d&rsquo;ordinateur (desktop ou laptop). Merci d&rsquo;utiliser un
          écran plus large.
        </p>
      </div>

      <div className="hidden lg:flex relative z-10 h-full flex-col gap-4 p-4 md:p-6">
        <HeaderBar onOpenSettings={() => setSettingsOpen(true)} onOpenSearch={() => setSearchOpen(true)} />

        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
          <NavSidebar page={page} onNavigate={setPage} />
          <main className="flex-1 min-h-0 min-w-0">
            <ActivePage onNavigate={setPage} openTarget={openTarget} onOpenTargetHandled={() => setOpenTarget(null)} />
          </main>
        </div>
      </div>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} onSelect={handleOpenResult} />
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
