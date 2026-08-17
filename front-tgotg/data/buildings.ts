import {
  Castle,
  Droplets,
  FlaskConical,
  Mountain,
  Pickaxe,
  Shield,
  Swords,
  TreePine,
  Wheat,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { BuildingType } from '@/types'

export type BuildingCategory =
  'Principal' | 'Defensa' | 'Recursos' | 'Militar' | 'Investigación'

export interface ConstructionBuilding {
  type: BuildingType
  name: string
  category: BuildingCategory
  icon: LucideIcon
  level: number
  description: string
}

export const MAX_BUILDING_LEVEL = 5

export const constructionBuildings: ConstructionBuilding[] = [
  {
    type: 'ayuntamiento',
    name: 'Ayuntamiento',
    category: 'Principal',
    icon: Castle,
    level: 3,
    description:
      'El corazón de la ciudad. Gobierna el asentamiento y desbloquea el resto de edificios.',
  },
  {
    type: 'muralla',
    name: 'Muralla',
    category: 'Defensa',
    icon: Shield,
    level: 2,
    description: 'Fortifica la ciudad y eleva su defensa frente a los asedios.',
  },
  {
    type: 'foso',
    name: 'Foso',
    category: 'Defensa',
    icon: Droplets,
    level: 1,
    description:
      'Dificulta los ataques enemigos y debilita a quienes intenten asaltar tus muros.',
  },
  {
    type: 'granja',
    name: 'Granja',
    category: 'Recursos',
    icon: Wheat,
    level: 2,
    description:
      'Produce comida para alimentar a tu población y sostener a tu ejército.',
  },
  {
    type: 'minaHierro',
    name: 'Mina de hierro',
    category: 'Recursos',
    icon: Pickaxe,
    level: 2,
    description:
      'Extrae hierro, el material imprescindible para entrenar y equipar a tus tropas.',
  },
  {
    type: 'minaPiedra',
    name: 'Mina de piedra',
    category: 'Recursos',
    icon: Mountain,
    level: 1,
    description: 'Extrae piedra, clave para las construcciones y las defensas.',
  },
  {
    type: 'aserradero',
    name: 'Aserradero',
    category: 'Recursos',
    icon: TreePine,
    level: 2,
    description: 'Produce madera, la base de casi toda construcción.',
  },
  {
    type: 'cuartel',
    name: 'Cuartel del ejército',
    category: 'Militar',
    icon: Swords,
    level: 1,
    description:
      'Entrena y aloja a tus tropas, tu garantía para defender y atacar.',
  },
  {
    type: 'laboratorio',
    name: 'Laboratorio',
    category: 'Investigación',
    icon: FlaskConical,
    level: 0,
    description:
      'El centro de la investigación, donde se desbloquean nuevas tecnologías y mejoras.',
  },
]
