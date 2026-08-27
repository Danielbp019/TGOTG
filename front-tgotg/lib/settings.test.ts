import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getSavedTimeFormat,
  saveTimeFormat,
  subscribeToTimeFormatChanges,
} from './settings'

describe('getSavedTimeFormat', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('retorna 24h por defecto', () => {
    expect(getSavedTimeFormat()).toBe('24h')
  })

  it('retorna 12h si está guardado', () => {
    localStorage.setItem('tgotg:time-format', '12h')
    expect(getSavedTimeFormat()).toBe('12h')
  })

  it('retorna 24h para valor inválido', () => {
    localStorage.setItem('tgotg:time-format', 'invalido')
    expect(getSavedTimeFormat()).toBe('24h')
  })
})

describe('saveTimeFormat', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('guarda el formato en localStorage', () => {
    saveTimeFormat('12h')
    expect(localStorage.getItem('tgotg:time-format')).toBe('12h')
  })

  it('dispara el evento de cambio', () => {
    const callback = vi.fn()
    subscribeToTimeFormatChanges(callback)
    saveTimeFormat('12h')
    expect(callback).toHaveBeenCalledTimes(1)
  })
})

describe('subscribeToTimeFormatChanges', () => {
  it('devuelve una función para desuscribirse', () => {
    const callback = vi.fn()
    const unsubscribe = subscribeToTimeFormatChanges(callback)
    unsubscribe()
    saveTimeFormat('12h')
    expect(callback).not.toHaveBeenCalled()
  })
})
