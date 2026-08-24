export type TimeFormat = '24h' | '12h'

const TIME_FORMAT_STORAGE_KEY = 'tgotg:time-format'
const TIME_FORMAT_CHANGED_EVENT = 'tgotg:time-format-changed'

export function getSavedTimeFormat(): TimeFormat {
  if (typeof window === 'undefined') return '24h'
  const value = window.localStorage.getItem(TIME_FORMAT_STORAGE_KEY)
  return value === '12h' ? '12h' : '24h'
}

export function saveTimeFormat(format: TimeFormat) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TIME_FORMAT_STORAGE_KEY, format)
  window.dispatchEvent(new CustomEvent(TIME_FORMAT_CHANGED_EVENT))
}

export function subscribeToTimeFormatChanges(callback: () => void) {
  window.addEventListener(TIME_FORMAT_CHANGED_EVENT, callback)
  return () => window.removeEventListener(TIME_FORMAT_CHANGED_EVENT, callback)
}
