import type { ReactNode } from 'react'

export function renderFormattedParts(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <mark key={i} className="rounded bg-vermilion-soft px-1 font-semibold text-vermilion-strong">
        {part.slice(2, -2)}
      </mark>
    ) : (
      part
    ),
  )
}
