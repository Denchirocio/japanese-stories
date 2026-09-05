import { EntryPhoto } from '../components/EntryPhoto'
import { EntryTextDetail } from '../components/EntryTextDetail'
import { HankoSeal } from '../components/HankoSeal'
import { ShareIcon, SparkleIcon } from '../components/icons'
import { ScoreBreakdown } from '../components/ScoreBreakdown'
import type { Entry } from '../lib/entries'
import { attemptBadgeClass, attemptLabel, levelBadge } from '../lib/entryDisplay'

const CARD_SHADOW = '0px 1px 2px 0px rgba(0,0,0,0.05)'

export function Resultado({ entry, canRetry, onRetry }: { entry: Entry; canRetry: boolean; onRetry: () => void }) {
  async function handleShare() {
    const text = `¡Completé el desafío de hoy en Kotoba 言葉! Puntaje: ${entry.score}/100 (${levelBadge(entry.score)})`
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        // el usuario canceló el share, no hacemos nada
      }
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      alert('Copiado al portapapeles')
    } catch {
      // clipboard no disponible, ignoramos silenciosamente
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-12 pt-6">
      <div className="relative overflow-hidden rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="pointer-events-none absolute -right-6 -bottom-6 size-36 rounded-full bg-indigo-soft/40 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-indigo-strong uppercase">
                <SparkleIcon className="size-3" />
                Análisis IA completado
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${attemptBadgeClass(entry.attempt)}`}>
                {attemptLabel(entry.attempt)}
              </span>
            </div>
            <h1 className="font-serif text-[26px] leading-[1.25] text-ink">¡Desafío completado!</h1>
            <p className="text-[13px] text-ink-soft">Tu práctica de hoy fue evaluada.</p>
          </div>
          <HankoSeal />
        </div>
      </div>

      <ScoreBreakdown result={entry} level={entry.prompt.level} />

      <EntryPhoto blob={entry.photoBlob} alt="Tu escritura de hoy" className="w-full rounded-xl border border-line" />

      <EntryTextDetail transcription={entry.transcription} corrected={entry.corrected} explanation={entry.explanation} />

      <button
        type="button"
        onClick={handleShare}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-paper-sunken-strong text-xs font-bold tracking-wide text-ink uppercase transition hover:bg-paper-sunken"
      >
        <ShareIcon className="size-3.5" />
        Compartir tarjeta de resultado
      </button>

      {canRetry ? (
        <button type="button" onClick={onRetry} className="w-full py-1 text-center text-sm font-semibold text-ink-soft underline">
          ¿No quedó como esperabas? Rehacer el envío
        </button>
      ) : (
        <p className="w-full py-1 text-center text-sm text-ink-faint">Ya usaste tus 2 intentos de hoy.</p>
      )}
    </div>
  )
}
