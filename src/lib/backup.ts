import { getAuthContext } from '../firebase'
import type { Entry } from './entries'

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } }

function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null }
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } }
  if (typeof value === 'object') return { mapValue: { fields: toFirestoreFields(value as Record<string, unknown>) } }
  throw new Error(`Tipo de dato no soportado para el backup: ${typeof value}`)
}

function toFirestoreFields(obj: Record<string, unknown>): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) fields[key] = toFirestoreValue(value)
  }
  return fields
}

function fromFirestoreValue(value: FirestoreValue): unknown {
  if ('stringValue' in value) return value.stringValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return value.doubleValue
  if ('booleanValue' in value) return value.booleanValue
  if ('nullValue' in value) return null
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(fromFirestoreValue)
  if ('mapValue' in value) return fromFirestoreFields(value.mapValue.fields ?? {})
  return null
}

function fromFirestoreFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fields)) {
    obj[key] = fromFirestoreValue(value)
  }
  return obj
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function base64ToBlob(base64: string, type: string): Blob {
  const bytes = atob(base64)
  const array = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i)
  return new Blob([array], { type })
}

export async function backupEntry(entry: Entry): Promise<void> {
  const { uid, idToken } = await getAuthContext()
  const { photoBlob, ...rest } = entry
  const photoBase64 = await blobToBase64(photoBlob)
  const photoType = photoBlob.type || 'image/jpeg'
  const data = JSON.parse(JSON.stringify({ ...rest, photoBase64, photoType }))

  const res = await fetch(`${BASE_URL}/users/${uid}/entries/${entry.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  })
  if (!res.ok) {
    throw new Error(`No se pudo respaldar la entrada (${res.status}): ${await res.text()}`)
  }
}

export async function fetchMissingEntries(existingIds: Set<string>): Promise<Entry[]> {
  const { uid, idToken } = await getAuthContext()
  const entries: Entry[] = []
  let pageToken: string | undefined

  do {
    const url = new URL(`${BASE_URL}/users/${uid}/entries`)
    url.searchParams.set('pageSize', '300')
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } })
    if (!res.ok) {
      throw new Error(`No se pudo listar el backup (${res.status}): ${await res.text()}`)
    }
    const json = (await res.json()) as {
      documents?: { name: string; fields: Record<string, FirestoreValue> }[]
      nextPageToken?: string
    }

    for (const doc of json.documents ?? []) {
      const id = doc.name.split('/').pop() as string
      if (existingIds.has(id)) continue
      const data = fromFirestoreFields(doc.fields) as Omit<Entry, 'photoBlob'> & {
        photoBase64: string
        photoType: string
      }
      const { photoBase64, photoType, ...rest } = data
      // Compatibilidad con backups viejos (de antes de permitir 2 intentos
      // por día), guardados con el date como id y sin campos id/attempt.
      if (!rest.id) rest.id = id.includes('-') && /-[12]$/.test(id) ? id : `${rest.date}-1`
      if (!rest.attempt) rest.attempt = 1
      entries.push({ ...rest, photoBlob: base64ToBlob(photoBase64, photoType) } as Entry)
    }
    pageToken = json.nextPageToken
  } while (pageToken)

  return entries
}
