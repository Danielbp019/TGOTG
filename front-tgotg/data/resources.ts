import { Coins, TreePine, Mountain, Pickaxe, Wheat } from 'lucide-react'
import type { Resource, ResourceKey } from '@/types'

export const resources: Record<
  ResourceKey,
  Omit<Resource, 'amount' | 'perHour'>
> = {
  gold: {
    key: 'gold',
    label: 'Oro',
    icon: Coins,
    iconColor: 'text-gold',
  },
  wood: {
    key: 'wood',
    label: 'Madera',
    icon: TreePine,
    iconColor: 'text-wine',
  },
  stone: {
    key: 'stone',
    label: 'Piedra',
    icon: Mountain,
    iconColor: 'text-stone',
  },
  iron: {
    key: 'iron',
    label: 'Hierro',
    icon: Pickaxe,
    iconColor: 'text-azure',
  },
  food: {
    key: 'food',
    label: 'Comida',
    icon: Wheat,
    iconColor: 'text-forest',
  },
}
