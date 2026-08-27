import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { getFieldError } from './utils'

const testSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  age: z.number().min(18, 'Debe ser mayor de 18'),
})

type TestValues = z.infer<typeof testSchema>

describe('getFieldError', () => {
  it('retorna el mensaje de error para un campo válido', () => {
    const result = testSchema.safeParse({ name: '', email: 'bad', age: 10 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(getFieldError(result.error, 'name')).toBe('Nombre requerido')
      expect(getFieldError(result.error, 'email')).toBe('Email inválido')
      expect(getFieldError(result.error, 'age')).toBe('Debe ser mayor de 18')
    }
  })

  it('retorna undefined para un campo sin errores', () => {
    const result = testSchema.safeParse({
      name: 'Test',
      email: 'test@test.com',
      age: 25,
    })
    expect(result.success).toBe(true)
    if (!result.success) {
      expect(getFieldError(result.error, 'name')).toBeUndefined()
    }
  })

  it('retorna undefined para un campo que no existe en el schema', () => {
    const result = testSchema.safeParse({ name: '', email: 'bad', age: 10 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        getFieldError(result.error, 'nonexistent' as keyof TestValues)
      ).toBeUndefined()
    }
  })
})
