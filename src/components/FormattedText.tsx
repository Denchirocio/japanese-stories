import { renderFormattedParts } from '../lib/formatText'

export function FormattedText({ text, className }: { text: string; className?: string }) {
  return <p className={`whitespace-pre-wrap ${className ?? ''}`}>{renderFormattedParts(text)}</p>
}
