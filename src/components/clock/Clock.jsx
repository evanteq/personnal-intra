import { useEffect, useState } from 'react'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-baseline gap-3">
      <span className="text-3xl md:text-4xl font-semibold tracking-tight tabular-nums text-[var(--text-primary)]">
        {formatTime(now)}
      </span>
      <span className="hidden sm:inline text-sm text-[var(--text-secondary)]">
        {capitalize(dateFormatter.format(now))}
      </span>
    </div>
  )
}
