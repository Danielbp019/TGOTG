'use client'

import * as React from 'react'
import { Building2, Clock3, Hammer } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { LevelBar } from '@/components/city/level-bar'
import { useCity } from '@/components/city/city-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/components/auth/auth-provider'
import { buildingColors, buildingIcons } from '@/data/icons'
import {
  fetchBuildingTypes,
  upgradeBuilding,
  type BuildingLevelCost,
  type BuildingTypePayload,
  type CityBuilding,
} from '@/lib/api'
import { cn } from '@/lib/utils'

type BuildingCategory =
  | 'Principal'
  | 'Defensa'
  | 'Recursos'
  | 'Militar'
  | 'Investigación'

const categoryStyles: Record<BuildingCategory, string> = {
  Principal: 'border border-white/25 bg-ink/50 text-[#DCDFEB]',
  Defensa: 'bg-stone/25 text-black',
  Recursos: 'bg-gold/20 text-black',
  Militar: 'bg-wine/30 text-black',
  Investigación: 'bg-azure/35 text-black',
}

function isBuildingCategory(value: string): value is BuildingCategory {
  return [
    'Principal',
    'Defensa',
    'Recursos',
    'Militar',
    'Investigación',
  ].includes(value)
}

function formatCost(cost: {
  gold: number
  wood: number
  stone: number
  iron: number
  minutes: number
}): string {
  const parts: string[] = []
  if (cost.gold) parts.push(`${cost.gold} oro`)
  if (cost.wood) parts.push(`${cost.wood} madera`)
  if (cost.stone) parts.push(`${cost.stone} piedra`)
  if (cost.iron) parts.push(`${cost.iron} hierro`)
  return parts.join(' · ')
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

function formatCountdown(
  finishesAt: string | null,
  now: number
): string | null {
  if (!finishesAt) return null
  const diff = new Date(finishesAt).getTime() - now
  if (diff <= 0) return '00:00'
  const totalSec = Math.ceil(diff / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function ConstructionRow({
  building,
  level,
  isUpgrading,
  isRepairing,
  isDestroyed,
  upgradeFinishesAt,
  maxLevel,
  isBusy,
  now,
  onUpgrade,
}: {
  building: BuildingTypePayload
  level: number
  isUpgrading: boolean
  isRepairing: boolean
  isDestroyed: boolean
  upgradeFinishesAt: string | null
  maxLevel: number
  isBusy: boolean
  now: number
  onUpgrade: () => void
}) {
  const nextLevel = level + 1
  const cost: BuildingLevelCost | undefined = building.levels[nextLevel - 1]
  const countdown = formatCountdown(upgradeFinishesAt, now)
  const category = isBuildingCategory(building.category)
    ? building.category
    : 'Principal'
  const Icon = buildingIcons[building.key] ?? Building2

  let buttonLabel: string
  let disabled = false
  let variant: 'outline' | 'default' = 'outline'

  if (level >= maxLevel) {
    buttonLabel = 'Nivel máximo'
    disabled = true
  } else if (isUpgrading) {
    buttonLabel = countdown
      ? `En construcción ${countdown}`
      : 'En construcción…'
    disabled = true
  } else if (isDestroyed) {
    buttonLabel = 'Repara primero'
    disabled = true
  } else if (isRepairing) {
    buttonLabel = 'En reparación…'
    disabled = true
  } else if (level === 0) {
    buttonLabel = 'Construir Nvl 1'
    variant = 'default'
  } else {
    buttonLabel = `Mejorar a Nvl ${nextLevel}`
    variant = 'default'
  }

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Icon
          className={`size-5 shrink-0 ${
            buildingColors[building.key] ?? 'text-muted-foreground'
          }`}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{building.name}</p>
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
            {building.description}
          </p>
          <Badge className={cn('mt-1', categoryStyles[category])}>
            {category}
          </Badge>
          {cost && level < maxLevel ? (
            <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 text-xs">
              <Hammer className="size-3" />
              {formatCost(cost)}
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3" />
                {formatDuration(cost.minutes)}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 sm:max-w-40">
        <LevelBar level={level} max={maxLevel} />
        <span className="text-muted-foreground text-xs tabular-nums">
          Nivel {level} / {maxLevel}
          {isUpgrading && countdown ? ` · ${countdown}` : ''}
        </span>
      </div>

      <Button
        type="button"
        variant={variant}
        size="sm"
        disabled={disabled || isBusy}
        onClick={onUpgrade}
        className={cn('w-full sm:w-auto', disabled && 'opacity-100')}
      >
        {isBusy ? 'Procesando…' : buttonLabel}
      </Button>
    </li>
  )
}

export function ConstructionPanel() {
  const { city, isLoading: cityLoading } = useCity()
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const [now, setNow] = React.useState(() => Date.now())

  const hasAnyUpgrading = React.useMemo(
    () => city?.buildings.some((b) => b.upgrading) ?? false,
    [city]
  )

  React.useEffect(() => {
    if (!hasAnyUpgrading) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [hasAnyUpgrading])

  const catalogQuery = useQuery({
    queryKey: ['building-types'],
    queryFn: () => fetchBuildingTypes(),
    enabled: !!user && !authLoading,
    select: (data) => data.building_types,
  })

  const upgradeMutation = useMutation({
    mutationFn: (buildingId: string) => {
      if (!city) throw new Error('No hay ciudad seleccionada')
      return upgradeBuilding(city.id, buildingId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['city'] })
      queryClient.invalidateQueries({ queryKey: ['player-resources', user?.id ?? null] })
    },
  })

  const buildingMap = React.useMemo(() => {
    if (!city) return new Map<string, CityBuilding>()
    return new Map(city.buildings.map((b) => [b.key, b]))
  }, [city])

  function handleUpgrade(building: BuildingTypePayload) {
    const cityBuilding = buildingMap.get(building.key)
    if (!cityBuilding) return
    upgradeMutation.reset()
    upgradeMutation.mutate(cityBuilding.id)
  }

  const catalog = catalogQuery.data

  if (cityLoading || !catalog) {
    return (
      <div className="flex w-full flex-col gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Construcción</CardTitle>
          <CardDescription>
            Mejora tus edificios para aumentar su producción y desbloquear
            nuevas capacidades.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y px-0 py-0">
          {upgradeMutation.isError && (
            <p className="text-destructive px-4 pt-3 text-xs">
              {upgradeMutation.error instanceof Error
                ? upgradeMutation.error.message
                : 'No se pudo iniciar la mejora.'}
            </p>
          )}
          <ul>
            {catalog.map((building) => {
              const cityBuilding = buildingMap.get(building.key)
              return (
                <ConstructionRow
                  key={building.key}
                  building={building}
                  level={cityBuilding?.level ?? 0}
                  isUpgrading={cityBuilding?.upgrading ?? false}
                  isRepairing={cityBuilding?.repairing ?? false}
                  isDestroyed={(cityBuilding?.damage ?? 0) > 0}
                  upgradeFinishesAt={cityBuilding?.upgradeFinishesAt ?? null}
                  maxLevel={building.max_level}
                  isBusy={upgradeMutation.isPending}
                  now={now}
                  onUpgrade={() => handleUpgrade(building)}
                />
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
