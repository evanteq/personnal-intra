import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Repeat } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMergedList } from '../hooks/useMergedList'
import EventModal from '../components/calendar/EventModal'
import { DEFAULT_SCHOOL_WEEKS } from '../data/schoolWeeks'
import { DEFAULT_PUBLIC_HOLIDAYS } from '../data/publicHolidays'
import { addDays, parseDateKey, startOfWeek, toDateKey } from '../utils/date'

const LEGEND_ITEMS = [
  { key: 'school', label: 'Semaine école', className: 'day-school' },
  { key: 'holiday', label: 'Jour férié', className: 'day-holiday' },
  { key: 'other', label: 'Congé / autre', className: 'day-other' },
  { key: 'weekend', label: 'Week-end', className: 'day-weekend' },
]

const dayNameFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })
const weekdayNarrowFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'narrow' })
const rangeFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
const monthLongFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long' })

const VIEW_OPTIONS = [
  { key: 'work', label: 'Semaine de travail' },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'year', label: 'Année' },
]

function getMonthGridDays(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)
  const gridStart = startOfWeek(firstOfMonth)
  const gridEndWeekStart = startOfWeek(lastOfMonth)
  const totalDays = Math.round((addDays(gridEndWeekStart, 6) - gridStart) / 86400000) + 1
  return Array.from({ length: totalDays }, (_, i) => addDays(gridStart, i))
}

// Non-recurring entries use their start/end range as-is; recurring ones are
// virtually expanded (no duplicated data) by checking the pattern against `key`.
function eventOccursOn(event, key) {
  if (!event.recur) return key >= event.start && key <= (event.end || event.start)
  if (key < event.start) return false
  const start = parseDateKey(event.start)
  const target = parseDateKey(key)
  const diffDays = Math.round((target - start) / 86400000)
  if (event.recur === 'daily') return diffDays >= 0
  if (event.recur === 'weekly') return diffDays >= 0 && diffDays % 7 === 0
  if (event.recur === 'monthly') return target.getDate() === start.getDate()
  if (event.recur === 'yearly') return target.getDate() === start.getDate() && target.getMonth() === start.getMonth()
  return false
}

function EventChip({ event, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-left glass glass-hover"
      title={event.title}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: event.type === 'other' ? 'var(--other-color)' : 'var(--accent)' }}
      />
      {event.time && <span className="text-[var(--text-faint)] shrink-0">{event.time}</span>}
      <span className="truncate flex-1 text-[var(--text-primary)]">{event.title}</span>
      {event.recur && <Repeat size={10} className="text-[var(--text-faint)] shrink-0" />}
    </button>
  )
}

function MiniMonth({ year, month, events, todayKey, schoolWeeks, holidayKeys, onSelect }) {
  const monthDate = new Date(year, month, 1)
  const gridDays = getMonthGridDays(year, month)

  function eventInfo(key) {
    const matches = events.filter((e) => eventOccursOn(e, key))
    if (matches.length === 0) return null
    return matches.some((e) => e.type === 'other') ? 'var(--other-color)' : 'var(--accent)'
  }

  function isSchoolDay(key) {
    return schoolWeeks.some((w) => key >= w.start && key <= w.end)
  }

  function isOtherDay(key) {
    return events.some((e) => e.type === 'other' && eventOccursOn(e, key))
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(monthDate)}
      className="glass glass-hover rounded-xl p-2.5 flex flex-col justify-center gap-1.5 text-left h-full"
    >
      <p className="text-xs font-semibold text-[var(--text-primary)] capitalize px-0.5">
        {monthLongFormatter.format(monthDate)}
      </p>
      <div className="grid grid-cols-7 gap-y-0.5">
        {gridDays.slice(0, 7).map((d) => (
          <span key={`h-${toDateKey(d)}`} className="text-[9px] text-[var(--text-faint)] text-center">
            {weekdayNarrowFormatter.format(d)}
          </span>
        ))}
        {gridDays.map((d) => {
          const key = toDateKey(d)
          const inMonth = d.getMonth() === month
          const isToday = key === todayKey
          const isWeekend = d.getDay() === 0 || d.getDay() === 6
          const dotColor = eventInfo(key)
          return (
            <span
              key={key}
              className={`relative flex items-center justify-center py-0.5 rounded ${
                isWeekend && inMonth ? 'day-weekend' : ''
              } ${isSchoolDay(key) && inMonth ? 'day-school' : ''} ${holidayKeys.has(key) && inMonth ? 'day-holiday' : ''} ${
                isOtherDay(key) && inMonth ? 'day-other' : ''
              }`}
            >
              <span
                className={`flex items-center justify-center text-[9px] ${
                  isToday
                    ? 'w-3.5 h-3.5 rounded-full font-bold text-white'
                    : inMonth
                      ? 'text-[var(--text-secondary)]'
                      : 'text-[var(--text-faint)] opacity-40'
                }`}
                style={isToday ? { backgroundColor: 'var(--accent)' } : undefined}
              >
                {d.getDate()}
              </span>
              {dotColor && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 h-1 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
              )}
            </span>
          )
        })}
      </div>
    </button>
  )
}

