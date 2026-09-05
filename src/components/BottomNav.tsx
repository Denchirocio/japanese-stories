import { CalendarIcon, CuadernoNavIcon, HoyNavIcon } from './icons'
import type { View } from '../App'

const TABS: { view: View; label: string; Icon: typeof HoyNavIcon }[] = [
  { view: 'historias', label: 'Historias', Icon: HoyNavIcon },
  { view: 'calendario', label: 'Calendario', Icon: CalendarIcon },
  { view: 'cuaderno', label: 'Cuaderno', Icon: CuadernoNavIcon },
]

export function BottomNav({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-center border-t border-line/60 bg-paper/90 shadow-[0_-2px_12px_0_rgba(30,32,34,0.05)] backdrop-blur-md">
      <div className="flex h-16 w-full max-w-lg items-center justify-around px-4">
        {TABS.map(({ view: v, label, Icon }) => {
          const active = view === v
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`flex h-12 w-20 flex-col items-center justify-center gap-0.5 ${active ? 'text-ink' : 'text-ink-soft'}`}
            >
              <Icon className="size-[18px]" />
              <span className={`text-[10px] tracking-wide ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
