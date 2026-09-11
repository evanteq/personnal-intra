import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { DEFAULT_SCHOOL_WEEKS } from '../../data/schoolWeeks'
import { DEFAULT_PUBLIC_HOLIDAYS } from '../../data/publicHolidays'
import { parseDateKey } from '../../utils/date'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

export default function CalendarDataSection() {
  const [schoolWeeks, setSchoolWeeks] = useLocalStorage('intra:schoolWeeks', DEFAULT_SCHOOL_WEEKS)
  const [holidays, setHolidays] = useLocalStorage('intra:publicHolidays', DEFAULT_PUBLIC_HOLIDAYS)
  const [weekStart, setWeekStart] = useState('')
  const [weekEnd, setWeekEnd] = useState('')
  const [holidayDate, setHolidayDate] = useState('')
  const [holidayLabel, setHolidayLabel] = useState('')

  function addWeek() {
    if (!weekStart) return
    const end = weekEnd || weekStart
    setSchoolWeeks((prev) => [...prev, { start: weekStart, end }].sort((a, b) => a.start.localeCompare(b.start)))
    setWeekStart('')
    setWeekEnd('')
  }

  function removeWeek(start) {
    setSchoolWeeks((prev) => prev.filter((w) => w.start !== start))
  }

  function addHoliday() {
    const label = holidayLabel.trim()
    if (!holidayDate || !label) return
    setHolidays((prev) => [...prev, { date: holidayDate, label }].sort((a, b) => a.date.localeCompare(b.date)))
    setHolidayDate('')
    setHolidayLabel('')
  }

  function removeHoliday(date) {
    setHolidays((prev) => prev.filter((h) => h.date !== date))
  }

  const sortedWeeks = [...schoolWeeks].sort((a, b) => a.start.localeCompare(b.start))
  const sortedHolidays = [...holidays].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <section className="flex flex-col gap-4 mt-8 pt-6 border-t border-[var(--surface-border)]">
      <h3 className="text-sm font-medium text-[var(--text-secondary)]">Calendrier</h3>

      <div>
        <p className="text-xs text-[var(--text-muted)] mb-2">Semaines école</p>
        <ul className="flex flex-col gap-1 max-h-32 overflow-y-auto thin-scroll mb-2">
          {sortedWeeks.map((w) => (
            <li
              key={w.start}
              className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)] rounded-lg px-2 py-1.5"
              style={{ backgroundColor: 'var(--surface-bg)' }}
            >
              <span>
                {dateFormatter.format(parseDateKey(w.start))} – {dateFormatter.format(parseDateKey(w.end))}
              </span>
              <button
                type="button"
                onClick={() => removeWeek(w.start)}
                aria-label="Supprimer cette semaine"
                className="shrink-0 text-[var(--text-faint)] hover:text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </li>
          ))}
          {sortedWeeks.length === 0 && <p className="text-xs text-[var(--text-faint)] text-center py-2">Aucune</p>}
        </ul>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="flex-1 min-w-0 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
          <input
            type="date"
            value={weekEnd}
            onChange={(e) => setWeekEnd(e.target.value)}
            className="flex-1 min-w-0 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={addWeek}
            aria-label="Ajouter cette semaine"
            className="shrink-0 p-1.5 rounded-lg text-[var(--accent)] hover:bg-[var(--surface-hover)]"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs text-[var(--text-muted)] mb-2">Jours fériés</p>
        <ul className="flex flex-col gap-1 max-h-32 overflow-y-auto thin-scroll mb-2">
          {sortedHolidays.map((h) => (
            <li
              key={h.date}
              className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)] rounded-lg px-2 py-1.5"
              style={{ backgroundColor: 'var(--surface-bg)' }}
            >
              <span className="truncate">
                {dateFormatter.format(parseDateKey(h.date))} — {h.label}
              </span>
              <button
                type="button"
                onClick={() => removeHoliday(h.date)}
                aria-label="Supprimer ce jour férié"
                className="shrink-0 text-[var(--text-faint)] hover:text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </li>
          ))}
          {sortedHolidays.length === 0 && <p className="text-xs text-[var(--text-faint)] text-center py-2">Aucun</p>}
        </ul>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
            className="shrink-0 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
          <input
            value={holidayLabel}
            onChange={(e) => setHolidayLabel(e.target.value)}
            placeholder="Nom"
            className="flex-1 min-w-0 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-faint)]"
          />
          <button
            type="button"
            onClick={addHoliday}
            aria-label="Ajouter ce jour férié"
            className="shrink-0 p-1.5 rounded-lg text-[var(--accent)] hover:bg-[var(--surface-hover)]"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
