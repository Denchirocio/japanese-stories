export function scoreColorClass(score: number): string {
  if (score >= 93) return 'text-vermilion'
  if (score >= 85) return 'text-indigo'
  return 'text-ink'
}

export function grammarTag(grammar: string): string {
  const head = grammar.split(/[\s(（]/)[0]
  return `#${head}`
}
