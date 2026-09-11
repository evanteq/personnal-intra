import { useEffect, useMemo, useState } from 'react'
import { Link2, Plus, Search, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_CATEGORIES, DEFAULT_LINKS } from '../data/defaultData'
import { uid } from '../utils/id'

import PageHeader from '../components/layout/PageHeader'
import CategoryTabs from '../components/shortcuts/CategoryTabs'
import ShortcutGrid from '../components/shortcuts/ShortcutGrid'
import LinkFormModal from '../components/shortcuts/LinkFormModal'

export default function ShortcutsPage({ openTarget, onOpenTargetHandled }) {
  const [categories, setCategories] = useLocalStorage('intra:categories', DEFAULT_CATEGORIES)
  const [links, setLinks] = useLocalStorage('intra:links', DEFAULT_LINKS)
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState(null)
  const [highlightId, setHighlightId] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (openTarget?.type !== 'shortcut') return
    const link = links.find((l) => l.id === openTarget.id)
    if (!link) return
    setActiveCategory(link.categoryId)
    setQuery('')
    setHighlightId(link.id)
    onOpenTargetHandled?.()
    const timer = setTimeout(() => setHighlightId(null), 2000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTarget])

  useEffect(() => {
    setQuery('')
  }, [activeCategory])

  const currentCategoryId = categories.some((c) => c.id === activeCategory) ? activeCategory : categories[0]?.id

  const linkCounts = useMemo(() => {
    const counts = {}
    links.forEach((l) => {
      counts[l.categoryId] = (counts[l.categoryId] ?? 0) + 1
    })
    return counts
  }, [links])

  const q = query.trim().toLowerCase()

  const visibleLinks = useMemo(() => {
    const inCategory = links.filter((l) => l.categoryId === currentCategoryId).sort((a, b) => a.order - b.order)
    if (!q) return inCategory
    return inCategory.filter((l) => l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q))
  }, [links, currentCategoryId, q])

  function openCreateModal() {
    setEditingLink(null)
    setModalOpen(true)
  }

  function openEditModal(link) {
    setEditingLink(link)
    setModalOpen(true)
  }

  function saveLink(formData) {
    if (editingLink) {
      setLinks((prev) => prev.map((l) => (l.id === editingLink.id ? { ...l, ...formData } : l)))
    } else {
      const order = links.filter((l) => l.categoryId === formData.categoryId).length
      setLinks((prev) => [...prev, { id: uid(), order, ...formData }])
    }
    setModalOpen(false)
  }

  function deleteLink(id) {
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  function reorderLinks(dragId, targetId) {
    setLinks((prev) => {
      const inCategory = prev.filter((l) => l.categoryId === currentCategoryId).sort((a, b) => a.order - b.order)
      const others = prev.filter((l) => l.categoryId !== currentCategoryId)
      const fromIndex = inCategory.findIndex((l) => l.id === dragId)
      const toIndex = inCategory.findIndex((l) => l.id === targetId)
      if (fromIndex === -1 || toIndex === -1) return prev
      const reordered = [...inCategory]
      const [moved] = reordered.splice(fromIndex, 1)
      reordered.splice(toIndex, 0, moved)
      return [...others, ...reordered.map((l, i) => ({ ...l, order: i }))]
    })
  }

  function addCategory(name) {
    const id = uid()
    setCategories((prev) => [...prev, { id, name }])
    setActiveCategory(id)
  }

  function renameCategory(id, name) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
  }

  function deleteCategory(id) {
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id)
      if (activeCategory === id) setActiveCategory(next[0]?.id ?? '')
      return next
    })
    setLinks((prev) => prev.filter((l) => l.categoryId !== id))
  }

  function reorderCategories(dragId, targetId) {
    setCategories((prev) => {
      const fromIndex = prev.findIndex((c) => c.id === dragId)
      const toIndex = prev.findIndex((c) => c.id === targetId)
      if (fromIndex === -1 || toIndex === -1) return prev
      const reordered = [...prev]
      const [moved] = reordered.splice(fromIndex, 1)
      reordered.splice(toIndex, 0, moved)
      return reordered
    })
  }

  return (
    <div className="relative flex flex-col gap-4 min-h-0 h-full">
      <div
        className="pointer-events-none absolute -top-16 left-8 w-72 h-72 rounded-full blur-3xl opacity-20 -z-10"
        style={{ backgroundColor: 'var(--accent)' }}
      />

      <PageHeader
        title="Raccourcis"
        icon={Link2}
        count={links.length}
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="btn-accent flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
          >
            <Plus size={16} />
            Ajouter un lien
          </button>
        }
      />

      <CategoryTabs
        categories={categories}
        activeId={currentCategoryId}
        onSelect={setActiveCategory}
        onAddCategory={addCategory}
        onRenameCategory={renameCategory}
        onDeleteCategory={deleteCategory}
        onReorderCategories={reorderCategories}
        linkCounts={linkCounts}
      />

      {(linkCounts[currentCategoryId] ?? 0) > 5 && (
        <div className="flex items-center gap-2 -mt-2 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2">
          <Search size={14} className="text-[var(--text-muted)] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrer les raccourcis de cette catégorie…"
            className="w-full bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[var(--text-faint)] hover:text-[var(--text-primary)] shrink-0">
              <X size={14} />
            </button>
          )}
        </div>
      )}

      <ShortcutGrid
        links={visibleLinks}
        onEdit={openEditModal}
        onDelete={deleteLink}
        onReorder={reorderLinks}
        highlightId={highlightId}
        filtered={!!q}
      />

      <LinkFormModal
        open={modalOpen}
        initial={editingLink}
        categories={categories}
        defaultCategoryId={currentCategoryId}
        onClose={() => setModalOpen(false)}
        onSave={saveLink}
      />
    </div>
  )
}
