import type { ExplanationPoint } from '../lib/correctWriting'
import { renderFormattedParts } from '../lib/formatText'
import { FormattedText } from './FormattedText'

const CARD_SHADOW = '0px 1px 2px 0px rgba(0,0,0,0.05)'

function isExplanationPoints(explanation: ExplanationPoint[] | string[] | string): explanation is ExplanationPoint[] {
  return Array.isArray(explanation) && typeof explanation[0] === 'object'
}

function ExplanationCard({ index, title, description }: { index: number; title?: string; description: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-paper-sunken p-3">
      <span className="mt-0.5 shrink-0 rounded bg-[#d4e3ff] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#001c3a]">
        {index}
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        {title && <p className="text-[13px] font-semibold text-ink">{renderFormattedParts(title)}</p>}
        <p className="text-xs leading-relaxed font-medium text-ink-soft">{renderFormattedParts(description)}</p>
      </div>
    </div>
  )
}

export function EntryTextDetail({
  transcription,
  corrected,
  explanation,
}: {
  transcription: string
  corrected: string
  explanation: ExplanationPoint[] | string[] | string
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="mb-1 flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-vermilion" />
          <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Lo que escribiste</p>
        </div>
        <FormattedText
          text={transcription}
          className="text-lg leading-relaxed text-ink"
          markClassName="rounded bg-vermilion-soft px-1 font-semibold text-vermilion-strong"
        />
      </div>

      <div className="rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="mb-1 flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-indigo" />
          <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Versión corregida</p>
        </div>
        <FormattedText text={corrected} className="text-lg leading-relaxed text-ink" />
      </div>

      <div className="rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <p className="mb-2 text-xs font-semibold tracking-wide text-ink-soft uppercase">Explicación</p>
        {isExplanationPoints(explanation) ? (
          <div className="space-y-2">
            {explanation.map((point, i) => (
              <ExplanationCard key={i} index={i + 1} title={point.title} description={point.description} />
            ))}
          </div>
        ) : Array.isArray(explanation) ? (
          <div className="space-y-2">
            {explanation.map((item, i) => (
              <ExplanationCard key={i} index={i + 1} description={item} />
            ))}
          </div>
        ) : (
          <FormattedText text={explanation} className="text-base leading-relaxed text-ink-soft" />
        )}
      </div>
    </div>
  )
}
