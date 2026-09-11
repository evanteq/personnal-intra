import { useEffect, useState } from 'react'

function pad(n) {
  return String(n).padStart(2, '0')
}

function AnalogFace({ now }) {
  const seconds = now.getSeconds()
  const minutes = now.getMinutes()
  const hours = now.getHours()
  const secondAngle = seconds * 6
  const minuteAngle = minutes * 6 + seconds * 0.1
  const hourAngle = (hours % 12) * 30 + minutes * 0.5

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 opacity-[0.14] pointer-events-none"
      style={{ color: 'var(--text-primary)' }}
    >
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="6"
          x2="50"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="26"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        transform={`rotate(${hourAngle} 50 50)`}
      />
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        transform={`rotate(${minuteAngle} 50 50)`}
      />
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="10"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        transform={`rotate(${secondAngle} 50 50)`}
      />
      <circle cx="50" cy="50" r="2" fill="currentColor" />
    </svg>
  )
}

export default function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const seconds = now.getSeconds()

  return (
    <div className="relative flex items-center justify-center px-6 py-1">
      <AnalogFace now={now} />
      <span className="relative flex items-baseline font-bold tracking-tight tabular-nums">
        <span className="text-3xl md:text-4xl bg-gradient-to-br from-[var(--text-primary)] to-[var(--accent)] bg-clip-text text-transparent">
          {pad(now.getHours())}:{pad(now.getMinutes())}
        </span>
        <span className="text-base md:text-lg text-[var(--text-faint)] ml-1">:{pad(seconds)}</span>
      </span>
    </div>
  )
}
