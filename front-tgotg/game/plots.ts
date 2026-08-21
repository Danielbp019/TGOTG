import type { PlotShape } from '@/types'

/**
 * @deprecated SSOT es backend App\Support\CityLayouts. Este fichero se mantiene
 * solo para compatibilidad y tipos. El front ya no define coordenadas: las recibe
 * de GET /api/city (shape,x,y,width,height,worldSize). Para mover un edificio,
 * edita CityLayouts::plots() y el front lo refleja sin tocar este fichero.
 * Se eliminará cuando ningún import lo use.
 */
export const WORLD_SIZE = { width: 2048, height: 1024 } as const

export interface CityPlot {
  id: string
  key: string
  x: number
  y: number
  width: number
  height: number
  shape: PlotShape
  row: number
}

export const CITY_PLOTS: readonly CityPlot[] = [] as unknown as readonly CityPlot[]

export const PLOT_BY_KEY: Record<string, CityPlot> = {}
