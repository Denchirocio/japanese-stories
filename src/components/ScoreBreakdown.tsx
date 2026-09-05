import type { CorrectionResult } from '../lib/correctWriting'
import { levelBadge } from '../lib/entryDisplay'
import { countUniqueKanji, countWords } from '../lib/textStats'
import { BrushIcon, MedalIcon } from './icons'
import { SkillBar } from './SkillBar'

const CARD_SHADOW = '0px 1px 2px 0px rgba(0,0,0,0.05)'
const FALLBACK_METRIC = { score: 0, comment: 'Sin datos para esta entrada.' }

export function ScoreBreakdown({ result, level }: { result: CorrectionResult; level: string }) {
  const breakdown = result.breakdown ?? {
    handwriting: FALLBACK_METRIC,
    grammar: FALLBACK_METRIC,
    vocabulary: FALLBACK_METRIC,
    naturalness: FALLBACK_METRIC,
  }

  const wordCount = countWords(result.transcription)
  const kanjiCount = countUniqueKanji(result.transcription)

  return (
    <>
      <div className="space-y-4 rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Calificación general</p>
            <p className="font-serif text-[34px] font-semibold text-ink">
              {result.score}
              <span className="text-base font-semibold text-ink-soft">/100</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-paper-sunken-strong px-3 py-1.5">
            <span className="size-2.5 shrink-0 rounded-full bg-vermilion" />
            <span className="text-base font-bold text-ink">{levelBadge(result.score)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg bg-paper-sunken p-2.5">
            <MedalIcon className="size-4 text-indigo" />
            <span className="text-base font-bold text-ink">{wordCount}</span>
            <span className="text-center text-[10px] font-bold tracking-wide text-ink-soft uppercase">Palabras totales</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg bg-paper-sunken p-2.5">
            <BrushIcon className="size-4 text-indigo" />
            <span className="text-base font-bold text-ink">{kanjiCount} Kanji</span>
            <span className="text-center text-[10px] font-bold tracking-wide text-ink-soft uppercase">en tu escrito</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl bg-paper-elevated p-4" style={{ boxShadow: CARD_SHADOW }}>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-ink">Desglose de destrezas</span>
          <span className="text-[10px] font-bold tracking-wide text-ink-soft">Criterio JLPT {level}</span>
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
    </>
  )
}
