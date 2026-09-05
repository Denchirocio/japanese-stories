import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { DailyPrompt } from '../data/prompts'
import { backupEntry, fetchMissingEntries } from './backup'
import type { CorrectionResult } from './correctWriting'

export interface Entry extends CorrectionResult {
  date: string
  prompt: DailyPrompt
  photoBlob: Blob
  createdAt: number
}

interface JapaneseStoriesDB extends DBSchema {
  entries: {
    key: string
    value: Entry
  }
}

let dbPromise: Promise<IDBPDatabase<JapaneseStoriesDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<JapaneseStoriesDB>('japanese-stories', 1, {
      upgrade(db) {
        db.createObjectStore('entries', { keyPath: 'date' })
      },
    })
  }
  return dbPromise
}

export async function saveEntry(
  dateId: string,
  prompt: DailyPrompt,
  photoBlob: Blob,
  correction: CorrectionResult,
): Promise<Entry> {
  const entry: Entry = { date: dateId, prompt, photoBlob, ...correction, createdAt: Date.now() }
  const db = await getDb()
  await db.put('entries', entry)
  backupEntry(entry).catch((err) => console.error('No se pudo respaldar la entrada en la nube', err))
  return entry
}

export async function getEntry(dateId: string): Promise<Entry | undefined> {
  const db = await getDb()
  return db.get('entries', dateId)
}

export async function listEntries(): Promise<Entry[]> {
  const db = await getDb()
  const all = await db.getAll('entries')
  return all.sort((a, b) => (a.date < b.date ? 1 : -1))
}

let restorePromise: Promise<Entry[]> | null = null

// Trae del backup en la nube las entradas que falten localmente (celular
// nuevo, storage borrado, etc.) y las guarda en IndexedDB. Se cachea la
// promesa para que dos llamadas simultáneas (p. ej. React StrictMode
// invocando el efecto dos veces) no compitan escribiendo a la vez.
export function restoreMissingEntries(): Promise<Entry[]> {
  if (!restorePromise) {
    restorePromise = (async () => {
      const db = await getDb()
      const existingDates = new Set(await db.getAllKeys('entries'))
      const missing = await fetchMissingEntries(existingDates)
      for (const entry of missing) {
        await db.put('entries', entry)
      }
      return missing
    })()
  }
  return restorePromise
}

export async function listEntryDates(): Promise<string[]> {
  const db = await getDb()
  return db.getAllKeys('entries')
}
