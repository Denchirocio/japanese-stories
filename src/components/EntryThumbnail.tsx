import { useEffect, useState } from 'react'
import { ScanBadgeIcon } from './icons'

export function EntryThumbnail({ blob, alt }: { blob: Blob; alt: string }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  return (
    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-paper-sunken-strong shadow-inner">
      {url && <img src={url} alt={alt} className="h-full w-full object-cover" />}
      <div className="absolute right-1 bottom-1 flex items-center gap-0.5 rounded bg-ink/80 px-1 py-0.5 backdrop-blur-sm">
        <ScanBadgeIcon className="size-2 text-paper" />
        <span className="text-[9px] text-paper">Scan</span>
      </div>
    </div>
  )
}
