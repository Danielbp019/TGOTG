import type { CityProduction, CityStatus, ArmyStatus } from "@/types"

export const cityProduction: CityProduction[] = [
  { resource: "gold", label: "Oro", perHour: 120 },
  { resource: "wood", label: "Madera", perHour: 85 },
  { resource: "stone", label: "Piedra", perHour: 60 },
  { resource: "iron", label: "Hierro", perHour: 35 },
  { resource: "food", label: "Comida", perHour: 95 },
]

export const cityStatus: CityStatus = {
  population: 340,
  happiness: 72,
  defense: 58,
}

export const armyStatus: ArmyStatus = {
  stationedTroops: 124,
  defensePower: 310,
  overall: "Preparado",
}
