const STORAGE_KEY = 'promptRefresh'

interface RefreshState {
  date: string
  used: boolean
}

function read(): RefreshState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { date: '', used: false }
    return JSON.parse(raw) as RefreshState
  } catch {
    return { date: '', used: false }
  }
}

// Cada día tiene 2 consignas posibles; este "refresh" cambia a la segunda,
// una sola vez por día.
export function hasUsedPromptRefresh(today: string): boolean {
  const state = read()
  return state.date === today && state.used
}

export function markPromptRefreshUsed(today: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, used: true }))
}
