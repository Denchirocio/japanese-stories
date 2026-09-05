export function scoreColorClass(score: number): string {
  if (score >= 93) return 'text-vermilion'
  if (score >= 85) return 'text-indigo'
  return 'text-ink'
}

export function grammarTag(grammar: string): string {
  const head = grammar.split(/[\s(（]/)[0]
  return `#${head}`
}

export function attemptLabel(attempt: 1 | 2): string {
  return attempt === 1 ? 'Original' : 'Corrección'
}

export function attemptBadgeClass(attempt: 1 | 2): string {
  return attempt === 1 ? 'bg-indigo-soft text-indigo-strong' : 'bg-matcha-soft text-matcha'
}

export function levelBadge(score: number): string {
  if (score >= 95) return 'Nivel S'
  if (score >= 90) return 'Nivel A+'
  if (score >= 80) return 'Nivel A'
  if (score >= 70) return 'Nivel B'
  if (score >= 60) return 'Nivel C'
  if (score >= 50) return 'Nivel D'
  if (score >= 40) return 'Nivel E'
  return 'Nivel F'
}
