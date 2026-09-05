import { SpeakerButton } from '../components/SpeakerButton'
import { CameraIcon, CheckIcon, PencilIcon, RefreshIcon } from '../components/icons'
import type { DailyEntryState } from '../hooks/useDailyEntry'
import { jpWeekdayLabel, shortDate } from '../lib/date'

const CARD_SHADOW = '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)'
const CTA_SHADOW = '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)'

function JpWord({ word, furigana, accentClass }: { word: string; furigana?: string; accentClass: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      {furigana && <span className={`font-sans-jp text-xs font-medium tracking-wide ${accentClass}`}>{furigana}</span>}
      <span className="font-sans-jp text-lg font-semibold text-ink">{word}</span>
    </div>
  )
}

export function Historias({ daily, onOpenCamera }: { daily: DailyEntryState; onOpenCamera: () => void }) {
  const { prompt, entry, refreshUsed, refreshPrompt } = daily

  const criteria = [
    { text: 'Escribir un texto completo de al menos 6 a 8 oraciones (no 3 frases sueltas)', done: !!entry },
    { text: 'Usar los sustantivos, verbos y adjetivos pedidos', done: !!entry?.usedRequiredElements },
    { text: 'Trazar a mano en libreta o papel con tinta/lápiz', done: !!entry },
  ]
  const allDone = criteria.every((c) => c.done)

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-12 pt-6">
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-2xl font-medium text-ink">Desafío de Hoy</h1>
        <p className="text-sm text-ink-soft">
          {shortDate(daily.today)} <span className="font-sans-jp text-sm">{jpWeekdayLabel(daily.today)}</span>
        </p>
      </div>

      <div className="space-y-6 rounded-xl bg-paper-elevated p-6" style={{ boxShadow: CARD_SHADOW }}>
        {/* Tema del día */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-indigo" />
              <span className="text-[10px] font-bold tracking-[0.1em] text-indigo uppercase">Tema del día</span>
            </div>
            {!entry && (
              <button
                type="button"
                onClick={refreshPrompt}
                disabled={refreshUsed}
                className={`flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase transition ${
                  refreshUsed ? 'cursor-not-allowed text-ink-faint' : 'text-indigo hover:text-indigo-strong active:scale-95'
                }`}
              >
                <RefreshIcon className="size-3" />
                {refreshUsed ? 'Ya usaste tu refresh' : 'Refrescar'}
              </button>
            )}
          </div>
          <p className="font-sans-jp text-[26px] font-semibold leading-[1.3] text-ink">{prompt.themeTitle}</p>
          <p className="font-sans-jp text-base text-ink-soft">{prompt.grammar}</p>
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
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide text-ink uppercase">Criterios de éxito</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                allDone ? 'bg-matcha-soft text-matcha' : 'bg-paper-sunken-strong text-ink-soft'
              }`}
            >
              {allDone ? 'Completo' : 'Incompleto'}
            </span>
          </div>
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
                  <JpWord word={word.word} furigana={word.furigana} accentClass="text-indigo" />
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
            <span className="text-xs font-bold tracking-wide text-ink uppercase">Verbos requeridos</span>
            <div className="grid grid-cols-2 gap-2">
              {prompt.verbs.map((verb) => (
                <div key={verb.word} className="rounded-lg border-l-2 border-indigo bg-paper-sunken p-2.5">
                  <div className="flex items-start justify-between gap-1">
                    <JpWord word={verb.word} furigana={verb.furigana} accentClass="text-indigo" />
                    <SpeakerButton text={verb.word} className="mt-0.5" />
                  </div>
                  <p className="text-[13px] text-ink-soft">{verb.translation}</p>
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
                    <JpWord word={word.word} furigana={word.furigana} accentClass="text-matcha" />
                    <SpeakerButton text={word.word} className="mt-0.5" />
                  </div>
                  <p className="text-[13px] text-ink-soft">{word.translation}</p>
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
          {entry ? 'Rehacer el envío de hoy' : 'Subir historia'}
        </button>
      </div>
    </div>
  )
}
