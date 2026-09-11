export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function advanceDateKey(key, recur) {
  const d = parseDateKey(key)
  if (recur === 'daily') return toDateKey(addDays(d, 1))
  if (recur === 'weekly') return toDateKey(addDays(d, 7))
  if (recur === 'monthly') return toDateKey(new Date(d.getFullYear(), d.getMonth() + 1, d.getDate()))
  return key
}
