import { useCallback, useEffect, useState } from 'react'
import { FILES_BY_SLOT, type MediaSlot } from './slots'

const DB_NAME = 'pinnacle-media'
const DB_VERSION = 1
const STORE = 'assets'
const PHONE_KEY = 'pinnacle.phoneNumber'
const PHONE_SET_KEY = 'pinnacle.phoneNumberSet'

export type StoredAsset = {
  key: MediaSlot
  blob: Blob
  name: string
  type: string
  updatedAt: number
}

export type MediaResolution = {
  url: string | null
  source: 'upload' | 'file' | 'missing'
  name: string | null
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'key' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE, mode)
    const request = run(transaction.objectStore(STORE))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function saveAsset(key: MediaSlot, file: File): Promise<StoredAsset> {
  const asset: StoredAsset = {
    key,
    blob: file,
    name: file.name,
    type: file.type,
    updatedAt: Date.now(),
  }
  await tx('readwrite', (store) => store.put(asset))
  revokeObjectUrl(key)
  staticUrlCache.delete(key)
  return asset
}

export async function getStoredAsset(key: MediaSlot): Promise<StoredAsset | undefined> {
  return tx<StoredAsset | undefined>('readonly', (store) => store.get(key))
}

export async function deleteAsset(key: MediaSlot): Promise<void> {
  await tx('readwrite', (store) => store.delete(key))
  revokeObjectUrl(key)
}

export async function listStoredAssets(): Promise<StoredAsset[]> {
  return tx<StoredAsset[]>('readonly', (store) => store.getAll())
}

const objectUrlCache = new Map<MediaSlot, { url: string; updatedAt: number }>()

function revokeObjectUrl(key: MediaSlot) {
  const cached = objectUrlCache.get(key)
  if (cached) {
    URL.revokeObjectURL(cached.url)
    objectUrlCache.delete(key)
  }
}

const staticUrlCache = new Map<MediaSlot, string | null>()

async function findStaticUrl(key: MediaSlot): Promise<string | null> {
  if (staticUrlCache.has(key)) return staticUrlCache.get(key) ?? null
  const base = import.meta.env.BASE_URL || './'
  for (const file of FILES_BY_SLOT[key]) {
    const url = `${base}media/${encodeURIComponent(file)}`
    try {
      const response = await fetch(url, { method: 'HEAD', cache: 'no-store' })
      const type = response.headers.get('content-type') || ''
      if (response.ok && !type.includes('text/html')) {
        staticUrlCache.set(key, url)
        return url
      }
    } catch {
      // A missing file simply falls through to the next candidate.
    }
  }
  staticUrlCache.set(key, null)
  return null
}

export async function resolveMediaUrl(key: MediaSlot): Promise<MediaResolution> {
  const stored = await getStoredAsset(key)
  if (stored) {
    const cached = objectUrlCache.get(key)
    const url = cached && cached.updatedAt === stored.updatedAt ? cached.url : URL.createObjectURL(stored.blob)
    if (!cached || cached.updatedAt !== stored.updatedAt) {
      revokeObjectUrl(key)
      objectUrlCache.set(key, { url, updatedAt: stored.updatedAt })
    }
    return { url, source: 'upload', name: stored.name }
  }
  const staticUrl = await findStaticUrl(key)
  if (staticUrl) return { url: staticUrl, source: 'file', name: staticUrl.split('/').pop() ?? staticUrl }
  return { url: null, source: 'missing', name: null }
}

export async function loadAllMedia(): Promise<Record<MediaSlot, MediaResolution>> {
  const keys = Object.keys(FILES_BY_SLOT) as MediaSlot[]
  const entries = await Promise.all(keys.map(async (key) => [key, await resolveMediaUrl(key)] as const))
  return Object.fromEntries(entries) as Record<MediaSlot, MediaResolution>
}

export type AppConfig = { phoneNumber: string; phoneWasSet: boolean }

export async function loadConfig(): Promise<AppConfig> {
  let remoteNumber = ''
  try {
    const base = import.meta.env.BASE_URL || './'
    const response = await fetch(`${base}config.json`, { cache: 'no-store' })
    if (response.ok) {
      const data = (await response.json()) as { phoneNumber?: string }
      remoteNumber = typeof data.phoneNumber === 'string' ? data.phoneNumber.trim() : ''
    }
  } catch {
    // The local override below still applies when config.json is unavailable.
  }
  const localNumber = localStorage.getItem(PHONE_KEY)
  const phoneWasSet = localStorage.getItem(PHONE_SET_KEY) === '1' || Boolean(remoteNumber)
  return {
    phoneNumber: (localNumber ?? remoteNumber).trim(),
    phoneWasSet,
  }
}

export function savePhoneNumber(value: string) {
  const trimmed = value.trim()
  if (trimmed) {
    localStorage.setItem(PHONE_KEY, trimmed)
    localStorage.setItem(PHONE_SET_KEY, '1')
  } else {
    localStorage.removeItem(PHONE_KEY)
    localStorage.removeItem(PHONE_SET_KEY)
  }
}

export function useMediaLibrary() {
  const [media, setMedia] = useState<Record<MediaSlot, MediaResolution> | null>(null)
  const [config, setConfig] = useState<AppConfig>({ phoneNumber: '', phoneWasSet: false })

  const refreshMedia = useCallback(async () => {
    setMedia(await loadAllMedia())
  }, [])

  const refreshConfig = useCallback(async () => {
    setConfig(await loadConfig())
  }, [])

  useEffect(() => {
    void refreshMedia()
    void refreshConfig()
  }, [refreshMedia, refreshConfig])

  return { media, config, refreshMedia, refreshConfig }
}
