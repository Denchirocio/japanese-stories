import { useEffect, useState } from 'react'
import { promptForDate, todayId } from '../lib/date'
import { getEntry, type Entry } from '../lib/entries'
import { activeStreakCount, getStreak, type Streak } from '../lib/streak'

export function useDailyEntry() {
  const today = todayId()
  const prompt = promptForDate(today)
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState<Streak>(() => getStreak())

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
  }
}

export type DailyEntryState = ReturnType<typeof useDailyEntry>
