import {
  Castle,
  Droplets,
  FlaskConical,
  Gem,
  Hammer,
  Leaf,
  Mountain,
  Pickaxe,
  Shield,
  Skull,
  Swords,
  TreePine,
  Users,
  Wheat,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const buildingIcons: Record<string, LucideIcon> = {
  ayuntamiento: Castle,
  muralla: Shield,
  foso: Droplets,
  granja: Wheat,
  minaHierro: Pickaxe,
  minaPiedra: Mountain,
  aserradero: TreePine,
  cuartel: Swords,
  laboratorio: FlaskConical,
}

export const buildingColors: Record<string, string> = {
  ayuntamiento: 'text-gold',
  muralla: 'text-stone',
  foso: 'text-azure',
  granja: 'text-forest',
  minaHierro: 'text-ink-soft',
  minaPiedra: 'text-stone',
  aserradero: 'text-wine',
  cuartel: 'text-wine',
  laboratorio: 'text-azure',
}

export const blessingIcons: Record<string, LucideIcon> = {
  'cosecha-abundante': Wheat,
  'forja-implacable': Hammer,
  'hijos-de-la-guerra': Swords,
  'muralla-eterna': Shield,
}

export const civilizationIcons: Record<string, LucideIcon> = {
  humanos: Users,
  elfos: Leaf,
  orcos: Skull,
  enanos: Gem,
}
