import type {
  BuildingSlot,
  CityProduction,
  CityStatus,
  ArmyStatus,
} from '@/types'

export const cityProduction: CityProduction[] = [
  { resource: 'gold', label: 'Oro', perHour: 120 },
  { resource: 'wood', label: 'Madera', perHour: 85 },
  { resource: 'stone', label: 'Piedra', perHour: 60 },
  { resource: 'iron', label: 'Hierro', perHour: 35 },
  { resource: 'food', label: 'Comida', perHour: 95 },
]

export const cityStatus: CityStatus = {
  population: 340,
  happiness: 72,
  defense: 58,
}

export const armyStatus: ArmyStatus = {
  stationedTroops: 124,
  defensePower: 310,
  overall: 'Preparado',
}

export const buildingSlots: BuildingSlot[] = [
  {
    type: 'foso',
    name: 'Foso',
    level: 1,
    x: 1024,
    y: 910,
    shape: 'rect',
    width: 1800,
    height: 160,
  },
  {
    type: 'muralla',
    name: 'Muralla',
    level: 2,
    x: 1024,
    y: 690,
    shape: 'rect',
    width: 1750,
    height: 200,
  },
  {
    type: 'minaPiedra',
    name: 'Mina de piedra',
    level: 1,
    x: 520,
    y: 480,
    shape: 'diamond',
    width: 480,
    height: 250,
  },
  {
    type: 'ayuntamiento',
    name: 'Ayuntamiento',
    level: 3,
    x: 960,
    y: 470,
    shape: 'diamond',
    width: 500,
    height: 260,
  },
  {
    type: 'minaHierro',
    name: 'Mina de hierro',
    level: 2,
    x: 1420,
    y: 490,
    shape: 'diamond',
    width: 510,
    height: 260,
  },
  {
    type: 'cuartel',
    name: 'Cuartel del ejército',
    level: 1,
    x: 640,
    y: 260,
    shape: 'diamond',
    width: 490,
    height: 250,
  },
  {
    type: 'laboratorio',
    name: 'Laboratorio',
    level: 1,
    x: 1080,
    y: 220,
    shape: 'diamond',
    width: 500,
    height: 260,
  },
  {
    type: 'aserradero',
    name: 'Aserradero',
    level: 2,
    x: 1500,
    y: 240,
    shape: 'diamond',
    width: 480,
    height: 250,
  },
  {
    type: 'granja',
    name: 'Granja',
    level: 2,
    x: 1620,
    y: 360,
    shape: 'diamond',
    width: 490,
    height: 250,
  },
]
