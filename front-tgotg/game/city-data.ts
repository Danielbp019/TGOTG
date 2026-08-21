import type { CityBuilding } from '@/lib/api'

let currentBuildings: CityBuilding[] = []
let currentWorldSize: { width: number; height: number } = { width: 2048, height: 1024 }

export function setCityBuildings(buildings: CityBuilding[]) {
  currentBuildings = buildings
}

export function getCityBuildings(): CityBuilding[] {
  return currentBuildings
}

export function setWorldSize(size: { width: number; height: number }) {
  currentWorldSize = size
}

export function getWorldSize(): { width: number; height: number } {
  return currentWorldSize
}