import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

/**
 * Like useLocalStorage, but on mount it adds any entries from `defaultList`
 * that aren't already present (matched by `matchKey`) to the stored list,
 * without touching or removing anything already there. Lets code-side
 * defaults grow over time without wiping a browser's existing copy.
 */
export function useMergedList(key, defaultList, matchKey) {
  const [list, setList] = useLocalStorage(key, defaultList)

  useEffect(() => {
    setList((prev) => {
      const existing = new Set(prev.map((item) => item[matchKey]))
      const missing = defaultList.filter((item) => !existing.has(item[matchKey]))
      if (missing.length === 0) return prev
      return [...prev, ...missing].sort((a, b) => String(a[matchKey]).localeCompare(String(b[matchKey])))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [list, setList]
}
