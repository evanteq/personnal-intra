import { useEffect, useState } from 'react'
import { Trash2, X } from 'lucide-react'

const EMPTY = { text: '', description: '', dueDate: '', dueTime: '', recur: '' }
const RECUR_OPTIONS = [
  { value: '', label: 'Aucune' },
  { value: 'daily', label: 'Chaque jour' },
  { value: 'weekly', label: 'Chaque semaine' },
  { value: 'monthly', label: 'Chaque mois' },
]
const createdAtFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default function TaskModal({ open, todo, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(EMPTY)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        todo
          ? {
              text: todo.text,
              description: todo.description || '',
              dueDate: todo.dueDate || '',
              dueTime: todo.dueTime || '',
              recur: todo.recur || '',
            }
          : EMPTY,
      )
      setConfirmingDelete(false)
    }
  }, [open, todo])

  if (!open) return null

  function handleSubmit(e) {
    e.preventDefault()
    const text = form.text.trim()
    if (!text) return
    onSave({
      text,
      description: form.description.trim(),
      dueDate: form.dueDate || null,
      dueTime: form.dueDate ? form.dueTime || null : null,
      recur: form.recur || null,
    })
  }

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      setTimeout(() => setConfirmingDelete(false), 2500)
      return
    }
    onDelete()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'var(--scrim)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl glass p-6 shadow-[var(--shadow-lg)]"
        style={{ backgroundColor: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{todo ? 'Modifier la tâche' : 'Ajouter une tâche'}</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Titre</label>
            <input
              autoFocus
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              placeholder="Nom de la tâche"
              className="w-full rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Détails de la tâche…"
              rows={9}
              className="w-full resize-y rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] thin-scroll"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Date assignée</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value, dueTime: e.target.value ? f.dueTime : '' }))}
                className="w-full rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Heure</label>
              <input
                type="time"
                value={form.dueTime}
                onChange={(e) => setForm((f) => ({ ...f, dueTime: e.target.value }))}
                disabled={!form.dueDate}
                className="w-full rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Répéter</label>
              <select
                value={form.recur}
                onChange={(e) => setForm((f) => ({ ...f, recur: e.target.value }))}
                disabled={!form.dueDate}
                className="w-full rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] disabled:opacity-50"
              >
                {RECUR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} style={{ backgroundColor: 'var(--modal-bg)', color: 'var(--text-primary)' }}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {todo && (
            <p className="text-[11px] text-[var(--text-faint)]">Créée le {createdAtFormatter.format(todo.createdAt)}</p>
          )}

          <div className="flex items-center justify-between gap-2 mt-2">
            {todo ? (
              <button
                type="button"
                onClick={handleDelete}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  confirmingDelete
                    ? 'text-red-500 bg-red-500/10'
                    : 'text-[var(--text-faint)] hover:text-red-500 hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Trash2 size={14} />
                {confirmingDelete ? 'Confirmer' : 'Supprimer'}
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              >
                Annuler
              </button>
              <button type="submit" className="btn-accent px-4 py-2 rounded-lg text-sm font-medium">
                {todo ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
