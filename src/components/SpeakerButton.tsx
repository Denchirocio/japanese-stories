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
      className={`shrink-0 text-ink-faint transition hover:text-indigo ${className ?? ''}`}
    >
      <SpeakerIcon className="size-4" />
    </button>
  )
}
