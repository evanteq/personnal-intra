import { useEffect, useState } from 'react'

function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <span className="text-3xl md:text-4xl font-semibold tracking-tight tabular-nums text-[var(--text-primary)]">
      {formatTime(now)}
    </span>
  )
}
