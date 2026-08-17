import type { BuildingType } from '@/types'

export const groundAsset = '/game/terrain/bosque-2048x1024.jpg'

export const buildingAssets: Record<BuildingType, string> = {
  ayuntamiento: '/game/buildings/ayuntamiento.png',
  muralla: '/game/buildings/muralla.png',
  foso: '/game/buildings/foso.png',
  granja: '/game/buildings/granja.png',
  minaHierro: '/game/buildings/mina-hierro.png',
  minaPiedra: '/game/buildings/mina-piedra.png',
  aserradero: '/game/buildings/aserradero.png',
  cuartel: '/game/buildings/cuartel.png',
  laboratorio: '/game/buildings/laboratorio.png',
}
