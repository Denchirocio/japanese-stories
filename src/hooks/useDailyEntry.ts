import { useEffect, useState } from 'react'
import { isSunday, promptForDate, todayId, weeklyChallengeForDate } from '../lib/date'
import { getEntriesForDate, listDailyEntryDates, restoreMissingEntries, type Entry } from '../lib/entries'
import { hasUsedPromptRefresh, markPromptRefreshUsed } from '../lib/promptRefresh'
import { activeStreakCount, getStreak, recomputeStreakFromDates, type Streak } from '../lib/streak'

const MAX_ATTEMPTS_PER_DAY = 2

function isDaily(entry: Entry): boolean {
  return (entry.type ?? 'daily') === 'daily'
}

export function useDailyEntry() {
  const today = todayId()
  const [refreshUsed, setRefreshUsed] = useState(() => hasUsedPromptRefresh(today))
  const prompt = promptForDate(today, refreshUsed ? 1 : 0)
  const [entriesToday, setEntriesToday] = useState<Entry[]>([])
  const [weeklyEntry, setWeeklyEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState<Streak>(() => getStreak())

  const todayIsSunday = isSunday(today)
  const weeklyPrompt = weeklyChallengeForDate(today)

  function refreshPrompt() {
    if (refreshUsed) return
    markPromptRefreshUsed(today)
    setRefreshUsed(true)
  }

  function addEntryToday(entry: Entry) {
    setEntriesToday((prev) => [...prev.filter((e) => e.attempt !== entry.attempt), entry].sort((a, b) => a.attempt - b.attempt))
  }

  function addWeeklyEntry(entry: Entry) {
    setWeeklyEntry(entry)
  }

  useEffect(() => {
    let cancelled = false
    getEntriesForDate(today).then((entries) => {
      if (cancelled) return
      setEntriesToday(entries.filter(isDaily))
      setWeeklyEntry(entries.find((e) => e.type === 'weekly') ?? null)
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
        const restoredDailyToday = restoredToday.filter(isDaily)
        const restoredWeeklyToday = restoredToday.find((e) => e.type === 'weekly')
        if (restoredDailyToday.length > 0) {
          setEntriesToday((prev) =>
            [...prev.filter((e) => !restoredDailyToday.some((r) => r.attempt === e.attempt)), ...restoredDailyToday].sort(
              (a, b) => a.attempt - b.attempt,
            ),
          )
        }
        if (restoredWeeklyToday) setWeeklyEntry(restoredWeeklyToday)
        const allDates = await listDailyEntryDates()
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
  const canSubmitWeekly = todayIsSunday && !weeklyEntry

  return {
    today,
    prompt,
    entriesToday,
    addEntryToday,
    attemptsUsed,
    canSubmit,
    nextAttempt,
    lastEntry,
    isSunday: todayIsSunday,
    weeklyPrompt,
    weeklyEntry,
    canSubmitWeekly,
    addWeeklyEntry,
    loading,
    streak,
    setStreak,
    activeStreak: activeStreakCount(streak, today),
    refreshUsed,
    refreshPrompt,
  }
}

export type DailyEntryState = ReturnType<typeof useDailyEntry>
