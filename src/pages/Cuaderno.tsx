import { useEffect, useMemo, useState } from 'react'
import { EntryThumbnail } from '../components/EntryThumbnail'
import type { DailyEntryState } from '../hooks/useDailyEntry'
import { jpWeekdayLabel, relativeDateLabel } from '../lib/date'
import { grammarTag, scoreColorClass } from '../lib/entryDisplay'
import { listEntries, type Entry } from '../lib/entries'

const CARD_SHADOW = '0px 1px 2px 0px rgba(0,0,0,0.05)'

type Filter = 'todos' | 'mejor' | 'peor'

export function Cuaderno({ daily, onSelectEntry }: { daily: DailyEntryState; onSelectEntry: (entry: Entry) => void }) {
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [filter, setFilter] = useState<Filter>('todos')

  useEffect(() => {
    listEntries().then(setEntries)
  }, [])

  const filtered = useMemo(() => {
    if (!entries) return null
    switch (filter) {
      case 'mejor':
        return [...entries].sort((a, b) => b.score - a.score)
      case 'peor':
        return [...entries].sort((a, b) => a.score - b.score)
      default:
        return entries
    }
  }, [entries, filter])

  const pills: { key: Filter; label: string }[] = [
    { key: 'todos', label: `Todos (${entries?.length ?? 0})` },
    { key: 'mejor', label: 'Mejor puntuación' },
    { key: 'peor', label: 'Peor puntuación' },
  ]

  return (
    <div className="mx-auto max-w-lg px-4 pb-12">
      <h1 className="pt-2 font-serif text-2xl font-medium text-ink">Mi cuaderno</h1>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 py-4">
        {pills.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setFilter(p.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide whitespace-nowrap transition ${
              filter === p.key ? 'bg-ink text-white' : 'bg-paper-sunken text-ink-soft'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {filtered === null ? (
        <p className="p-6 text-center text-ink-soft">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="p-6 text-center text-ink-soft">No hay entradas acá todavía.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => {
            const isToday = entry.date === daily.today
            return (
              <button
                key={entry.date}
                type="button"
                onClick={() => onSelectEntry(entry)}
                className="block w-full overflow-hidden rounded-xl bg-paper-elevated p-4 text-left"
                style={{ boxShadow: CARD_SHADOW }}
              >
                <div className="mb-2.5 flex items-center gap-2">
                  {isToday && <span className="size-2 shrink-0 rounded-full bg-vermilion" />}
                  <span className="text-xs font-bold tracking-wide text-ink">{relativeDateLabel(entry.date, daily.today)}</span>
                  <span className="text-[10px] tracking-wide text-ink-soft">{jpWeekdayLabel(entry.date)}</span>
                </div>

                <div className="flex items-start gap-3">
                  <EntryThumbnail blob={entry.photoBlob} alt={`Escritura del ${entry.date}`} />
                  <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
                    <div className="space-y-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-base font-bold text-ink">{entry.prompt.themeTitle}</p>
                        <p className="shrink-0 font-serif text-xl font-bold">
                          <span className={scoreColorClass(entry.score)}>{entry.score}</span>
                          <span className="text-[10px] font-normal tracking-wide text-ink-soft">/100</span>
                        </p>
                      </div>
                      <p className="line-clamp-2 text-[13px] text-ink-soft">{entry.corrected}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded-full bg-paper-sunken px-2 py-0.5 text-[10px] font-semibold tracking-wide text-ink">
                        #{entry.prompt.level}
                      </span>
                      <span className="rounded-full bg-indigo-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-indigo-strong">
                        {grammarTag(entry.prompt.grammar)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
