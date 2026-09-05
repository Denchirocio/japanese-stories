import { useEffect, useState } from 'react'
import { promptForDate, todayId } from '../lib/date'
import { getEntriesForDate, listEntryDates, restoreMissingEntries, type Entry } from '../lib/entries'
import { hasUsedPromptRefresh, markPromptRefreshUsed } from '../lib/promptRefresh'
import { activeStreakCount, getStreak, recomputeStreakFromDates, type Streak } from '../lib/streak'

const MAX_ATTEMPTS_PER_DAY = 2

export function useDailyEntry() {
  const today = todayId()
  const [refreshUsed, setRefreshUsed] = useState(() => hasUsedPromptRefresh(today))
  const prompt = promptForDate(today, refreshUsed ? 1 : 0)
  const [entriesToday, setEntriesToday] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState<Streak>(() => getStreak())

  function refreshPrompt() {
    if (refreshUsed) return
    markPromptRefreshUsed(today)
    setRefreshUsed(true)
  }

  function addEntryToday(entry: Entry) {
    setEntriesToday((prev) => [...prev.filter((e) => e.attempt !== entry.attempt), entry].sort((a, b) => a.attempt - b.attempt))
  }

  useEffect(() => {
    let cancelled = false
    getEntriesForDate(today).then((entries) => {
      if (cancelled) return
      setEntriesToday(entries)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [today])

  useEffect(() => {
    let cancelled = false
    restoreMissingEntries()
      .then(async (restored) => {
        if (cancelled || restored.length === 0) return
        const restoredToday = restored.filter((e) => e.date === today)
        if (restoredToday.length > 0) {
          setEntriesToday((prev) =>
            [...prev.filter((e) => !restoredToday.some((r) => r.attempt === e.attempt)), ...restoredToday].sort(
              (a, b) => a.attempt - b.attempt,
            ),
          )
        }
        const allDates = await listEntryDates()
        if (!cancelled) setStreak(recomputeStreakFromDates(allDates))
      })
      .catch((err) => console.error('No se pudo restaurar el backup', err))
    return () => {
      cancelled = true
    }
  }, [today])

  const attemptsUsed = entriesToday.length
  const canSubmit = attemptsUsed < MAX_ATTEMPTS_PER_DAY
  const nextAttempt = (attemptsUsed + 1) as 1 | 2
  const lastEntry = entriesToday.at(-1) ?? null

  return {
    today,
    prompt,
    entriesToday,
    addEntryToday,
    attemptsUsed,
    canSubmit,
    nextAttempt,
    lastEntry,
    loading,
    streak,
    setStreak,
    activeStreak: activeStreakCount(streak, today),
    refreshUsed,
    refreshPrompt,
  }
}

export type DailyEntryState = ReturnType<typeof useDailyEntry>
