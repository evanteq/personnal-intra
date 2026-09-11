import { useEffect, useState } from 'react'

const SYNC_EVENT = 'intra-local-storage'

/**
 * Persists a piece of state to localStorage under `key`.
 * Reads synchronously on mount, writes on every change, and stays in sync
 * with other components using the same key while both remain mounted
 * (e.g. Settings and Planning, or the always-mounted GlobalSearch/SettingsPanel).
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
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key } }))
  }, [key, value])

  useEffect(() => {
    function handleSync(e) {
      if (e.detail?.key !== key) return
      try {
        const raw = window.localStorage.getItem(key)
        if (raw === null) return
        setValue((prev) => (JSON.stringify(prev) === raw ? prev : JSON.parse(raw)))
      } catch {
        // corrupted value from another instance — keep current state
      }
    }
    window.addEventListener(SYNC_EVENT, handleSync)
    return () => window.removeEventListener(SYNC_EVENT, handleSync)
  }, [key])

  return [value, setValue]
}
