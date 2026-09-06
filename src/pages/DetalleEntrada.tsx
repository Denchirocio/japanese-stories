import { useEffect, useState } from 'react'
import { EntryTextDetail } from '../components/EntryTextDetail'
import { ScoreBreakdown } from '../components/ScoreBreakdown'
import { BackArrowIcon } from '../components/icons'
import { ManuscriptCard } from '../components/ManuscriptCard'
import { MasteredVocab } from '../components/MasteredVocab'
import { jpWeekdayLabel } from '../lib/date'
import { getEntriesForDate, type Entry } from '../lib/entries'
import { attemptBadgeClass, attemptLabel } from '../lib/entryDisplay'

export function DetalleEntrada({
  entry,
  onBack,
  onCompare,
}: {
  entry: Entry
  onBack: () => void
  onCompare: (original: Entry, correction: Entry) => void
}) {
  const [sibling, setSibling] = useState<Entry | null>(null)

  useEffect(() => {
    let cancelled = false
    getEntriesForDate(entry.date).then((entries) => {
      if (cancelled) return
      const other = entries.find((e) => e.attempt !== entry.attempt)
      setSibling(other ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [entry.date, entry.attempt])

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-12 pt-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-paper-sunken shadow-sm"
        >
          <BackArrowIcon className="size-3.5 text-ink" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-serif text-xl text-ink">
              {entry.date} <span className="font-sans-jp text-base text-ink-soft">{jpWeekdayLabel(entry.date)}</span>
            </p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${attemptBadgeClass(entry.attempt)}`}>
              {attemptLabel(entry.attempt)}
            </span>
          </div>
          <p className="text-sm text-ink-soft">{entry.prompt.themeTitle}</p>
        </div>
      </div>

      <ScoreBreakdown
        result={entry}
        level={entry.prompt.level}
        bonusGrammar={entry.prompt.bonusGrammar}
        onCompare={
          sibling ? () => onCompare(entry.attempt === 1 ? entry : sibling, entry.attempt === 1 ? sibling : entry) : undefined
        }
      />

      <ManuscriptCard blob={entry.photoBlob} alt={`Escritura del ${entry.date}`} />

      <MasteredVocab entry={entry} />

      <EntryTextDetail transcription={entry.transcription} corrected={entry.corrected} explanation={entry.explanation} />
    </div>
  )
}
