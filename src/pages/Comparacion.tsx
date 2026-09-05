import { FormattedText } from '../components/FormattedText'
import { BackArrowIcon } from '../components/icons'
import { jpWeekdayLabel } from '../lib/date'
import type { Entry } from '../lib/entries'
import { attemptBadgeClass, attemptLabel, levelBadge } from '../lib/entryDisplay'

const CARD_SHADOW = '0px 1px 2px 0px rgba(0,0,0,0.05)'

const FALLBACK_METRIC = { score: 0, comment: '' }

const SKILLS: { key: 'handwriting' | 'grammar' | 'vocabulary' | 'naturalness'; label: string }[] = [
  { key: 'handwriting', label: 'Trazo y caligrafía' },
  { key: 'grammar', label: 'Gramática y estructura' },
  { key: 'vocabulary', label: 'Vocabulario aplicado' },
  { key: 'naturalness', label: 'Naturalidad y fluidez' },
]

function DeltaTag({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="rounded-full bg-paper-sunken-strong px-2 py-0.5 text-[10px] font-bold tracking-wide text-ink-soft uppercase">
        Sin cambio
      </span>
    )
  }
  const positive = delta > 0
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
        positive ? 'bg-matcha-soft text-matcha' : 'bg-vermilion-soft text-vermilion-strong'
      }`}
    >
      {positive ? '+' : ''}
      {delta} pts
    </span>
  )
}

export function Comparacion({ original, correction, onBack }: { original: Entry; correction: Entry; onBack: () => void }) {
  const scoreDelta = correction.score - original.score

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
        <div>
          <p className="font-serif text-xl text-ink">
            {original.date} <span className="font-sans-jp text-base text-ink-soft">{jpWeekdayLabel(original.date)}</span>
          </p>
          <p className="text-sm text-ink-soft">{original.prompt.themeTitle}</p>
        </div>
      </div>

      <div className="rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="grid grid-cols-2 gap-3">
          {[original, correction].map((entry) => (
            <div key={entry.id} className="space-y-1 text-center">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${attemptBadgeClass(entry.attempt)}`}
              >
                {attemptLabel(entry.attempt)}
              </span>
              <p className="font-serif text-3xl font-semibold text-ink">
                {entry.score}
                <span className="text-sm font-semibold text-ink-soft">/100</span>
              </p>
              <p className="text-xs font-semibold text-ink-soft">{levelBadge(entry.score)}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-line pt-3">
          <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Diferencia</span>
          <DeltaTag delta={scoreDelta} />
        </div>
      </div>

      <div className="space-y-4 rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-ink">Desglose por destreza</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-wide text-indigo-strong uppercase">
              <span className="size-2 rounded-full bg-indigo" />
              Original
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-wide text-matcha uppercase">
              <span className="size-2 rounded-full bg-matcha" />
              Corrección
            </span>
          </div>
        </div>
        {SKILLS.map(({ key, label }) => {
          const a = (original.breakdown?.[key] ?? FALLBACK_METRIC).score
          const b = (correction.breakdown?.[key] ?? FALLBACK_METRIC).score
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink">{label}</span>
                <DeltaTag delta={b - a} />
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-paper-sunken-strong">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-indigo" style={{ width: `${a}%` }} />
                </div>
                <span className="w-9 text-right">{a}%</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-paper-sunken-strong">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-matcha" style={{ width: `${b}%` }} />
                </div>
                <span className="w-9 text-right">{b}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-3">
        {[original, correction].map((entry) => (
          <div key={entry.id} className="space-y-1.5 rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${attemptBadgeClass(entry.attempt)}`}
            >
              {attemptLabel(entry.attempt)}
            </span>
            <FormattedText text={entry.corrected} className="text-lg leading-relaxed text-ink" />
          </div>
        ))}
      </div>
    </div>
  )
}
