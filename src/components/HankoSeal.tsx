export function HankoSeal({ size = 80 }: { size?: number }) {
  return (
    <img
      src="/sello.png"
      alt="Sello de finalización"
      className="shrink-0 drop-shadow-[0px_2px_4px_rgba(239,78,74,0.25)]"
      style={{ width: size, height: size, transform: 'rotate(-4deg)' }}
    />
  )
}
