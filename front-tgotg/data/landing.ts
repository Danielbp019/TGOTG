import {
  Castle,
  FlaskConical,
  Gem,
  Globe,
  MessagesSquare,
  Swords,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { resources } from '@/data/resources'
import { buildingIcons } from '@/data/icons'

export interface WorldTenet {
  mark: string
  title: string
  description: string
}

export const worldTenets: WorldTenet[] = [
  {
    mark: '01',
    title: 'Diriges ciudades',
    description: 'No unidades sueltas: gobiernas asentamientos enteros.',
  },
  {
    mark: '02',
    title: 'Decides la economía',
    description: 'Qué construir, qué investigar, qué producir.',
  },
  {
    mark: '03',
    title: 'Planeas la estrategia',
    description: 'Expansión, defensa, diplomacia y guerra.',
  },
  {
    mark: '04',
    title: 'Tu mundo perdura',
    description: 'Un mundo persistente donde cada decisión deja huella.',
  },
]

export interface LandingFeature {
  icon: LucideIcon
  accent: string
  title: string
  description: string
}

export const landingFeatures: LandingFeature[] = [
  {
    icon: Globe,
    accent: 'text-azure',
    title: 'Mundo persistente',
    description:
      'Evoluciona con cada jugador y cada decisión deja huella permanente en el reino.',
  },
  {
    icon: Castle,
    accent: 'text-gold',
    title: 'Ciudades vivas',
    description:
      'Vista isométrica y sistema de parcelas para construir cada asentamiento a tu manera.',
  },
  {
    icon: Swords,
    accent: 'text-wine',
    title: 'Ejército y combates',
    description:
      'Entrena tropas y libra combates automáticos: defiende tus muros o lanza el ataque.',
  },
  {
    icon: FlaskConical,
    accent: 'text-azure',
    title: 'Investigación',
    description:
      'Desbloquea tecnologías en el laboratorio para abrir nuevas posibilidades.',
  },
  {
    icon: Gem,
    accent: 'text-stone',
    title: 'Alianzas y PvP',
    description:
      'El reino es un tablero compartido: forja pactos o mide fuerzas en el mapa mundial.',
  },
  {
    icon: MessagesSquare,
    accent: 'text-gold',
    title: 'Mensajería',
    description:
      'Comunícate con otros dioses para forjar, o romper, pactos entre civilizaciones.',
  },
]

export type BuildingTagVariant =
  'principal' | 'defensa' | 'recursos' | 'militar' | 'investigacion'

export interface BuildingShowcase {
  name: string
  tag: string
  variant: BuildingTagVariant
  description: string
}

export const buildingShowcase: BuildingShowcase[] = [
  {
    name: 'Ayuntamiento',
    tag: 'Principal',
    variant: 'principal',
    description:
      'El corazón de la ciudad. Gobierna el asentamiento y desbloquea el resto de edificios.',
  },
  {
    name: 'Muralla',
    tag: 'Defensa',
    variant: 'defensa',
    description: 'Fortifica la ciudad y eleva su defensa frente a los asedios.',
  },
  {
    name: 'Foso',
    tag: 'Defensa',
    variant: 'defensa',
    description:
      'Dificulta los ataques enemigos y debilita a quienes intenten asaltar tus muros.',
  },
  {
    name: 'Mina de hierro',
    tag: 'Recursos',
    variant: 'recursos',
    description:
      'Extrae hierro, el material imprescindible para entrenar y equipar a tus tropas.',
  },
  {
    name: 'Mina de piedra',
    tag: 'Recursos',
    variant: 'recursos',
    description: 'Extrae piedra, clave para las construcciones y las defensas.',
  },
  {
    name: 'Aserradero',
    tag: 'Recursos',
    variant: 'recursos',
    description: 'Produce madera, la base de casi toda construcción.',
  },
  {
    name: 'Granja',
    tag: 'Recursos',
    variant: 'recursos',
    description:
      'Produce comida para alimentar a tu población y sostener a tu ejército.',
  },
  {
    name: 'Cuartel del ejército',
    tag: 'Militar',
    variant: 'militar',
    description:
      'Entrena y aloja a tus tropas, tu garantía para defender y atacar.',
  },
  {
    name: 'Laboratorio',
    tag: 'Investigación',
    variant: 'investigacion',
    description:
      'El centro de la investigación, donde se desbloquean nuevas tecnologías y mejoras.',
  },
]

export interface TechStack {
  name: string
  items: string[]
}

export const techStacks: TechStack[] = [
  {
    name: 'Frontend — front-tgotg/',
    items: [
      'React',
      'TypeScript',
      'Next.js',
      'Tailwind CSS',
      'shadcn/ui',
      'Phaser 4',
    ],
  },
  {
    name: 'Backend — back-tgotg/',
    items: ['Laravel', 'PHP 8.x', 'Eloquent ORM', 'MariaDB', 'Sanctum'],
  },
]

export interface HeroStat {
  value: string
  label: string
}

export const heroStats: HeroStat[] = [
  {
    value: String(Object.keys(resources).length),
    label: 'Recursos que gestionar',
  },
  {
    value: String(Object.keys(buildingIcons).length),
    label: 'Edificios por levantar',
  },
  { value: '∞', label: 'Un mundo que perdura' },
]
