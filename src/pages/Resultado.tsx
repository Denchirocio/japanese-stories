import { HankoSeal } from '../components/HankoSeal'
import { ShareIcon, SparkleIcon } from '../components/icons'
import { SkillBar } from '../components/SkillBar'
import type { Entry } from '../lib/entries'
import { levelBadge } from '../lib/entryDisplay'

const CARD_SHADOW = '0px 1px 2px 0px rgba(0,0,0,0.05)'

const FALLBACK_METRIC = { score: 0, comment: 'Sin datos para esta entrada.' }

export function Resultado({ entry, onRetry }: { entry: Entry; onRetry: () => void }) {
  const breakdown = entry.breakdown ?? {
    handwriting: FALLBACK_METRIC,
    grammar: FALLBACK_METRIC,
    vocabulary: FALLBACK_METRIC,
    naturalness: FALLBACK_METRIC,
  }

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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-indigo-strong uppercase">
              <SparkleIcon className="size-3" />
              Análisis IA completado
            </span>
            <h1 className="font-serif text-[26px] leading-[1.25] text-ink">¡Desafío completado!</h1>
            <p className="text-[13px] text-ink-soft">Tu práctica de hoy fue evaluada con Claude, trazo a trazo.</p>
          </div>
          <HankoSeal score={entry.score} />
        </div>
      </div>

      <div className="rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Calificación general</p>
            <p className="font-serif text-[34px] font-semibold text-ink">
              {entry.score}
              <span className="text-base font-semibold text-ink-soft">/100</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-paper-sunken-strong px-3 py-1.5">
            <span className="size-2.5 shrink-0 rounded-full bg-vermilion" />
            <span className="text-base font-bold text-ink">{levelBadge(entry.score)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-ink">Desglose de destrezas</span>
          <span className="text-[10px] font-bold tracking-wide text-ink-soft">Criterio JLPT {entry.prompt.level}</span>
        </div>
        <SkillBar
          label="Trazo y caligrafía"
          score={breakdown.handwriting.score}
          comment={breakdown.handwriting.comment}
          colorClass="bg-ink"
        />
        <SkillBar
          label="Gramática y estructura"
          score={breakdown.grammar.score}
          comment={breakdown.grammar.comment}
          colorClass="bg-indigo"
        />
        <SkillBar
          label="Vocabulario aplicado"
          score={breakdown.vocabulary.score}
          comment={breakdown.vocabulary.comment}
          colorClass="bg-vermilion"
        />
        <SkillBar
          label="Naturalidad y fluidez"
          score={breakdown.naturalness.score}
          comment={breakdown.naturalness.comment}
          colorClass="bg-matcha"
        />
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-paper-sunken-strong text-xs font-bold tracking-wide text-ink uppercase transition hover:bg-paper-sunken"
      >
        <ShareIcon className="size-3.5" />
        Compartir tarjeta de resultado
      </button>

      <button type="button" onClick={onRetry} className="w-full py-1 text-center text-sm font-semibold text-ink-soft underline">
        ¿No quedó como esperabas? Rehacer el envío
      </button>
    </div>
  )
}
