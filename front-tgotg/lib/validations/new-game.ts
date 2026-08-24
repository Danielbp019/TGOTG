import { z } from 'zod'

export const worldConfigSchema = z.object({
  durationId: z.string().min(1, 'Selecciona la duración de la partida'),
  multiplierId: z.string().min(1, 'Selecciona el multiplicador de producción'),
})

export type WorldConfigValues = z.infer<typeof worldConfigSchema>

export const blessingSchema = z.object({
  blessingId: z.string().min(1, 'Elige una bendición para tu civilización'),
})

export type BlessingValues = z.infer<typeof blessingSchema>

export const civilizationSchema = z.object({
  civilizationId: z.string().min(1, 'Elige una civilización para tu pueblo'),
})

export type CivilizationValues = z.infer<typeof civilizationSchema>
