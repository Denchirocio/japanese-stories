import { useEffect, useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons'
import type { DailyEntryState } from '../hooks/useDailyEntry'
import { listEntries, type Entry } from '../lib/entries'

const CARD_SHADOW = '0px 1px 2px 0px rgba(0,0,0,0.05)'
const WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function Calendario({ daily, onSelectEntry }: { daily: DailyEntryState; onSelectEntry: (entry: Entry) => void }) {
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [cursor, setCursor] = useState(() => {
    const [y, m] = daily.today.split('-').map(Number)
    return { year: y, month: m - 1 }
  })

  useEffect(() => {
    listEntries().then(setEntries)
  }, [])

  const entryByDate = useMemo(() => {
    const map = new Map<string, Entry>()
    entries?.forEach((e) => map.set(e.date, e))
    return map
  }, [entries])

  const { year, month } = cursor
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = firstDay.getDay()

  const cells: (number | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const rawMonthLabel = firstDay.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const monthLabel = rawMonthLabel.charAt(0).toUpperCase() + rawMonthLabel.slice(1)

  function changeMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const completedThisMonth = entries?.filter((e) => e.date.startsWith(`${year}-${pad(month + 1)}`)).length ?? 0

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-12 pt-6">
      <h1 className="font-serif text-2xl font-medium text-ink">Calendario</h1>

      <div className="rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="flex items-center justify-between pb-4">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="flex size-8 items-center justify-center rounded-full text-ink-soft hover:bg-paper-sunken"
            aria-label="Mes anterior"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <p className="font-serif text-base text-ink">{monthLabel}</p>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="flex size-8 items-center justify-center rounded-full text-ink-soft hover:bg-paper-sunken"
            aria-label="Mes siguiente"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 pb-1 text-center text-[10px] font-bold tracking-wide text-ink-soft uppercase">
          {WEEKDAYS.map((w, i) => (
            <div key={i}>{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />
            const dateId = `${year}-${pad(month + 1)}-${pad(d)}`
            const entry = entryByDate.get(dateId)
            const isToday = dateId === daily.today
            return (
              <button
                key={i}
                type="button"
                disabled={!entry}
                onClick={() => entry && onSelectEntry(entry)}
                className={`aspect-square rounded-lg text-sm transition ${
                  entry
                    ? 'bg-ink font-bold text-paper hover:bg-indigo'
                    : 'text-ink-soft disabled:cursor-default'
                } ${isToday ? 'ring-2 ring-vermilion ring-offset-1 ring-offset-paper-elevated' : ''}`}
              >
                {d}
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-center text-sm text-ink-soft">
        {completedThisMonth} historia{completedThisMonth === 1 ? '' : 's'} este mes
      </p>
    </div>
  )
}
