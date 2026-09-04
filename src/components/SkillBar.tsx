export function SkillBar({
  label,
  score,
  comment,
  colorClass,
}: {
  label: string
  score: number
  comment: string
  colorClass: string
}) {
  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink">{label}</span>
        <span className="text-xs font-bold text-ink">{score}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-paper-sunken-strong">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
      </div>
      <p className="text-[13px] text-ink-soft">{comment}</p>
    </div>
  )
}
