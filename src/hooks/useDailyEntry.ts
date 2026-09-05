import { useEffect, useState } from 'react'
import { promptForDate, todayId } from '../lib/date'
import { getEntry, type Entry } from '../lib/entries'
import { hasUsedPromptRefresh, markPromptRefreshUsed } from '../lib/promptRefresh'
import { activeStreakCount, getStreak, type Streak } from '../lib/streak'

export function useDailyEntry() {
  const today = todayId()
  const [refreshUsed, setRefreshUsed] = useState(() => hasUsedPromptRefresh(today))
  const prompt = promptForDate(today, refreshUsed ? 1 : 0)
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState<Streak>(() => getStreak())

  function refreshPrompt() {
    if (refreshUsed) return
    markPromptRefreshUsed(today)
    setRefreshUsed(true)
  }

  useEffect(() => {
    let cancelled = false
    getEntry(today).then((e) => {
      if (cancelled) return
      setEntry(e ?? null)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [today])

  return {
    today,
    prompt,
    entry,
    setEntry,
    loading,
    streak,
    setStreak,
    activeStreak: activeStreakCount(streak, today),
    refreshUsed,
    refreshPrompt,
  }
}

export type DailyEntryState = ReturnType<typeof useDailyEntry>
