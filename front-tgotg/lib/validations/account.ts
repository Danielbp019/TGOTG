import { z } from 'zod'

export const accountProfileSchema = z
  .object({
    email: z.email('Introduce un correo válido'),
    nick: z
      .string()
      .min(3, 'El nick debe tener al menos 3 caracteres')
      .max(24, 'El nick no puede superar 24 caracteres'),
    currentPassword: z.string().optional().or(z.literal('')),
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
  .refine((data) => !data.password || Boolean(data.currentPassword), {
    message: 'Introduce tu contraseña actual',
    path: ['currentPassword'],
  })

export type AccountProfileValues = z.infer<typeof accountProfileSchema>

export const createDeleteAccountSchema = (nick: string) =>
  z
    .object({
      confirmNick: z.string(),
      password: z
        .string()
        .min(8, 'Introduce tu contraseña actual para confirmar'),
    })
    .refine((data) => data.confirmNick === nick, {
      message: 'El nick no coincide. Escríbelo tal y como aparece.',
      path: ['confirmNick'],
    })

export type DeleteAccountValues = z.infer<
  ReturnType<typeof createDeleteAccountSchema>
>
