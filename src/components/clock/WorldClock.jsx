import { useEffect, useState } from 'react'
import { Globe2 } from 'lucide-react'

const ZONES = [
  { label: 'Shanghai', timeZone: 'Asia/Shanghai' },
  { label: 'Los Angeles', timeZone: 'America/Los_Angeles' },
]

export default function WorldClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center divide-x divide-[var(--surface-border)]">
      {ZONES.map((zone) => (
        <div key={zone.timeZone} className="flex items-center gap-2 px-4 first:pl-0 last:pr-0">
          <Globe2 size={15} className="text-[var(--accent)] shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-[var(--text-muted)]">{zone.label}</span>
            <span className="text-sm font-medium tabular-nums text-[var(--text-primary)]">
              {now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: zone.timeZone,
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
