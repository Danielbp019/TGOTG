import { z } from 'zod'

export const cityBuildingSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  category: z.string(),
  level: z.number().int().min(0),
  damage: z.number().int().min(0).max(100),
  repairing: z.boolean(),
  repairPaid: z.boolean(),
  upgrading: z.boolean(),
  upgradeFinishesAt: z.string().nullable(),
  shape: z.enum(['rect', 'diamond']),
  x: z.number().int(),
  y: z.number().int(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})

export type CityBuildingValues = z.infer<typeof cityBuildingSchema>

export const cityPayloadSchema = z.object({
  name: z.string().nullable(),
  resources: z.record(z.string(), z.number()),
  perHour: z.record(z.string(), z.number()),
  population: z.number().int(),
  happiness: z.number().int(),
  defense: z.number().int(),
  stationedTroops: z.number().int(),
  defensePower: z.number().int(),
  protectionUntil: z.string().nullable(),
  worldSize: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  buildings: z.array(cityBuildingSchema),
})

export const createCitySchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(30, 'Máximo 30 caracteres'),
  region: z.string().min(1, 'Selecciona una región'),
  bioma: z.string().min(1, 'Elige un bioma para tu ciudad'),
})

export type CreateCityValues = z.infer<typeof createCitySchema>

export type CityPayloadValues = z.infer<typeof cityPayloadSchema>
