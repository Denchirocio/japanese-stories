import { HankoRingIcon } from './icons'

function praisePhrase(score: number): [string, string] {
  if (score >= 95) return ['大変', 'よくできました']
  if (score >= 85) return ['よく', 'できました']
  if (score >= 70) return ['できました', '']
  return ['頑張ろう', '']
}

export function HankoSeal({ score, size = 80 }: { score: number; size?: number }) {
  const [line1, line2] = praisePhrase(score)
  return (
    <div
      className="relative flex shrink-0 items-center justify-center text-vermilion drop-shadow-[0px_2px_4px_rgba(239,78,74,0.25)]"
      style={{ width: size, height: size, transform: 'rotate(-4deg)' }}
    >
      <HankoRingIcon className="absolute inset-0 h-full w-full" />
      <div className="relative flex flex-col items-center justify-center">
        <span className="font-serif-jp leading-none" style={{ fontSize: size * 0.25 }}>
          {line1}
        </span>
        {line2 && (
          <span className="pt-0.5 font-serif-jp leading-none" style={{ fontSize: size * 0.125 }}>
            {line2}
          </span>
        )}
        <span className="pt-1 leading-none opacity-80" style={{ fontSize: size * 0.1 }}>
          済
        </span>
      </div>
    </div>
  )
}
