import { z } from 'zod'

import { godBlessings } from '@/data/new-game'

export const worldConfigSchema = z.object({
  durationId: z.string().min(1, 'Selecciona la duración de la partida'),
  multiplierId: z.string().min(1, 'Selecciona el multiplicador de producción'),
})

export type WorldConfigValues = z.infer<typeof worldConfigSchema>

const blessingIds = godBlessings.map((blessing) => blessing.id) as [
  string,
  ...string[]
]

export const blessingSchema = z.object({
  blessingId: z.enum(blessingIds, 'Elige una bendición para tu civilización'),
})

export type BlessingValues = z.infer<typeof blessingSchema>