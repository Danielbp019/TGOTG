import { fetchServerTime } from '@/lib/api'

const STORAGE_KEY = 'tgotg:server-offset'

interface StoredOffset {
  offsetMs: number
  capturedAt: number
}

let cachedOffset: number | null = null

let pendingPromise: Promise<number> | null = null

function readStoredOffset(): StoredOffset | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<StoredOffset>
    if (typeof parsed.offsetMs !== 'number' || typeof parsed.capturedAt !== 'number') {
      return null
    }

    return { offsetMs: parsed.offsetMs, capturedAt: parsed.capturedAt }
  } catch {
    return null
  }
}

function writeStoredOffset(offset: StoredOffset) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(offset))
  } catch {
    // sessionStorage puede no estar disponible; el offset en memoria basta.
  }
}

/**
 * Offset (ms) a sumar a Date.now() para obtener la hora del servidor.
 * Se consulta /server-time una sola vez por sesión de pestaña; el offset
 * sobrevive a recargas vía sessionStorage. Las peticiones concurrentes
 * se deduplican.
 */
export function getServerOffsetMs(): Promise<number> {
  if (cachedOffset !== null) return Promise.resolve(cachedOffset)

  const stored = readStoredOffset()
  if (stored) {
    // El reloj local avanza igual que el del servidor: el offset sigue válido.
    cachedOffset = stored.offsetMs
    return Promise.resolve(cachedOffset)
  }

  if (pendingPromise) return pendingPromise

  pendingPromise = fetchServerTime()
    .then((serverTime) => {
      const offset = new Date(serverTime).getTime() - Date.now()
      cachedOffset = offset
      writeStoredOffset({ offsetMs: offset, capturedAt: Date.now() })
      return offset
    })
    .finally(() => {
      pendingPromise = null
    })

  return pendingPromise
}
