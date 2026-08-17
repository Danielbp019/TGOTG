import type { LucideIcon } from 'lucide-react'

export type ResourceKey = 'gold' | 'wood' | 'stone' | 'iron' | 'food'

export interface Resource {
  key: ResourceKey
  label: string
  amount: number
  perHour: number
  icon: LucideIcon
}

export interface MenuItem {
  label: string
  href: string
  icon: LucideIcon
  disabled?: boolean
}

export interface CityProduction {
  resource: ResourceKey
  label: string
  perHour: number
}

export interface CityStatus {
  population: number
  happiness: number
  defense: number
}

export interface ArmyStatus {
  stationedTroops: number
  defensePower: number
  overall: string
}

export type BuildingType =
  | 'ayuntamiento'
  | 'muralla'
  | 'foso'
  | 'granja'
  | 'minaHierro'
  | 'minaPiedra'
  | 'aserradero'
  | 'cuartel'
  | 'laboratorio'

export type PlotShape = 'rect' | 'diamond'

export interface ChatMessage {
  id: string
  autor: 'in' | 'out'
  texto: string
  fecha: string
}

export interface ChatConversation {
  id: string
  participante: {
    nombre: string
    iniciales: string
  }
  mensajes: ChatMessage[]
  noLeidos: number
}

export interface BuildingSlot {
  type: BuildingType
  name: string
  level: number
  /** Coordenadas del centro de la base (pivot bottom-center) en px del mundo (2048x1024) */
  x: number
  y: number
  /** Forma de la parcela: rect (alargada) o diamond (interior) */
  shape: PlotShape
  /** Ancho y alto de la huella de la parcela en px */
  width: number
  height: number
}
