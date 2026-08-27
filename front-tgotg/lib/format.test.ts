import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime } from './format'

describe('formatDate', () => {
  it('formatea una fecha ISO correctamente', () => {
    const result = formatDate('2026-03-15T10:30:00Z')
    expect(result).toMatch(/\d{2}/)
    expect(result).toMatch(/mar/)
  })

  it('maneja fechas con hora', () => {
    const result = formatDate('2026-12-25T00:00:00Z')
    expect(result).toMatch(/dic/)
  })
})

describe('formatDateTime', () => {
  it('incluye hora en el formato', () => {
    const result = formatDateTime('2026-06-01T14:30:00Z')
    expect(result).toMatch(/\d{2}:\d{2}/)
    expect(result).toMatch(/jun/)
  })
})
