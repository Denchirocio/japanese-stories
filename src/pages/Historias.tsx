import { SpeakerButton } from '../components/SpeakerButton'
import { CameraIcon, CheckIcon, LightbulbSparkleIcon, PencilIcon, RefreshIcon } from '../components/icons'
import type { DailyEntryState } from '../hooks/useDailyEntry'
import { jpWeekdayLabel, shortDate, tipForDate } from '../lib/date'

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

export function Historias({
  daily,
  onOpenCamera,
  onOpenWeeklyCamera,
  onGoToCuaderno,
}: {
  daily: DailyEntryState
  onOpenCamera: () => void
  onOpenWeeklyCamera: () => void
  onGoToCuaderno: () => void
}) {
  const { prompt, attemptsUsed, canSubmit, lastEntry, refreshUsed, refreshPrompt } = daily
  const hasEntry = attemptsUsed > 0

  const criteria = [
    { text: 'Escribir un texto completo de al menos 6 a 8 oraciones (no 3 frases sueltas)', done: hasEntry },
    { text: 'Usar los sustantivos, verbos, adjetivos y lugares pedidos', done: !!lastEntry?.usedRequiredElements },
    { text: 'Trazar a mano en libreta o papel con tinta/lápiz', done: hasEntry },
  ]
  const allDone = criteria.every((c) => c.done)

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-12 pt-6">
      {!canSubmit && (
        <button
          type="button"
          onClick={onGoToCuaderno}
          className="flex w-full items-center justify-between gap-3 rounded-xl bg-paper-sunken p-4 text-left"
        >
          <div>
            <p className="text-base font-semibold text-ink">Ya usaste tus 2 intentos de hoy</p>
            <p className="text-[13px] text-ink-soft">Podés ver tus dos versiones en el cuaderno.</p>
          </div>
          <span className="shrink-0 rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-paper shadow-sm hover:bg-indigo">
            Ver cuaderno
          </span>
        </button>
      )}

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
            {!hasEntry && (
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
          <p className="text-sm text-ink-faint">{prompt.themeTranslation}</p>
        </div>

        {/* Consigna de hoy */}
        <div className="space-y-1 rounded-lg border border-line bg-paper-sunken p-3.5">
          <div className="flex items-center gap-1.5">
            <PencilIcon className="size-4 text-ink" />
            <span className="text-xs font-bold tracking-wide text-ink">Consigna de hoy</span>
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

          {/* Consejo de caligrafía */}
          <div className="flex items-start gap-3 rounded-lg bg-[rgba(212,227,255,0.4)] p-3">
            <LightbulbSparkleIcon className="mt-0.5 size-5 shrink-0 text-indigo" />
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-[#001c3a]">Consejo de caligrafía (書き順)</span>
              <p className="text-[13px] leading-relaxed text-indigo-strong">{tipForDate(daily.today)}</p>
            </div>
          </div>
        </div>

        {/* Palabras */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tracking-wide text-ink uppercase">Palabras</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {prompt.vocab.map((word) => (
              <div key={word.word} className="rounded-lg border-l-2 border-indigo bg-paper-sunken p-2.5">
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

        {/* Verbos */}
        {prompt.verbs.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold tracking-wide text-ink uppercase">Verbos</span>
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

        {/* Adjetivos */}
        {prompt.adjectives.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold tracking-wide text-ink uppercase">Adjetivos</span>
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

        {/* Lugares */}
        {prompt.places.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold tracking-wide text-ink uppercase">Lugares</span>
            <div className="grid grid-cols-2 gap-2">
              {prompt.places.map((word) => (
                <div key={word.word} className="rounded-lg border-l-2 border-violet bg-paper-sunken p-2.5">
                  <div className="flex items-start justify-between gap-1">
                    <JpWord word={word.word} furigana={word.furigana} accentClass="text-violet" />
                    <SpeakerButton text={word.word} className="mt-0.5" />
                  </div>
                  <p className="text-[13px] text-ink-soft">{word.translation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gramática */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold tracking-wide text-ink uppercase">Gramática</span>
          <div className="rounded-lg border-l-2 border-indigo bg-paper-sunken p-3.5">
            <p className="font-sans-jp text-lg font-semibold text-ink">{prompt.grammar}</p>
            {(prompt.grammar.includes('・') || prompt.grammar.includes('／')) && (
              <p className="mt-1 text-[11px] text-ink-faint">Alcanza con usar al menos una de estas formas correctamente.</p>
            )}
          </div>
        </div>

        {/* Gramática opcional (bonus) */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tracking-wide text-ink uppercase">Gramática opcional</span>
            <span className="rounded-full bg-gold-soft px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-gold uppercase">Bonus</span>
          </div>
          <div className="rounded-lg border-l-2 border-gold bg-paper-sunken p-3.5">
            <p className="font-sans-jp text-lg font-semibold text-ink">{prompt.bonusGrammar}</p>
            <p className="mt-1 text-[11px] text-ink-faint">No es obligatoria — si la usás bien, sumás puntos extra en la corrección.</p>
          </div>
        </div>

        {canSubmit && (
          <button
            type="button"
            onClick={onOpenCamera}
            className={`flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 font-bold transition active:scale-[0.98] ${
              hasEntry ? 'border border-line bg-paper-sunken text-ink hover:bg-paper-sunken-strong' : 'bg-ink text-paper hover:bg-indigo'
            }`}
            style={hasEntry ? undefined : { boxShadow: CTA_SHADOW }}
          >
            <CameraIcon className="size-[18px]" />
            {hasEntry ? 'Rehacer el envío de hoy' : 'Subir historia'}
          </button>
        )}
      </div>

      {daily.isSunday && (
        <div className="space-y-4 rounded-xl border-2 border-gold bg-gold-soft p-6" style={{ boxShadow: CARD_SHADOW }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-gold" />
              <span className="text-[10px] font-bold tracking-[0.1em] text-gold uppercase">Desafío semanal</span>
            </div>
            <span className="rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-paper uppercase">
              Solo domingos
            </span>
          </div>

          <div className="space-y-1">
            <p className="font-sans-jp text-xl font-semibold leading-[1.3] text-ink">{daily.weeklyPrompt.themeTitle}</p>
            <p className="text-sm text-ink-faint">{daily.weeklyPrompt.themeTranslation}</p>
          </div>

          <div className="rounded-lg border border-gold/40 bg-paper-elevated p-3.5">
            <p className="text-[15px] leading-relaxed text-ink-soft">{daily.weeklyPrompt.topic}</p>
          </div>

          <div className="rounded-lg border-l-2 border-gold bg-paper-elevated p-3.5">
            <p className="font-sans-jp text-lg font-semibold text-ink">{daily.weeklyPrompt.grammar}</p>
          </div>

          {daily.canSubmitWeekly ? (
            <button
              type="button"
              onClick={onOpenWeeklyCamera}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gold px-4 py-3.5 font-bold text-paper transition hover:opacity-90 active:scale-[0.98]"
            >
              <CameraIcon className="size-[18px]" />
              Subir desafío semanal
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-paper-elevated p-3 text-sm text-ink-soft">
              <CheckIcon className="size-4 shrink-0 text-gold" />
              Ya completaste el desafío semanal de hoy.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
