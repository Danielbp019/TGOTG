const BLESSING_CHANGED_EVENT = 'tgotg:blessing-changed'

export function notifyBlessingChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(BLESSING_CHANGED_EVENT))
}

export function subscribeToBlessingChanges(callback: () => void) {
  window.addEventListener(BLESSING_CHANGED_EVENT, callback)
  return () => window.removeEventListener(BLESSING_CHANGED_EVENT, callback)
}
