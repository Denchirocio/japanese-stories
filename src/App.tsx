import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { BottomNav } from './components/BottomNav'
import { useDailyEntry } from './hooks/useDailyEntry'
import { saveEntry, type Entry } from './lib/entries'
import { bumpStreakForToday } from './lib/streak'
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
  const [cameraMode, setCameraMode] = useState<'daily' | 'weekly' | null>(null)
  const [celebratingEntry, setCelebratingEntry] = useState<Entry | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [comparing, setComparing] = useState<{ original: Entry; correction: Entry } | null>(null)
  const daily = useDailyEntry()

  if (daily.loading) {
    return <Splash />
  }

  if (cameraMode === 'daily') {
    return (
      <Camera
        prompt={daily.prompt}
        onClose={() => setCameraMode(null)}
        onSubmit={async (photoBlob, correction) => {
          const savedEntry = await saveEntry(daily.today, daily.nextAttempt, 'daily', daily.prompt, photoBlob, correction)
          const newStreak = bumpStreakForToday(daily.today)
          daily.addEntryToday(savedEntry)
          daily.setStreak(newStreak)
          setCameraMode(null)
          setCelebratingEntry(savedEntry)
        }}
      />
    )
  }

  if (cameraMode === 'weekly') {
    return (
      <Camera
        prompt={daily.weeklyPrompt}
        onClose={() => setCameraMode(null)}
        onSubmit={async (photoBlob, correction) => {
          const savedEntry = await saveEntry(daily.today, 1, 'weekly', daily.weeklyPrompt, photoBlob, correction)
          daily.addWeeklyEntry(savedEntry)
          setCameraMode(null)
          setCelebratingEntry(savedEntry)
        }}
      />
    )
  }

  if (comparing) {
    return <Comparacion original={comparing.original} correction={comparing.correction} onBack={() => setComparing(null)} />
  }

  if (selectedEntry) {
    return (
      <DetalleEntrada
        entry={selectedEntry}
        onBack={() => setSelectedEntry(null)}
        onCompare={(original, correction) => setComparing({ original, correction })}
      />
    )
  }

  function changeView(v: View) {
    setCelebratingEntry(null)
    setView(v)
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="pt-16 pb-16">
        {view === 'historias' ? (
          celebratingEntry ? (
            <Resultado
              entry={celebratingEntry}
              canRetry={celebratingEntry.type === 'weekly' ? false : daily.canSubmit}
              onRetry={() => setCameraMode('daily')}
            />
          ) : (
            <Historias
              daily={daily}
              onOpenCamera={() => setCameraMode('daily')}
              onOpenWeeklyCamera={() => setCameraMode('weekly')}
              onGoToCuaderno={() => changeView('cuaderno')}
            />
          )
        ) : view === 'calendario' ? (
          <Calendario daily={daily} onSelectEntry={setSelectedEntry} onGoToHistorias={() => changeView('historias')} />
        ) : (
          <Cuaderno daily={daily} onSelectEntry={setSelectedEntry} />
        )}
      </main>

      <BottomNav view={view} onChange={changeView} />
    </div>
  )
}

export default App
