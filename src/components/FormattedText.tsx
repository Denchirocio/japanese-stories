import { renderFormattedParts } from '../lib/formatText'

export function FormattedText({
  text,
  className,
  markClassName,
}: {
  text: string
  className?: string
  markClassName?: string
}) {
  return <p className={`whitespace-pre-wrap ${className ?? ''}`}>{renderFormattedParts(text, markClassName)}</p>
}
