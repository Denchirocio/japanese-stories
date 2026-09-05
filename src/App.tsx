import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { BottomNav } from './components/BottomNav'
import { useDailyEntry } from './hooks/useDailyEntry'
import type { Entry } from './lib/entries'
import { Calendario } from './pages/Calendario'
import { Camera } from './pages/Camera'
import { Comparacion } from './pages/Comparacion'
import { Cuaderno } from './pages/Cuaderno'
import { DetalleEntrada } from './pages/DetalleEntrada'
import { Historias } from './pages/Historias'
import { Resultado } from './pages/Resultado'
import { Splash } from './pages/Splash'

export type View = 'historias' | 'calendario' | 'cuaderno'

function App() {
  const [view, setView] = useState<View>('historias')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [comparing, setComparing] = useState<{ original: Entry; correction: Entry } | null>(null)
  const daily = useDailyEntry()

  if (daily.loading) {
    return <Splash />
  }

  if (cameraOpen) {
    return (
      <Camera
        daily={daily}
        onClose={() => setCameraOpen(false)}
        onSaved={() => {
          setCameraOpen(false)
          setCelebrating(true)
        }}
      />
    )
  }

  if (comparing) {
    return <Comparacion original={comparing.original} correction={comparing.correction} onBack={() => setComparing(null)} />
  }

  if (selectedEntry) {
    return <DetalleEntrada entry={selectedEntry} onBack={() => setSelectedEntry(null)} />
  }

  function changeView(v: View) {
    setCelebrating(false)
    setView(v)
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="pt-16 pb-16">
        {view === 'historias' ? (
          celebrating && daily.lastEntry ? (
            <Resultado entry={daily.lastEntry} canRetry={daily.canSubmit} onRetry={() => setCameraOpen(true)} />
          ) : (
            <Historias daily={daily} onOpenCamera={() => setCameraOpen(true)} onGoToCuaderno={() => changeView('cuaderno')} />
          )
        ) : view === 'calendario' ? (
          <Calendario daily={daily} onSelectEntry={setSelectedEntry} onGoToHistorias={() => changeView('historias')} />
        ) : (
          <Cuaderno
            daily={daily}
            onSelectEntry={setSelectedEntry}
            onCompare={(original, correction) => setComparing({ original, correction })}
          />
        )}
      </main>

      <BottomNav view={view} onChange={changeView} />
    </div>
  )
}

export default App
