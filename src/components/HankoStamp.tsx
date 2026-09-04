export function HankoStamp({
  label = '済',
  rotate = -3,
  size = 44,
}: {
  label?: string
  rotate?: number
  size?: number
}) {
  return (
    <div
      className="shrink-0 rounded-sm border-2 border-vermilion p-[3px]"
      style={{ transform: `rotate(${rotate}deg)`, width: size, height: size }}
    >
      <div
        className="flex h-full w-full items-center justify-center rounded-[2px] border border-vermilion font-serif text-vermilion font-semibold"
        style={{ fontSize: size * 0.36 }}
      >
        {label}
      </div>
    </div>
  )
}
