import { renderFormattedParts } from '../lib/formatText'
import { FormattedText } from './FormattedText'

const CARD_SHADOW = '0px 1px 2px 0px rgba(0,0,0,0.05)'

export function EntryTextDetail({
  transcription,
  corrected,
  explanation,
}: {
  transcription: string
  corrected: string
  explanation: string | string[]
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="mb-1 flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-vermilion" />
          <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Lo que escribiste</p>
        </div>
        <p className="whitespace-pre-wrap text-lg leading-relaxed text-ink">{transcription}</p>
      </div>

      <div className="rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="mb-1 flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-indigo" />
          <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Versión corregida</p>
        </div>
        <FormattedText text={corrected} className="text-lg leading-relaxed text-ink" />
      </div>

      <div className="rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Explicación</p>
        {Array.isArray(explanation) ? (
          <ul className="list-disc space-y-2 pl-4 text-base text-ink-soft marker:text-ink-faint">
            {explanation.map((item, i) => (
              <li key={i} className="pl-1 leading-relaxed">
                {renderFormattedParts(item)}
              </li>
            ))}
          </ul>
        ) : (
          <FormattedText text={explanation} className="text-base leading-relaxed text-ink-soft" />
        )}
      </div>
    </div>
  )
}
