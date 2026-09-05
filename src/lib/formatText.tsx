import type { ReactNode } from 'react'

export function renderFormattedParts(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-bold text-vermilion">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  )
}
