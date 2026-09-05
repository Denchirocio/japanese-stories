import type { DailyPrompt } from '../data/prompts'
import type { Entry } from '../lib/entries'

interface RequirableWord {
  word: string
  reading?: string
}

function allRequirableWords(prompt: DailyPrompt): RequirableWord[] {
  return [
    ...prompt.vocab.map((w) => ({ word: w.word, reading: w.romaji })),
    ...prompt.verbs.map((w) => ({ word: w.word, reading: w.furigana })),
    ...prompt.adjectives.map((w) => ({ word: w.word, reading: w.romaji })),
    ...prompt.places.map((w) => ({ word: w.word, reading: w.romaji })),
  ]
}

export function MasteredVocab({ entry }: { entry: Entry }) {
  const pool = allRequirableWords(entry.prompt)

  // Entradas de antes de este campo no tienen usedWords calculado por la IA:
  // se aproxima gratis buscando si la palabra (forma de diccionario) aparece
  // tal cual en el texto corregido. No detecta verbos/adjetivos conjugados
  // de forma distinta a como están escritos en el prompt.
  const usedWords = entry.usedWords ?? pool.map((w) => w.word).filter((word) => entry.corrected.includes(word))
  if (usedWords.length === 0) return null

  const matched = pool.filter((w) => usedWords.includes(w.word))
  if (matched.length === 0) return null

  return (
    <div className="rounded-lg bg-paper-sunken/70 p-3">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-wide text-ink-faint uppercase">Vocabulario dominado</span>
        <span className="text-[10px] font-medium tracking-wide text-indigo">
          {matched.length} término{matched.length === 1 ? '' : 's'} usado{matched.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {matched.map((w) => (
          <span
            key={w.word}
            className="inline-flex items-baseline gap-1 rounded-full bg-paper-elevated px-2.5 py-1.5 shadow-sm"
          >
            <span className="font-sans-jp text-[13px] font-semibold text-ink">{w.word}</span>
            {w.reading && <span className="text-[11px] text-ink-soft">({w.reading})</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
