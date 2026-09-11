export default function PageHeader({ title, count, action }) {
  return (
    <div className="flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
        {typeof count === 'number' && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full text-[var(--text-muted)]"
            style={{ backgroundColor: 'var(--surface-bg)' }}
          >
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  )
}
