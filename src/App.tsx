import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { BottomNav } from './components/BottomNav'
import { useDailyEntry } from './hooks/useDailyEntry'
import { Camera } from './pages/Camera'
import { Cuaderno } from './pages/Cuaderno'
import { Historias } from './pages/Historias'
import { Resultado } from './pages/Resultado'

export type View = 'historias' | 'cuaderno'

function App() {
  const [view, setView] = useState<View>('historias')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const daily = useDailyEntry()

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

  function changeView(v: View) {
    setCelebrating(false)
    setView(v)
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="pt-16 pb-16">
        {daily.loading ? (
          <p className="p-6 text-center text-ink-soft">Cargando...</p>
        ) : view === 'historias' ? (
          celebrating && daily.entry ? (
            <Resultado entry={daily.entry} />
          ) : (
            <Historias daily={daily} onOpenCamera={() => setCameraOpen(true)} />
          )
        ) : (
          <Cuaderno daily={daily} />
        )}
      </main>

      <BottomNav view={view} onChange={changeView} />
    </div>
  )
}

export default App
