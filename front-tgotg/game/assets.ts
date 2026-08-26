import type { BuildingType } from '@/types'

export const groundAsset = '/game/terrain/bosque-2048x1024.jpg'

/**
 * Mapeo real de sprites en public/game/buildings/ (carpetas en plural desde 2026-08-22)
 * ayuntamientos, granjas, minaspiedra, minashierro, aserraderos, cuarteles, laboratorios, fosos, murallas
 * Archivos: {prefijo}1..5.png (foso/muralla 1..4) y {prefijo}Destruido.png — 1024×1024
 */
export const BUILDING_ASSET_BASE: Record<
  BuildingType,
  { folder: string; prefix: string } | null
> = {
  ayuntamiento: { folder: 'ayuntamientos', prefix: 'ayuntamiento' },
  granja: { folder: 'granjas', prefix: 'granja' },
  minaPiedra: { folder: 'minaspiedra', prefix: 'mina' },
  minaHierro: { folder: 'minashierro', prefix: 'minash' },
  aserradero: { folder: 'aserraderos', prefix: 'aserradero' },
  cuartel: { folder: 'cuarteles', prefix: 'cuartel' },
  laboratorio: { folder: 'laboratorios', prefix: 'labo' },
  muralla: { folder: 'murallas', prefix: 'muralla' },
  foso: { folder: 'fosos', prefix: 'foso' },
}

const DEFENSIVES_4 = new Set<BuildingType>(['foso', 'muralla'])

export function buildingLevelToAssetLevel(key: string, level: number): number {
  if ((DEFENSIVES_4 as Set<string>).has(key)) {
    const map: Record<number, number> = { 1: 2, 2: 2, 3: 3, 4: 4, 5: 4 }
    return map[level] ?? Math.max(2, Math.min(4, level))
  }
  const map: Record<number, number> = { 1: 2, 2: 2, 3: 3, 4: 4, 5: 5 }
  return map[level] ?? Math.max(2, Math.min(5, level))
}

export function buildingAssetPath(
  key: string,
  level: number,
  damage: number,
  opts: { upgrading?: boolean } = {}
): string | null {
  const entry = BUILDING_ASSET_BASE[key as BuildingType] ?? null
  if (!entry) return null

  const isDestroyed = damage >= 30
  if (isDestroyed)
    return `/game/buildings/${entry.folder}/${entry.prefix}Destruido.png`

  if (opts.upgrading)
    return `/game/buildings/${entry.folder}/${entry.prefix}1.png`

  if (level === 0) return null

  const assetLevel = buildingLevelToAssetLevel(
    key,
    Math.max(1, Math.min(5, level))
  )
  return `/game/buildings/${entry.folder}/${entry.prefix}${assetLevel}.png`
}

/**
 * Todas las texturas para precarga — evita 404 por level dinámico.
 */
export function allInteriorAssetPaths(): string[] {
  const paths: string[] = []
  for (const [key, entry] of Object.entries(BUILDING_ASSET_BASE)) {
    if (!entry) continue
    const max = (DEFENSIVES_4 as Set<string>).has(key) ? 4 : 5
    for (let lvl = 1; lvl <= max; lvl++) {
      paths.push(`/game/buildings/${entry.folder}/${entry.prefix}${lvl}.png`)
    }
    paths.push(`/game/buildings/${entry.folder}/${entry.prefix}Destruido.png`)
  }
  return [...new Set(paths)]
}
