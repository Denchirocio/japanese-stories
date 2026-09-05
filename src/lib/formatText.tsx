import type { ReactNode } from 'react'

const DEFAULT_MARK_CLASS = 'rounded bg-indigo-soft px-1 font-semibold text-indigo-strong'

export function renderFormattedParts(text: string, markClassName: string = DEFAULT_MARK_CLASS): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <mark key={i} className={markClassName}>
        {part.slice(2, -2)}
      </mark>
    ) : (
      part
    ),
  )
}
