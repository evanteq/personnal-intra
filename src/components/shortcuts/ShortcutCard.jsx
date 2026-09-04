import { useState } from 'react'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { getIcon } from '../../data/iconOptions'
import { getFaviconUrl } from '../../utils/favicon'

export default function ShortcutCard({ link, onEdit, onDelete, dragHandlers, isDragOver }) {
  const [confirming, setConfirming] = useState(false)
  const [faviconFailed, setFaviconFailed] = useState(false)
  const Icon = getIcon(link.icon)
  const faviconUrl = !link.icon && !faviconFailed ? getFaviconUrl(link.url) : null

  function handleDelete(e) {
    e.preventDefault()
    e.stopPropagation()
    if (confirming) {
      onDelete(link.id)
    } else {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 2500)
    }
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      draggable
      {...dragHandlers}
      className={`group relative flex flex-col gap-3 rounded-2xl p-4 glass glass-hover shadow-[var(--shadow-sm)] animate-fade-in cursor-pointer ${
        isDragOver ? 'ring-2 ring-[var(--accent)]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl overflow-hidden"
          style={{ backgroundColor: 'var(--accent-soft)' }}
        >
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              className="w-6 h-6"
              draggable={false}
              onError={() => setFaviconFailed(true)}
            />
          ) : (
            <Icon size={22} className="text-[var(--accent)]" />
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEdit(link)
            }}
            aria-label="Modifier"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Supprimer"
            className={`p-1.5 rounded-lg hover:bg-[var(--surface-hover)] ${confirming ? 'text-red-500' : 'text-[var(--text-muted)] hover:text-red-500'}`}
            title={confirming ? 'Cliquer à nouveau pour confirmer' : 'Supprimer'}
          >
            <Trash2 size={14} />
          </button>
          <span className="p-1.5 text-[var(--text-faint)] cursor-grab active:cursor-grabbing" title="Glisser pour réordonner">
            <GripVertical size={14} />
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{link.title}</p>
        <p className="text-xs text-[var(--text-muted)] truncate">{formatUrl(link.url)}</p>
      </div>
    </a>
  )
}

function formatUrl(url) {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
