import { isYesterday } from './date'

export interface Streak {
  count: number
  lastEntryDate: string | null
}

const STORAGE_KEY = 'streak'

export function getStreak(): Streak {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { count: 0, lastEntryDate: null }
    return JSON.parse(raw) as Streak
  } catch {
    return { count: 0, lastEntryDate: null }
  }
}

// Se llama una vez por entrada guardada. Si ya escribiste hoy, no vuelve a sumar.
export function bumpStreakForToday(today: string): Streak {
  const current = getStreak()

  if (current.lastEntryDate === today) {
    return current
  }

  const nextCount = current.lastEntryDate && isYesterday(current.lastEntryDate, today) ? current.count + 1 : 1

  const next: Streak = { count: nextCount, lastEntryDate: today }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

// Streak "activo" para mostrar en pantalla: si el último día registrado no es
// hoy ni ayer, se muestra en 0 aunque el dato guardado no se borre.
export function activeStreakCount(streak: Streak, today: string): number {
  if (!streak.lastEntryDate) return 0
  if (streak.lastEntryDate === today) return streak.count
  if (isYesterday(streak.lastEntryDate, today)) return streak.count
  return 0
}

// Reconstruye el streak a partir de las fechas de entradas reales (por
// ejemplo, después de restaurar un backup en un dispositivo nuevo).
export function recomputeStreakFromDates(dates: string[]): Streak {
  const sorted = [...new Set(dates)].sort()

  if (sorted.length === 0) {
    const empty: Streak = { count: 0, lastEntryDate: null }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty))
    return empty
  }

  let count = 1
  for (let i = sorted.length - 1; i > 0; i--) {
    if (isYesterday(sorted[i - 1], sorted[i])) {
      count++
    } else {
      break
    }
  }

  const next: Streak = { count, lastEntryDate: sorted[sorted.length - 1] }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
