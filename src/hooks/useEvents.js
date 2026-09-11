import { useLocalStorage } from './useLocalStorage'
import { uid } from '../utils/id'

export function useEvents() {
  const [events, setEvents] = useLocalStorage('intra:events', [])

  function addEvent(values) {
    setEvents((prev) => [
      ...prev,
      { id: uid(), type: 'event', description: '', time: '', recur: null, createdAt: Date.now(), ...values },
    ])
  }

  function updateEvent(id, patch) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function deleteEvent(id) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return { events, addEvent, updateEvent, deleteEvent }
}
