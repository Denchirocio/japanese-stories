import { SpeakerIcon } from './icons'
import { speakJapanese } from '../lib/speak'

export function SpeakerButton({ text, className }: { text: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        speakJapanese(text)
      }}
      aria-label={`Escuchar ${text}`}
      className={`flex shrink-0 items-center justify-center rounded-full p-2 text-ink-faint transition hover:bg-paper-sunken hover:text-indigo active:bg-paper-sunken-strong ${className ?? ''}`}
    >
      <SpeakerIcon className="size-5" />
    </button>
  )
}
