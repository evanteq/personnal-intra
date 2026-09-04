import { useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_CATEGORIES, DEFAULT_LINKS } from '../data/defaultData'
import { uid } from '../utils/id'

import CategoryTabs from '../components/shortcuts/CategoryTabs'
import ShortcutGrid from '../components/shortcuts/ShortcutGrid'
import LinkFormModal from '../components/shortcuts/LinkFormModal'

export default function ShortcutsPage() {
  const [categories, setCategories] = useLocalStorage('intra:categories', DEFAULT_CATEGORIES)
  const [links, setLinks] = useLocalStorage('intra:links', DEFAULT_LINKS)
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState(null)

  const currentCategoryId = categories.some((c) => c.id === activeCategory) ? activeCategory : categories[0]?.id

  const visibleLinks = useMemo(
    () => links.filter((l) => l.categoryId === currentCategoryId).sort((a, b) => a.order - b.order),
    [links, currentCategoryId],
  )

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

  return (
    <div className="flex flex-col gap-4 min-h-0 h-full">
      <CategoryTabs
        categories={categories}
        activeId={currentCategoryId}
        onSelect={setActiveCategory}
        onAddCategory={addCategory}
        onRenameCategory={renameCategory}
        onDeleteCategory={deleteCategory}
      />
      <ShortcutGrid
        links={visibleLinks}
        onEdit={openEditModal}
        onDelete={deleteLink}
        onReorder={reorderLinks}
        onAddClick={openCreateModal}
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
