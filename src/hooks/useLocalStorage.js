import { useEffect, useState } from 'react'

/**
 * Persists a piece of state to localStorage under `key`.
 * Reads synchronously on mount, writes on every change.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) return JSON.parse(raw)
    } catch {
      // corrupted value, fall back to default
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or unavailable — ignore, data stays in memory for this session
    }
  }, [key, value])

  return [value, setValue]
}
