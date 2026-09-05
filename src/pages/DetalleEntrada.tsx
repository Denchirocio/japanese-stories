import { EntryPhoto } from '../components/EntryPhoto'
import { EntryTextDetail } from '../components/EntryTextDetail'
import { ScoreBreakdown } from '../components/ScoreBreakdown'
import { BackArrowIcon } from '../components/icons'
import { jpWeekdayLabel } from '../lib/date'
import type { Entry } from '../lib/entries'
import { attemptBadgeClass, attemptLabel } from '../lib/entryDisplay'

export function DetalleEntrada({ entry, onBack }: { entry: Entry; onBack: () => void }) {
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

      <ScoreBreakdown result={entry} level={entry.prompt.level} />

      <EntryPhoto blob={entry.photoBlob} alt={`Escritura del ${entry.date}`} className="w-full rounded-xl border border-line" />

      <EntryTextDetail transcription={entry.transcription} corrected={entry.corrected} explanation={entry.explanation} />
    </div>
  )
}
