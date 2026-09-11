import { useEffect, useState } from 'react'
import { Trash2, X } from 'lucide-react'

const EMPTY = { title: '', type: 'event', start: '', end: '', description: '' }

export default function EventModal({ open, event, defaultType, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(EMPTY)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        event
          ? {
              title: event.title,
              type: event.type,
              start: event.start,
              end: event.end || event.start,
              description: event.description || '',
            }
          : { ...EMPTY, type: defaultType || 'event' },
      )
      setConfirmingDelete(false)
    }
  }, [open, event, defaultType])

  if (!open) return null

  function handleSubmit(e) {
    e.preventDefault()
    const title = form.title.trim()
    if (!title || !form.start) return
    onSave({
      title,
      type: form.type,
      start: form.start,
      end: form.end || form.start,
      description: form.description.trim(),
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

  const isOther = form.type === 'other'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'var(--scrim)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl glass p-6 shadow-[var(--shadow-lg)]"
        style={{ backgroundColor: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {event ? 'Modifier' : isOther ? 'Ajouter (congé / autre)' : 'Ajouter un événement'}
          </h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: 'event' }))}
              className="flex-1 rounded-lg border px-3 py-2 text-sm transition-colors"
              style={{
                borderColor: !isOther ? 'var(--accent)' : 'var(--surface-border)',
                backgroundColor: !isOther ? 'var(--accent-soft)' : 'var(--surface-bg)',
                color: !isOther ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              Événement
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: 'other' }))}
              className="flex-1 rounded-lg border px-3 py-2 text-sm transition-colors"
              style={{
                borderColor: isOther ? 'var(--other-color)' : 'var(--surface-border)',
                backgroundColor: isOther ? 'var(--other-soft)' : 'var(--surface-bg)',
                color: isOther ? 'var(--other-color)' : 'var(--text-secondary)',
              }}
            >
              Congé / autre
            </button>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Titre</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={isOther ? 'Congés, RTT…' : "Nom de l'événement"}
              className="w-full rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Date début</label>
              <input
                type="date"
                required
                value={form.start}
                onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                className="w-full rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Date fin (optionnel)</label>
              <input
                type="date"
                value={form.end}
                onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
                className="w-full rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Détails…"
              rows={3}
              className="w-full resize-none rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] thin-scroll"
            />
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            {event ? (
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
                {event ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
