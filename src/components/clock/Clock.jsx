import { useEffect, useState } from 'react'

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const seconds = now.getSeconds()

  return (
    <div className="flex items-baseline gap-2">
      <span
        className="w-2 h-2 rounded-full shrink-0 self-center transition-opacity duration-300"
        style={{ backgroundColor: 'var(--accent)', opacity: seconds % 2 === 0 ? 1 : 0.3 }}
      />
      <span className="flex items-baseline font-bold tracking-tight tabular-nums">
        <span className="text-3xl md:text-4xl bg-gradient-to-br from-[var(--text-primary)] to-[var(--accent)] bg-clip-text text-transparent">
          {pad(now.getHours())}:{pad(now.getMinutes())}
        </span>
        <span className="text-base md:text-lg text-[var(--text-faint)] ml-1">:{pad(seconds)}</span>
      </span>
    </div>
  )
}
