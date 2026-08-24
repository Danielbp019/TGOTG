import type { LucideIcon } from 'lucide-react'

export type ResourceKey = 'gold' | 'wood' | 'stone' | 'iron' | 'food'

export interface Resource {
  key: ResourceKey
  label: string
  amount: number
  perHour: number
  icon: LucideIcon
  iconColor: string
}

export interface MenuItem {
  label: string
  href: string
  icon: LucideIcon
  disabled?: boolean
  /** Solo visible para el rol de administrador del mundo */
  adminOnly?: boolean
  children?: MenuItem[]
  defaultOpen?: boolean
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
  /** Último mensaje, para la vista previa de la lista */
  ultimoMensaje?: ChatMessage
}
