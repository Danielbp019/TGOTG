import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Introduce un correo válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    nick: z
      .string()
      .trim()
      .min(3, 'El nick debe tener al menos 3 caracteres')
      .max(24, 'El nick no puede superar 24 caracteres'),
    email: z.email('Introduce un correo válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type RegisterValues = z.infer<typeof registerSchema>