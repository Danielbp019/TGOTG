import { z } from 'zod'

export const createClanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre del clan es obligatorio')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  acronym: z
    .string()
    .trim()
    .min(3, 'Las siglas deben tener al menos 3 caracteres')
    .max(5, 'Las siglas no pueden tener más de 5 caracteres')
    .regex(/^[A-Za-z]+$/, 'Las siglas solo pueden contener letras'),
})

export type CreateClanValues = z.infer<typeof createClanSchema>

export const joinClanSchema = z.object({
  message: z
    .string()
    .trim()
    .max(500, 'El mensaje no puede tener más de 500 caracteres')
    .optional(),
})

export type JoinClanValues = z.infer<typeof joinClanSchema>

export const clanBulletinSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'El título es obligatorio')
    .max(100, 'El título no puede tener más de 100 caracteres'),
  content: z
    .string()
    .trim()
    .min(1, 'El contenido es obligatorio')
    .max(2000, 'El contenido no puede tener más de 2000 caracteres'),
})

export type ClanBulletinValues = z.infer<typeof clanBulletinSchema>

export const clanMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'El mensaje no puede estar vacío')
    .max(1000, 'El mensaje no puede tener más de 1000 caracteres'),
})

export type ClanMessageValues = z.infer<typeof clanMessageSchema>

export const transferResourcesSchema = z.object({
  gold: z.number().min(0).optional(),
  wood: z.number().min(0).optional(),
  stone: z.number().min(0).optional(),
  iron: z.number().min(0).optional(),
  food: z.number().min(0).optional(),
})

export type TransferResourcesValues = z.infer<typeof transferResourcesSchema>
