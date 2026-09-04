import { useEffect, useRef, useState } from 'react'
import { BackArrowIcon, CameraIcon, FlipCameraIcon, LightbulbIcon } from '../components/icons'
import type { DailyEntryState } from '../hooks/useDailyEntry'
import { requestCorrection } from '../lib/correctWriting'
import { saveEntry } from '../lib/entries'
import { resizeImageFile } from '../lib/image'
import { bumpStreakForToday } from '../lib/streak'

type Facing = 'environment' | 'user'

const FRAME_SHADOW = '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)'
const CTA_SHADOW = '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function Camera({
  daily,
  onClose,
  onSaved,
}: {
  daily: DailyEntryState
  onClose: () => void
  onSaved: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [facing, setFacing] = useState<Facing>('environment')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [capture, setCapture] = useState<{ blob: Blob; url: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  useEffect(() => {
    if (capture) return
    let cancelled = false

    async function start() {
      stopStream()
      setCameraError(null)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch {
        if (!cancelled) setCameraError('No se pudo acceder a la cámara. Podés subir una foto en su lugar.')
      }
    }

    start()
    return () => {
      cancelled = true
    }
  }, [facing, capture])

  // Stop the camera for good on unmount.
  useEffect(() => () => stopStream(), [])

  // Revoke each capture's object URL when it's replaced or the screen closes.
  useEffect(() => {
    return () => {
      if (capture) URL.revokeObjectURL(capture.url)
    }
  }, [capture])

  function handleShutter() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return
    const maxDim = 1600
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth * scale
    canvas.height = video.videoHeight * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        stopStream()
        setCapture({ blob, url: URL.createObjectURL(blob) })
      },
      'image/jpeg',
      0.85,
    )
  }

  async function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const { blob } = await resizeImageFile(file)
    stopStream()
    setCapture({ blob, url: URL.createObjectURL(blob) })
  }

  function retake() {
    setSubmitError(null)
    setCapture(null)
  }

  async function handleSend() {
    if (!capture) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const base64 = await blobToBase64(capture.blob)
      const correction = await requestCorrection(base64, 'image/jpeg', daily.prompt)
      const savedEntry = await saveEntry(daily.today, daily.prompt, capture.blob, correction)
      const newStreak = bumpStreakForToday(daily.today)
      daily.setEntry(savedEntry)
      daily.setStreak(newStreak)
      onSaved()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Algo salió mal, probá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper pb-6">
      <div className="mx-auto max-w-lg px-4 pt-4 pb-4">
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full bg-paper-sunken shadow-sm"
        >
          <BackArrowIcon className="size-3.5 text-ink" />
        </button>
      </div>

      <div className="mx-auto max-w-lg px-4">
        <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-ink" style={{ boxShadow: FRAME_SHADOW }}>
          {capture ? (
            <img src={capture.url} alt="Foto capturada" className="h-full w-full object-cover" />
          ) : cameraError ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-paper/90">
              <p className="text-sm">{cameraError}</p>
            </div>
          ) : (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          )}

          {!capture && !cameraError && (
            <div className="pointer-events-none absolute inset-6">
              <span className="absolute top-0 left-0 size-5 rounded-tl-md border-t-2 border-l-2 border-white/70" />
              <span className="absolute top-0 right-0 size-5 rounded-tr-md border-t-2 border-r-2 border-white/70" />
              <span className="absolute bottom-0 left-0 size-5 rounded-bl-md border-b-2 border-l-2 border-white/70" />
              <span className="absolute right-0 bottom-0 size-5 rounded-br-md border-r-2 border-b-2 border-white/70" />
            </div>
          )}

          {!capture && !cameraError && (
            <button
              type="button"
              onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
              className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur"
              aria-label="Cambiar de cámara"
            >
              <FlipCameraIcon className="size-4" />
            </button>
          )}

          <div className="absolute inset-x-8 top-4 flex items-center justify-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-ink shadow-sm backdrop-blur-md">
            <span className="size-2 shrink-0 rounded-full bg-indigo" />
            {capture ? 'Foto lista para enviar' : 'Encuadrá tu hoja de papel'}
          </div>

          {!capture && !cameraError && (
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-full bg-ink/85 px-3.5 py-2 text-paper backdrop-blur-md">
              <LightbulbIcon className="size-3 shrink-0" />
              <span className="text-[13px] leading-tight">Mantené la cámara paralela con luz suave</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-2 px-4 pt-4">
        {capture ? (
          <>
            {submitError && <p className="text-sm text-vermilion">{submitError}</p>}
            <button
              type="button"
              onClick={handleSend}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-ink px-4 py-3.5 font-bold text-paper transition hover:bg-indigo active:scale-[0.98] disabled:opacity-50"
              style={{ boxShadow: CTA_SHADOW }}
            >
              {submitting ? 'Corrigiendo...' : 'Enviar escrito'}
            </button>
            <button
              type="button"
              onClick={retake}
              disabled={submitting}
              className="w-full py-2 text-center text-sm font-semibold text-ink-soft disabled:opacity-50"
            >
              Volver a sacar la foto
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleShutter}
              disabled={!!cameraError}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-ink px-4 py-3.5 font-bold text-paper transition hover:bg-indigo active:scale-[0.98] disabled:opacity-50"
              style={{ boxShadow: CTA_SHADOW }}
            >
              <CameraIcon className="size-[18px]" />
              Sacar foto
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 text-center text-sm font-semibold text-ink-soft underline"
            >
              Elegir una foto de la galería
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFilePicked} className="hidden" />
          </>
        )}
      </div>
    </div>
  )
}
