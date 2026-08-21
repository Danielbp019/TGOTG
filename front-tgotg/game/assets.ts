import type { BuildingType } from '@/types'

export const groundAsset = '/game/terrain/bosque-2048x1024.jpg'

/**
 * Mapeo real de sprites en public/game/buildings/
 * Carpetas: ayuntamiento, granja, minaspiedra, minashierro, aserradero, cuartel, laboratorio
 * Archivos: {base}1..5.png y {base}Destruido.png — todos 1024×1024
 * muralla/foso aún sin sprite → null (placeholder en CityScene)
 */
export const BUILDING_ASSET_BASE: Record<
  BuildingType,
  { folder: string; prefix: string } | null
> = {
  ayuntamiento: { folder: 'ayuntamiento', prefix: 'ayuntamiento' },
  granja: { folder: 'granja', prefix: 'granja' },
  minaPiedra: { folder: 'minaspiedra', prefix: 'mina' },
  minaHierro: { folder: 'minashierro', prefix: 'minash' },
  aserradero: { folder: 'aserradero', prefix: 'aserradero' },
  cuartel: { folder: 'cuartel', prefix: 'cuartel' },
  laboratorio: { folder: 'laboratorio', prefix: 'labo' },
  muralla: null,
  foso: null,
}

export function buildingAssetPath(
  key: string,
  level: number,
  damage: number
): string | null {
  const entry = BUILDING_ASSET_BASE[key as BuildingType] ?? null
  if (!entry) return null

  // Nivel 0 (no construido) → muestra nivel 1 atenuado; el CityScene aplica alpha
  const safeLevel = Math.max(1, Math.min(5, level || 1))

  // Si tiene daño visible (>30%), mostrar variante destruida cuando exista
  const isDestroyed = damage >= 30
  const file = isDestroyed
    ? `${entry.prefix}Destruido.png`
    : `${entry.prefix}${safeLevel}.png`

  return `/game/buildings/${entry.folder}/${file}`
}

/**
 * Totas las texturas interiores para precarga — evita 404 por level dinámico.
 */
export function allInteriorAssetPaths(): string[] {
  const paths: string[] = []
  for (const [key, entry] of Object.entries(BUILDING_ASSET_BASE)) {
    if (!entry) continue
    for (let lvl = 1; lvl <= 5; lvl++) {
      paths.push(`/game/buildings/${entry.folder}/${entry.prefix}${lvl}.png`)
    }
    paths.push(`/game/buildings/${entry.folder}/${entry.prefix}Destruido.png`)
  }
  // Evita duplicados por si dos keys comparten carpeta (no es el caso hoy)
  return [...new Set(paths)]
}

/** @deprecated Usar buildingAssetPath(key, level, damage). Se mantiene por compatibilidad. */
export const buildingAssets: Record<BuildingType, string> = {
  ayuntamiento: buildingAssetPath('ayuntamiento', 1, 0) ?? '',
  muralla: '',
  foso: '',
  granja: buildingAssetPath('granja', 1, 0) ?? '',
  minaHierro: buildingAssetPath('minaHierro', 1, 0) ?? '',
  minaPiedra: buildingAssetPath('minaPiedra', 1, 0) ?? '',
  aserradero: buildingAssetPath('aserradero', 1, 0) ?? '',
  cuartel: buildingAssetPath('cuartel', 1, 0) ?? '',
  laboratorio: buildingAssetPath('laboratorio', 1, 0) ?? '',
}
