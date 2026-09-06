import { useEffect, useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons'
import type { DailyEntryState } from '../hooks/useDailyEntry'
import { listEntries, type Entry } from '../lib/entries'

const CARD_SHADOW = '0px 4px 20px 0px rgba(30,32,34,0.05)'
const PILL_SHADOW = '0px 4px 6px rgba(30,32,34,0.22)'

const WEEKDAYS = [
  { letter: 'D', kanji: '日', color: 'text-vermilion' },
  { letter: 'L', kanji: '月', color: 'text-ink-soft' },
  { letter: 'M', kanji: '火', color: 'text-ink-soft' },
  { letter: 'M', kanji: '水', color: 'text-ink-soft' },
  { letter: 'J', kanji: '木', color: 'text-ink-soft' },
  { letter: 'V', kanji: '金', color: 'text-ink-soft' },
  { letter: 'S', kanji: '土', color: 'text-indigo' },
]

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function dayNumberColor(weekday: number): string {
  if (weekday === 0) return 'text-vermilion'
  if (weekday === 6) return 'text-indigo'
  return 'text-ink'
}

export function Calendario({
  daily,
  onSelectEntry,
  onGoToHistorias,
}: {
  daily: DailyEntryState
  onSelectEntry: (entry: Entry) => void
  onGoToHistorias: () => void
}) {
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
    entries?.forEach((e) => {
      const existing = map.get(e.date)
      if (!existing) {
        map.set(e.date, e)
        return
      }
      // Preferir la entrada diaria como representante del día — la semanal
      // (si existe) se ve dentro del detalle, no reemplaza el trazo diario.
      const existingIsDaily = (existing.type ?? 'daily') === 'daily'
      const currentIsDaily = (e.type ?? 'daily') === 'daily'
      if (existingIsDaily && !currentIsDaily) return
      if (!existingIsDaily && currentIsDaily) {
        map.set(e.date, e)
        return
      }
      if (e.attempt > existing.attempt) map.set(e.date, e)
    })
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

  const completedThisMonth = new Set(
    entries?.filter((e) => e.date.startsWith(`${year}-${pad(month + 1)}`)).map((e) => e.date),
  ).size

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-12 pt-6">
      <h1 className="font-serif text-2xl font-medium text-ink">Calendario</h1>

      <div className="rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="flex items-center justify-between pb-4">
          <p className="font-serif text-lg text-ink">{monthLabel}</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="flex size-8 items-center justify-center rounded-full text-ink-soft hover:bg-paper-sunken"
              aria-label="Mes anterior"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="flex size-8 items-center justify-center rounded-full text-ink-soft hover:bg-paper-sunken"
              aria-label="Mes siguiente"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 pb-2 text-center">
          {WEEKDAYS.map((w, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className={`text-xs font-semibold tracking-wide ${w.color}`}>{w.letter}</span>
              <span className="text-sm font-medium tracking-wide text-ink-soft">{w.kanji}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />
            const dateId = `${year}-${pad(month + 1)}-${pad(d)}`
            const entry = entryByDate.get(dateId)
            const isToday = dateId === daily.today
            const weekday = (startWeekday + d - 1) % 7
            return (
              <button
                key={i}
                type="button"
                disabled={!entry}
                onClick={() => entry && onSelectEntry(entry)}
                className="relative flex aspect-square items-center justify-center"
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-lg text-xl font-semibold transition ${
                    entry
                      ? 'bg-ink text-paper hover:bg-indigo'
                      : `${dayNumberColor(weekday)} disabled:cursor-default`
                  }`}
                  style={entry ? { boxShadow: PILL_SHADOW } : undefined}
                >
                  {d}
                </span>
                {isToday && (
                  <span
                    className={`absolute bottom-1 size-1.5 rounded-full ${entry ? 'bg-vermilion-soft' : 'bg-vermilion'}`}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-paper-sunken px-3 py-2">
          <span className="size-2 shrink-0 rounded-full bg-ink" />
          <span className="text-[13px] font-medium text-ink">
            {completedThisMonth} historia{completedThisMonth === 1 ? '' : 's'} este mes
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-paper-sunken p-4">
        <div>
          <p className="text-base font-semibold text-ink">
            {daily.lastEntry ? '¡Ya escribiste hoy!' : '¿Listo para escribir hoy?'}
          </p>
          <p className="text-[13px] text-ink-soft">
            {daily.lastEntry ? 'Podés revisar tu corrección de hoy.' : 'Tu pluma y tu cuaderno esperan el trazo del día.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => (daily.lastEntry ? onSelectEntry(daily.lastEntry) : onGoToHistorias())}
          className="shrink-0 rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-paper shadow-sm hover:bg-indigo"
        >
          {daily.lastEntry ? 'Ver corrección' : 'Enviar historia'}
        </button>
      </div>
    </div>
  )
}
