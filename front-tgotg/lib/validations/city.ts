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
  worldSize: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }),
  buildings: z.array(cityBuildingSchema),
})

export type CityPayloadValues = z.infer<typeof cityPayloadSchema>
