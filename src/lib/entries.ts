import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { DailyPrompt } from '../data/prompts'
import { backupEntry, fetchMissingEntries } from './backup'
import type { CorrectionResult } from './correctWriting'

export interface Entry extends CorrectionResult {
  id: string
  date: string
  attempt: 1 | 2
  // undefined en entradas guardadas antes del desafío semanal -> 'daily'.
  type?: 'daily' | 'weekly'
  prompt: DailyPrompt
  photoBlob: Blob
  createdAt: number
}

interface JapaneseStoriesDB extends DBSchema {
  entries: {
    key: string
    value: Entry
    indexes: { 'by-date': string }
  }
}

const DB_VERSION = 2

let dbPromise: Promise<IDBPDatabase<JapaneseStoriesDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<JapaneseStoriesDB>('japanese-stories', DB_VERSION, {
      async upgrade(db, oldVersion, _newVersion, transaction) {
        if (oldVersion < 2) {
          // v1 guardaba una sola entrada por día (keyPath 'date'). Se migra a
          // keyPath 'id' (`${date}-${attempt}`) para permitir hasta 2 envíos
          // por día, conservando lo que ya estaba guardado como intento 1.
          let oldEntries: (Omit<Entry, 'id' | 'attempt'> & { id?: string; attempt?: number })[] = []
          if (db.objectStoreNames.contains('entries')) {
            oldEntries = await transaction.objectStore('entries').getAll()
            db.deleteObjectStore('entries')
          }
          const store = db.createObjectStore('entries', { keyPath: 'id' })
          store.createIndex('by-date', 'date')
          for (const old of oldEntries) {
            const migrated: Entry = { ...old, id: `${old.date}-1`, attempt: 1 } as Entry
            await store.put(migrated)
          }
        }
      },
    })
  }
  return dbPromise
}

export async function saveEntry(
  dateId: string,
  attempt: 1 | 2,
  type: 'daily' | 'weekly',
  prompt: DailyPrompt,
  photoBlob: Blob,
  correction: CorrectionResult,
): Promise<Entry> {
  const id = type === 'weekly' ? `${dateId}-weekly` : `${dateId}-${attempt}`
  const entry: Entry = { id, date: dateId, attempt, type, prompt, photoBlob, ...correction, createdAt: Date.now() }
  const db = await getDb()
  await db.put('entries', entry)
  backupEntry(entry).catch((err) => console.error('No se pudo respaldar la entrada en la nube', err))
  return entry
}

export async function getEntriesForDate(dateId: string): Promise<Entry[]> {
  const db = await getDb()
  const entries = await db.getAllFromIndex('entries', 'by-date', dateId)
  return entries.sort((a, b) => a.attempt - b.attempt)
}

export async function listEntries(): Promise<Entry[]> {
  const db = await getDb()
  const all = await db.getAll('entries')
  return all.sort((a, b) => (a.date === b.date ? a.attempt - b.attempt : a.date < b.date ? 1 : -1))
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
      const existingIds = new Set(await db.getAllKeys('entries'))
      const missing = await fetchMissingEntries(existingIds)
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
  return db.getAllKeysFromIndex('entries', 'by-date')
}

// Solo fechas de entradas del desafío diario (no del semanal) — para la
// racha, que es sobre el hábito diario.
export async function listDailyEntryDates(): Promise<string[]> {
  const db = await getDb()
  const all = await db.getAllFromIndex('entries', 'by-date')
  return all.filter((e) => (e.type ?? 'daily') === 'daily').map((e) => e.date)
}
