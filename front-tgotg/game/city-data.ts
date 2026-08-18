import type { CityBuilding } from '@/lib/api'

let currentBuildings: CityBuilding[] = []

export function setCityBuildings(buildings: CityBuilding[]) {
  currentBuildings = buildings
}

export function getCityBuildings(): CityBuilding[] {
  return currentBuildings
}