import { z } from 'zod'

import { currentUser } from '@/data/user'

export const accountProfileSchema = z
  .object({
    email: z.email('Introduce un correo válido'),
    nick: z
      .string()
      .min(3, 'El nick debe tener al menos 3 caracteres')
      .max(24, 'El nick no puede superar 24 caracteres'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .optional()
      .or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type AccountProfileValues = z.infer<typeof accountProfileSchema>

export const deleteAccountSchema = z
  .object({
    confirmNick: z.string(),
  })
  .refine((data) => data.confirmNick === currentUser.name, {
    message: 'El nick no coincide. Escríbelo tal y como aparece.',
    path: ['confirmNick'],
  })

export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>
