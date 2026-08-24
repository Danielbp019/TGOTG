import type { ResourceKey } from '@/types'

/**
 * Espejo mock del balance del juego (config/game_balance.php en el backend).
 * Sirve para mostrar costos y tiempos en la interfaz antes de servirlos por API.
 */

export interface BuildingCost {
  gold: number
  wood: number
  stone: number
  iron: number
  minutes: number
}

export const BALANCE = {
  production: {
    base: { gold: 0, wood: 35, stone: 30, iron: 15, food: 15 },
    perLevel: {
      granja: { food: 45 },
      aserradero: { wood: 25 },
      minaPiedra: { stone: 30 },
      minaHierro: { iron: 10 },
    },
  },
  gold: {
    taxPerPop: 0.2,
    taxPerTownHallLevel: 0.04,
  },
  population: {
    foodConsumptionPerPop: 0.15,
    baseCap: 250,
    capPerTownHallLevel: 250,
    growthRate: 0.01,
  },
  city: {
    baseCost: { gold: 40000, wood: 20000, stone: 15000, iron: 10000 },
    growthFactor: 2,
    baseHours: 12,
  },
  building: {
    materialGrowthFactor: 1.6,
    timeGrowthFactor: 1.5,
    hpPerLevel: 1000,
    hpFactorDefensive: 1.5,
  },
  combat: {
    luck: 0.1,
    baseDefense: 10,
    wallDefensePerLevel: 90,
    moatDefensePerLevel: 40,
    moatPenaltyPerLevel: 0.04,
    lootPercentage: 0.4,
  },
  damage: {
    wall: [0.2, 0.5],
    moat: [0.15, 0.4],
    collateral: [0.05, 0.2],
    collateralCap: 0.6,
  },
  repair: {
    goldPerPoint: 3,
    materialPerPoint: 1,
    paidPercentagePerHour: 10,
    autoPercentagePerHour: 1.5,
  },
  protection: {
    hours: 12,
  },
  terrain: {
    pradera: { food: 0.1 } as Partial<Record<ResourceKey, number>>,
    bosque: { wood: 0.1 },
    montaña: { stone: 0.1 },
    colinaRica: { iron: 0.1 },
    costa: { gold: 0.1 },
  },
}

export const TERRAIN_LABELS: Record<string, string> = {
  pradera: 'Pradera',
  bosque: 'Bosque',
  montaña: 'Montaña',
  colinaRica: 'Colina rica',
  costa: 'Costa',
}

/** Costos base (nivel 1) por edificio. Oro y materiales crecen ×1,6 por nivel. */
export const BUILDING_BASE_COSTS: Record<string, BuildingCost> = {
  ayuntamiento: { gold: 4000, wood: 800, stone: 600, iron: 200, minutes: 120 },
  muralla: { gold: 3000, wood: 600, stone: 1000, iron: 150, minutes: 90 },
  foso: { gold: 2500, wood: 400, stone: 800, iron: 100, minutes: 60 },
  granja: { gold: 1500, wood: 600, stone: 100, iron: 0, minutes: 45 },
  aserradero: { gold: 1500, wood: 800, stone: 100, iron: 50, minutes: 45 },
  minaPiedra: { gold: 1500, wood: 500, stone: 300, iron: 100, minutes: 45 },
  minaHierro: { gold: 2000, wood: 700, stone: 300, iron: 150, minutes: 45 },
  cuartel: { gold: 3000, wood: 700, stone: 400, iron: 300, minutes: 60 },
  laboratorio: { gold: 3500, wood: 600, stone: 500, iron: 400, minutes: 90 },
}

/** Material de reparación por edificio. */
export const BUILDING_REPAIR_MATERIAL: Record<string, ResourceKey> = {
  ayuntamiento: 'stone',
  muralla: 'stone',
  foso: 'stone',
  granja: 'wood',
  aserradero: 'wood',
  minaPiedra: 'stone',
  minaHierro: 'iron',
  cuartel: 'iron',
  laboratorio: 'iron',
}

/** Costo del nivel n (1-5): oro y materiales base × 1,6^(n-1), tiempo ×1,5^(n-1). */
export function buildingCostAtLevel(
  key: string,
  level: number
): BuildingCost | null {
  const base = BUILDING_BASE_COSTS[key]
  if (!base || level < 1 || level > 5) return null

  const factor = Math.pow(BALANCE.building.materialGrowthFactor, level - 1)
  const timeFactor = Math.pow(BALANCE.building.timeGrowthFactor, level - 1)

  const round10 = (value: number) => Math.round(value / 10) * 10

  return {
    gold: round10(base.gold * factor),
    wood: round10(base.wood * factor),
    stone: round10(base.stone * factor),
    iron: round10(base.iron * factor),
    minutes: Math.round(base.minutes * timeFactor),
  }
}

/** HP total de un edificio según su nivel. */
export function buildingHp(key: string, level: number): number {
  const isDefensive = key === 'muralla' || key === 'foso'
  const hp = level * BALANCE.building.hpPerLevel
  return isDefensive ? Math.round(hp * BALANCE.building.hpFactorDefensive) : hp
}

export interface UnitType {
  key: string
  name: string
  tier: number
  attack: number
  defense: number
  goldCost: number
  foodCost: number
  ironCost: number
  foodUpkeep: number
  trainingMinutes: number
  requiredBarracksLevel: number
}

export const UNIT_TYPES: UnitType[] = [
  {
    key: 'miliciano',
    name: 'Miliciano',
    tier: 1,
    attack: 25,
    defense: 25,
    goldCost: 50,
    foodCost: 20,
    ironCost: 10,
    foodUpkeep: 0.2,
    trainingMinutes: 5,
    requiredBarracksLevel: 1,
  },
  {
    key: 'espadachin',
    name: 'Espadachín',
    tier: 2,
    attack: 50,
    defense: 55,
    goldCost: 120,
    foodCost: 35,
    ironCost: 25,
    foodUpkeep: 0.4,
    trainingMinutes: 10,
    requiredBarracksLevel: 2,
  },
  {
    key: 'arquero',
    name: 'Arquero',
    tier: 3,
    attack: 85,
    defense: 95,
    goldCost: 260,
    foodCost: 60,
    ironCost: 55,
    foodUpkeep: 0.7,
    trainingMinutes: 20,
    requiredBarracksLevel: 3,
  },
  {
    key: 'caballero',
    name: 'Caballero',
    tier: 4,
    attack: 180,
    defense: 130,
    goldCost: 550,
    foodCost: 110,
    ironCost: 120,
    foodUpkeep: 1.2,
    trainingMinutes: 40,
    requiredBarracksLevel: 4,
  },
  {
    key: 'campeon',
    name: 'Campeón',
    tier: 5,
    attack: 380,
    defense: 300,
    goldCost: 1100,
    foodCost: 200,
    ironCost: 260,
    foodUpkeep: 2.0,
    trainingMinutes: 80,
    requiredBarracksLevel: 5,
  },
]
