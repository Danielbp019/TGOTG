const BLESSING_STORAGE_KEY = 'tgotg:selected-blessing'
const BLESSING_CHANGED_EVENT = 'tgotg:blessing-changed'

export function getSavedBlessing() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(BLESSING_STORAGE_KEY)
}

export function saveBlessing(id: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(BLESSING_STORAGE_KEY, id)
  window.dispatchEvent(new CustomEvent(BLESSING_CHANGED_EVENT))
}

export function subscribeToBlessingChanges(callback: () => void) {
  window.addEventListener(BLESSING_CHANGED_EVENT, callback)
  return () => window.removeEventListener(BLESSING_CHANGED_EVENT, callback)
}
