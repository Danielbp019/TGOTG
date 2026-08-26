'use client'

import * as React from 'react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { biomeBonusLabel, biomeMeta } from '@/data/biomes'
import { fetchRegionsCached, type RegionPayload } from '@/lib/api'
import { cn } from '@/lib/utils'

const MAP_IMAGE = '/game/maps/mapaGlobal2048x1024.jpg'
const MAP_WIDTH = 2048
const MAP_HEIGHT = 1024

function polygonPoints(region: RegionPayload): string {
  const coords = region.polygon
  const pairs: string[] = []
  for (let i = 0; i < coords.length - 1; i += 2) {
    pairs.push(`${coords[i]},${coords[i + 1]}`)
  }
  return pairs.join(' ')
}

export function WorldMap() {
  const [regions, setRegions] = React.useState<RegionPayload[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setError(null)
    try {
      const response = await fetchRegionsCached()
      setRegions(response.regions)
    } catch {
      setError('No se pudo cargar el mapa del mundo.')
    }
  }, [])

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(t)
  }, [load])

  if (error) {
    return (
      <div className="bg-card flex flex-col items-center justify-between gap-2 rounded-xl border px-4 py-3 sm:flex-row">
        <p className="text-destructive text-sm">{error}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void load()}
        >
          Reintentar
        </Button>
      </div>
    )
  }

  if (regions === null) {
    return (
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="aspect-[2/1] w-full animate-pulse rounded-xl bg-muted" />
        <div className="hidden h-64 animate-pulse rounded-xl bg-muted lg:block" />
      </div>
    )
  }

  const selected = regions.find((r) => r.id === selectedId) ?? null

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <figure className="ring-foreground/10 relative overflow-hidden rounded-xl ring-1">
        <Image
          src={MAP_IMAGE}
          alt="Mapa del mundo conocido"
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="block h-auto w-full"
          priority
        />
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="absolute inset-0 size-full"
          role="presentation"
        >
          {regions.map((region) => {
            const isSelected = region.id === selectedId
            return (
              <polygon
                key={region.id}
                points={polygonPoints(region)}
                fill={isSelected ? '#f5deb3' : 'transparent'}
                fillOpacity={isSelected ? 0.25 : 0}
                stroke={isSelected ? '#2b1d0e' : 'transparent'}
                strokeWidth={6}
                className="cursor-pointer transition-[fill,stroke] duration-150 hover:fill-[#f5deb3]/25 hover:stroke-[#2b1d0e]/60"
                onClick={() => setSelectedId(region.id)}
              >
                <title>{region.label}</title>
              </polygon>
            )
          })}
        </svg>
      </figure>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">
            {selected ? selected.label : 'Regiones del mundo'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selected ? (
            <div className="grid gap-3">
              <p className="text-muted-foreground text-sm">
                Territorios conocidos y los dones que concede cada tierra.
              </p>
              <ul className="grid gap-2">
                {selected.biomes.map((biome) => {
                  const meta = biomeMeta(biome.key)
                  const Icon = meta.icon
                  return (
                    <li
                      key={biome.id}
                      className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <Icon className={cn('size-4', meta.iconColor)} />
                        {meta.label || biome.key}
                      </span>
                      <Badge variant="secondary">
                        {biomeBonusLabel(biome.bonusResource, biome.bonusValue)}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : (
            <div className="grid gap-3">
              <p className="text-muted-foreground text-sm">
                Selecciona una región del mapa para conocer sus tierras y los
                bonos que otorga cada bioma.
              </p>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {regions.map((region) => (
                  <li key={region.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(region.id)}
                      className={cn(
                        'w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors',
                        region.id === selectedId
                          ? 'border-primary bg-primary/5 ring-2'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {region.sortOrder}. {region.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
