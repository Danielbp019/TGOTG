import { Coins, TreePine, Mountain, Pickaxe, Wheat } from 'lucide-react'
import type { Resource, ResourceKey } from '@/types'

export const resources: Record<
  ResourceKey,
  Omit<Resource, 'amount' | 'perHour'>
> = {
  gold: { key: 'gold', label: 'Oro', icon: Coins },
  wood: { key: 'wood', label: 'Madera', icon: TreePine },
  stone: { key: 'stone', label: 'Piedra', icon: Mountain },
  iron: { key: 'iron', label: 'Hierro', icon: Pickaxe },
  food: { key: 'food', label: 'Comida', icon: Wheat },
}
