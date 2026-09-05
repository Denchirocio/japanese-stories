import { useEffect, useState } from 'react'
import { CloseIcon, EyeIcon } from './icons'

const CARD_SHADOW = '0px 2px 6px 0px rgba(30,32,34,0.06)'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function ManuscriptCard({ blob, alt }: { blob: Blob; alt: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  const typeLabel = blob.type === 'image/png' ? 'PNG' : 'JPG'

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-paper-sunken-strong shadow-inner">
            {url && <img src={url} alt={alt} className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink">Manuscrito escaneado</p>
            <p className="truncate text-[10px] font-bold tracking-wide text-ink-soft uppercase">
              {typeLabel} • {formatFileSize(blob.size)} • Capturado con cámara
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex shrink-0 items-center gap-1 rounded-full bg-paper-sunken px-3 py-1.5 text-[10px] font-semibold tracking-wide text-ink uppercase transition hover:bg-paper-sunken-strong"
        >
          <EyeIcon className="size-3" />
          Ver foto
        </button>
      </div>

      {expanded && url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setExpanded(false)}
        >
          <img src={url} alt={alt} className="max-h-full max-w-full rounded-xl object-contain" />
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-ink"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      )}
    </>
  )
}
