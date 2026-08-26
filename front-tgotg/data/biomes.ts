import { Castle, Droplets, Mountain, Pickaxe, TreePine, Wheat } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { resources } from '@/data/resources'

export interface BiomeMeta {
  label: string
  description: string
  icon: LucideIcon
  iconColor: string
  /** Color de relleno para representaciones del mapa (hex). */
  mapColor: string
}

const BIOME_META: Record<string, BiomeMeta> = {
  pradera: {
    label: 'Pradera',
    description: 'Llanuras fértiles ideales para granjas y pastos.',
    icon: Wheat,
    iconColor: 'text-forest',
    mapColor: '#7d8b3f',
  },
  bosque: {
    label: 'Bosque',
    description: 'Espesura interminable de robles y pinos.',
    icon: TreePine,
    iconColor: 'text-wine',
    mapColor: '#41552f',
  },
  'montaña': {
    label: 'Montaña',
    description: 'Picos rocosos ricos en canteras.',
    icon: Mountain,
    iconColor: 'text-stone',
    mapColor: '#8a8272',
  },
  colinaRica: {
    label: 'Colina rica',
    description: 'Vetas profundas de mineral bajo las colinas.',
    icon: Pickaxe,
    iconColor: 'text-ink-soft',
    mapColor: '#a3813a',
  },
  costa: {
    label: 'Costa',
    description: 'Costas prósperas que atraen comercio y tributos.',
    icon: Droplets,
    iconColor: 'text-azure',
    mapColor: '#5b7d8a',
  },
}

const FALLBACK_BIOME_META: BiomeMeta = {
  label: '',
  description: '',
  icon: Castle,
  iconColor: 'text-muted-foreground',
  mapColor: '#8a8272',
}

export function biomeMeta(key: string): BiomeMeta {
  return BIOME_META[key] ?? { ...FALLBACK_BIOME_META, label: key }
}

/** Bono de producción del bioma con el recurso en español, ej. «+10 % comida». */
export function biomeBonusLabel(bonusResource: string, bonusValue: number): string {
  const resource = resources[bonusResource as keyof typeof resources]
  const label = resource?.label ?? bonusResource
  const percent = Math.round(bonusValue * 100)
  return `+${percent} % ${label.toLowerCase()}`
}
