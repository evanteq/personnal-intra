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

  return (
    <span className="flex items-baseline font-semibold tracking-tight tabular-nums text-[var(--text-primary)]">
      <span className="text-3xl md:text-4xl">
        {pad(now.getHours())}:{pad(now.getMinutes())}
      </span>
      <span className="text-lg md:text-xl opacity-40 ml-0.5">:{pad(now.getSeconds())}</span>
    </span>
  )
}
