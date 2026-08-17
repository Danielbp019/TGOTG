import { Hammer, Shield, Swords, Wheat } from 'lucide-react'
import type { GameDuration, GameMultiplier, GodBlessing } from '@/types'

export const gameDurations: GameDuration[] = [
  {
    id: 'rapida',
    label: 'Rápida',
    days: 7,
    description:
      'Una contienda breve e intensa para los que buscan acción inmediata.',
  },
  {
    id: 'normal',
    label: 'Normal',
    days: 30,
    description: 'El equilibrio clásico entre paciencia y estrategia.',
  },
  {
    id: 'epica',
    label: 'Épica',
    days: 90,
    description: 'Una campaña larga donde cada decisión forja un legado.',
  },
]

export const gameMultipliers: GameMultiplier[] = [
  {
    id: 'x1',
    label: '1x',
    multiplier: 1,
    description: 'Producción y tiempos de construcción estándar.',
  },
  {
    id: 'x2',
    label: '2x',
    multiplier: 2,
    description: 'Producción y tiempos acelerados.',
  },
  {
    id: 'x3',
    label: '3x',
    multiplier: 3,
    description: 'Un ritmo frenético para no esperar demasiado.',
  },
]

export const godBlessings: GodBlessing[] = [
  {
    id: 'cosecha-abundante',
    name: 'Cosecha abundante',
    benefit: '+25 % producción de comida',
    description: 'Los campos de tu civilización rinden como nunca.',
    icon: Wheat,
  },
  {
    id: 'forja-implacable',
    name: 'Forja implacable',
    benefit: '+20 % madera, piedra y hierro',
    description: 'Los mineros y leñadores trabajan sin descanso.',
    icon: Hammer,
  },
  {
    id: 'hijos-de-la-guerra',
    name: 'Hijos de la guerra',
    benefit: '+15 % poder de ataque',
    description: 'Tus tropas luchan con el ardor de los dioses.',
    icon: Swords,
  },
  {
    id: 'muralla-eterna',
    name: 'Muralla eterna',
    benefit: '+20 % defensa de las ciudades',
    description: 'Tus murallas resisten los asedios más feroces.',
    icon: Shield,
  },
]