export default function PlanningPage({ openTarget, onOpenTargetHandled }) {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents()
  const [viewMode, setViewMode] = useLocalStorage('intra:planningView', 'week')
  const [anchor, setAnchor] = useState(() => new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [createType, setCreateType] = useState('event')
  const [schoolWeeks] = useMergedList('intra:schoolWeeks', DEFAULT_SCHOOL_WEEKS, 'start')
  const [publicHolidays] = useMergedList('intra:publicHolidays', DEFAULT_PUBLIC_HOLIDAYS, 'date')
  const holidayKeys = useMemo(() => new Set(publicHolidays.map((h) => h.date)), [publicHolidays])

  const todayKey = toDateKey(new Date())

  useEffect(() => {
    if (openTarget?.type !== 'calendarEvent') return
    const event = events.find((e) => e.id === openTarget.id)
    if (!event) return
    setAnchor(parseDateKey(event.start))
    setEditingEvent(event)
    setModalOpen(true)
    onOpenTargetHandled?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTarget])

  function isSchoolDay(key) {
    return schoolWeeks.some((w) => key >= w.start && key <= w.end)
  }

  function holidayLabel(key) {
    return publicHolidays.find((h) => h.date === key)?.label
  }

  function eventsForDay(key) {
    return events.filter((e) => eventOccursOn(e, key))
  }

  function isOtherDay(key) {
    return events.some((e) => e.type === 'other' && eventOccursOn(e, key))
  }

  const days = useMemo(() => {
    if (viewMode === 'year') return []
    if (viewMode === 'month') return getMonthGridDays(anchor.getFullYear(), anchor.getMonth())
    const weekStart = startOfWeek(anchor)
    const count = viewMode === 'work' ? 5 : 7
    return Array.from({ length: count }, (_, i) => addDays(weekStart, i))
  }, [anchor, viewMode])

  function goPrev() {
    setAnchor((d) => {
      if (viewMode === 'year') return new Date(d.getFullYear() - 1, d.getMonth(), 1)
      if (viewMode === 'month') return new Date(d.getFullYear(), d.getMonth() - 1, 1)
      return addDays(d, -7)
    })
  }

  function goNext() {
    setAnchor((d) => {
      if (viewMode === 'year') return new Date(d.getFullYear() + 1, d.getMonth(), 1)
      if (viewMode === 'month') return new Date(d.getFullYear(), d.getMonth() + 1, 1)
      return addDays(d, 7)
    })
  }

  function goToday() {
    setAnchor(new Date())
  }

  function openCreate(type) {
    setEditingEvent(null)
    setCreateType(type)
    setModalOpen(true)
  }

  function openEdit(event) {
    setEditingEvent(event)
    setModalOpen(true)
  }

  function handleSave(values) {
    if (editingEvent) updateEvent(editingEvent.id, values)
    else addEvent(values)
    setModalOpen(false)
  }

  function handleDelete() {
    if (editingEvent) deleteEvent(editingEvent.id)
    setModalOpen(false)
  }

  const headerLabel =
    viewMode === 'year'
      ? String(anchor.getFullYear())
      : viewMode === 'month'
        ? monthFormatter.format(anchor)
        : `${rangeFormatter.format(days[0])} – ${rangeFormatter.format(days[days.length - 1])}`

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      <div className="glass glass-shadow rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToday}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]"
          >
            Aujourd&rsquo;hui
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
              aria-label="Précédent"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="text-sm font-semibold text-[var(--text-primary)] capitalize px-1">{headerLabel}</p>
            <button
              type="button"
              onClick={goNext}
              className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
              aria-label="Suivant"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-lg p-1" style={{ backgroundColor: 'var(--surface-bg)' }}>
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setViewMode(opt.key)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors"
                style={
                  viewMode === opt.key
                    ? { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }
                    : { color: 'var(--text-muted)' }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => openCreate('event')}
            className="btn-accent flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium"
          >
            <Plus size={16} />
            Événement
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 shrink-0">
        {LEGEND_ITEMS.map((item) => (
          <span key={item.key} className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${item.className}`} />
            {item.label}
          </span>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {viewMode === 'year' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-fr gap-2 h-full min-h-0 overflow-y-auto thin-scroll">
            {Array.from({ length: 12 }, (_, m) => (
              <MiniMonth
                key={m}
                year={anchor.getFullYear()}
                month={m}
                events={events}
                todayKey={todayKey}
                schoolWeeks={schoolWeeks}
                holidayKeys={holidayKeys}
                onSelect={(monthDate) => {
                  setAnchor(monthDate)
                  setViewMode('month')
                }}
              />
            ))}
          </div>
        ) : viewMode === 'month' ? (
          <div className="flex flex-col gap-2 h-full min-h-0">
            <div className="grid grid-cols-7 gap-2 shrink-0 px-0.5">
              {days.slice(0, 7).map((d) => (
                <span
                  key={toDateKey(d)}
                  className="text-[11px] font-semibold text-[var(--text-faint)] text-center capitalize"
                >
                  {dayNameFormatter.format(d)}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 min-h-0 flex-1 overflow-y-auto thin-scroll auto-rows-[minmax(90px,1fr)]">
              {days.map((day) => {
                const key = toDateKey(day)
                const isToday = key === todayKey
                const inMonth = day.getMonth() === anchor.getMonth()
                const isWeekend = day.getDay() === 0 || day.getDay() === 6
                const dayEvents = eventsForDay(key)
                return (
                  <div
                    key={key}
                    className={`glass rounded-xl p-2 flex flex-col gap-1.5 min-h-0 transition-colors ${
                      isToday ? 'ring-2 ring-[var(--accent)]' : ''
                    } ${isWeekend ? 'day-weekend' : ''} ${isSchoolDay(key) ? 'day-school' : ''} ${
                      holidayKeys.has(key) ? 'day-holiday' : ''
                    } ${isOtherDay(key) ? 'day-other' : ''} ${!inMonth ? 'opacity-40' : ''}`}
                    title={holidayLabel(key)}
                  >
                    <span
                      className={`flex items-center justify-center shrink-0 text-[11px] ${
                        isToday ? 'w-5 h-5 rounded-full font-bold text-white' : 'text-[var(--text-faint)]'
                      }`}
                      style={isToday ? { backgroundColor: 'var(--accent)' } : undefined}
                    >
                      {day.getDate()}
                    </span>
                    <div className="flex flex-col gap-1 overflow-y-auto thin-scroll flex-1 min-h-0">
                      {dayEvents.map((ev) => (
                        <EventChip key={ev.id} event={ev} onOpen={() => openEdit(ev)} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              viewMode === 'work' ? 'lg:grid-cols-5' : 'lg:grid-cols-7'
            } auto-rows-[minmax(140px,1fr)] gap-2 h-full min-h-0 overflow-y-auto thin-scroll`}
          >
            {days.map((day) => {
              const key = toDateKey(day)
              const isToday = key === todayKey
              const dayEvents = eventsForDay(key)
              return (
                <div
                  key={key}
                  className={`glass glass-shadow rounded-2xl p-2.5 flex flex-col gap-2 h-full min-h-0 transition-colors ${
                    isToday ? 'ring-2 ring-[var(--accent)]' : ''
                  } ${isSchoolDay(key) ? 'day-school' : ''} ${holidayKeys.has(key) ? 'day-holiday' : ''} ${
                    isOtherDay(key) ? 'day-other' : ''
                  }`}
                  title={holidayLabel(key)}
                >
                  <div className="flex items-center justify-between shrink-0">
                    <span
                      className={`text-xs font-semibold capitalize ${
                        isToday ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {dayNameFormatter.format(day)}
                    </span>
                    <span
                      className={`flex items-center justify-center text-[11px] ${
                        isToday ? 'w-5 h-5 rounded-full font-bold text-white' : 'text-[var(--text-faint)]'
                      }`}
                      style={isToday ? { backgroundColor: 'var(--accent)' } : undefined}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 overflow-y-auto thin-scroll flex-1 min-h-0">
                    {dayEvents.map((ev) => (
                      <EventChip key={ev.id} event={ev} onOpen={() => openEdit(ev)} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <EventModal
        open={modalOpen}
        event={editingEvent}
        defaultType={createType}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
