import type { LucideIcon } from "lucide-react"

export type ResourceKey = "gold" | "wood" | "stone" | "iron" | "food"

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
