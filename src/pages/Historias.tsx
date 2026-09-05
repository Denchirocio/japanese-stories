import { SpeakerButton } from '../components/SpeakerButton'
import { CameraIcon, CheckIcon, PencilIcon } from '../components/icons'
import type { DailyEntryState } from '../hooks/useDailyEntry'

const CARD_SHADOW = '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)'
const CTA_SHADOW = '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)'

export function Historias({ daily, onOpenCamera }: { daily: DailyEntryState; onOpenCamera: () => void }) {
  const { prompt, entry } = daily

  const criteria = [
    { text: 'Escribir un texto completo de al menos 6 a 8 oraciones (no 3 frases sueltas)', done: !!entry },
    { text: 'Usar los sustantivos, verbos y adjetivos pedidos', done: !!entry?.usedRequiredElements },
    { text: 'Trazar a mano en libreta o papel con tinta/lápiz', done: !!entry },
  ]

  const verbHint =
    prompt.verbs.length > 0 ? Array.from(new Set(prompt.verbs.map((v) => v.form))).join(' / ') : null

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-12 pt-6">
      <h1 className="font-serif text-2xl font-medium text-ink">Desafío de Hoy</h1>

      <div className="space-y-6 rounded-xl bg-paper-elevated p-6" style={{ boxShadow: CARD_SHADOW }}>
        {/* Tema del día */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-indigo" />
            <span className="text-[10px] font-bold tracking-[0.1em] text-indigo uppercase">Tema del día</span>
          </div>
          <p className="font-serif-jp text-[26px] leading-[1.3] text-ink">{prompt.themeTitle}</p>
          <p className="text-base text-ink-soft italic">{prompt.grammar}</p>
        </div>

        {/* Misión analógica */}
        <div className="space-y-1 rounded-lg border border-line bg-paper-sunken p-3.5">
          <div className="flex items-center gap-1.5">
            <PencilIcon className="size-4 text-ink" />
            <span className="text-xs font-bold tracking-wide text-ink">Misión analógica</span>
          </div>
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Escribí a mano en tu libreta o papel un texto completo (al menos 6 a 8 oraciones), usando sustantivos,
            verbos y adjetivos variados. {prompt.topic}
          </p>
        </div>

        {/* Criterios de éxito */}
        <div className="space-y-2.5 rounded-xl bg-paper-sunken/60 p-3">
          <span className="text-xs font-bold tracking-wide text-ink uppercase">Criterios de éxito</span>
          <div className="space-y-2">
            {criteria.map((c) => (
              <div key={c.text} className="flex items-center gap-3 rounded-lg bg-paper-elevated p-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded bg-ink">
                  <CheckIcon className="size-2.5 text-paper" />
                </span>
                <p className={`flex-1 text-[13px] leading-tight ${c.done ? 'text-ink-soft line-through' : 'text-ink'}`}>
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Palabras obligatorias */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tracking-wide text-ink uppercase">Palabras obligatorias</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {prompt.vocab.map((word) => (
              <div key={word.word} className="rounded-lg bg-paper-sunken p-2.5">
                <div className="flex items-start justify-between gap-1">
                  <ruby className="font-serif-jp text-base leading-relaxed text-ink">
                    {word.word}
                    {word.furigana && <rt className="font-sans text-[9px] font-normal text-indigo">{word.furigana}</rt>}
                  </ruby>
                  <SpeakerButton text={word.word} className="mt-0.5" />
                </div>
                <p className="text-[13px] text-ink-soft">
                  {word.romaji} • {word.translation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Verbos requeridos */}
        {prompt.verbs.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wide text-ink uppercase">Verbos requeridos</span>
              {verbHint && <span className="text-[10px] font-medium tracking-wide text-indigo">Usa {verbHint}</span>}
            </div>
            <div className="space-y-2">
              {prompt.verbs.map((verb) => (
                <div
                  key={verb.word}
                  className="flex items-center justify-between rounded-lg border-l-2 border-indigo bg-paper-sunken py-2.5 pr-2.5 pl-3"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-baseline gap-x-1.5 leading-relaxed">
                      <ruby className="font-serif-jp text-base text-ink">
                        {verb.word}
                        <rt className="font-sans text-[9px] font-normal text-indigo">{verb.furigana}</rt>
                      </ruby>
                      <span className="text-[13px] text-ink-soft">• {verb.translation}</span>
                    </p>
                    <p className="text-[10px] font-bold tracking-wide text-ink-soft uppercase">{verb.form}</p>
                  </div>
                  <SpeakerButton text={verb.word} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adjetivos requeridos */}
        {prompt.adjectives.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold tracking-wide text-ink uppercase">Adjetivos requeridos</span>
            <div className="grid grid-cols-2 gap-2">
              {prompt.adjectives.map((word) => (
                <div key={word.word} className="rounded-lg border-l-2 border-matcha bg-paper-sunken p-2.5">
                  <div className="flex items-start justify-between gap-1">
                    <ruby className="font-serif-jp text-base leading-relaxed text-ink">
                      {word.word}
                      {word.furigana && <rt className="font-sans text-[9px] font-normal text-matcha">{word.furigana}</rt>}
                    </ruby>
                    <SpeakerButton text={word.word} className="mt-0.5" />
                  </div>
                  <p className="text-[13px] text-ink-soft">{word.translation}</p>
                  <p className="text-[10px] font-bold tracking-wide text-ink-soft uppercase">{word.type}形容詞</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenCamera}
          className={`flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 font-bold transition active:scale-[0.98] ${
            entry ? 'border border-line bg-paper-sunken text-ink hover:bg-paper-sunken-strong' : 'bg-ink text-paper hover:bg-indigo'
          }`}
          style={entry ? undefined : { boxShadow: CTA_SHADOW }}
        >
          <CameraIcon className="size-[18px]" />
          {entry ? 'Rehacer el envío de hoy' : 'Tomar foto'}
        </button>
      </div>
    </div>
  )
}
