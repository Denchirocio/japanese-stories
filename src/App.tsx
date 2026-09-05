import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { BottomNav } from './components/BottomNav'
import { useDailyEntry } from './hooks/useDailyEntry'
import type { Entry } from './lib/entries'
import { Camera } from './pages/Camera'
import { Cuaderno } from './pages/Cuaderno'
import { DetalleEntrada } from './pages/DetalleEntrada'
import { Historias } from './pages/Historias'
import { Resultado } from './pages/Resultado'
import { Splash } from './pages/Splash'

export type View = 'historias' | 'cuaderno'

function App() {
  const [view, setView] = useState<View>('historias')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
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
          celebrating && daily.entry ? (
            <Resultado entry={daily.entry} onRetry={() => setCameraOpen(true)} />
          ) : (
            <Historias daily={daily} onOpenCamera={() => setCameraOpen(true)} />
          )
        ) : (
          <Cuaderno daily={daily} onSelectEntry={setSelectedEntry} />
        )}
      </main>

      <BottomNav view={view} onChange={changeView} />
    </div>
  )
}

export default App
