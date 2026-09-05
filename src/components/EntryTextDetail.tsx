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
    <div className="space-y-4 rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
      <div>
        <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Lo que escribiste</p>
        <p className="whitespace-pre-wrap text-ink">{transcription}</p>
      </div>
      <div>
        <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Versión corregida</p>
        <FormattedText text={corrected} className="text-ink" />
      </div>
      <div>
        <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Explicación</p>
        {Array.isArray(explanation) ? (
          <ul className="list-disc space-y-1.5 pl-4 text-ink-soft marker:text-ink-faint">
            {explanation.map((item, i) => (
              <li key={i} className="pl-1 leading-relaxed">
                {renderFormattedParts(item)}
              </li>
            ))}
          </ul>
        ) : (
          <FormattedText text={explanation} className="text-ink-soft" />
        )}
      </div>
    </div>
  )
}
