'use client'

import * as React from 'react'
import { Building2, Clock3, Hammer, Info } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'

import { LevelBar } from '@/components/city/level-bar'
import { useCity } from '@/components/city/city-provider'
import { Badge, badgeVariants } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/components/auth/auth-provider'
import { buildingIcons } from '@/data/icons'
import { buildingCostAtLevel } from '@/data/balance'
import {
  ApiError,
  fetchBuildingTypes,
  upgradeBuilding,
  type BuildingTypePayload,
  type CityBuilding,
} from '@/lib/api'
import { cn } from '@/lib/utils'

type BuildingCategory =
  'Principal' | 'Defensa' | 'Recursos' | 'Militar' | 'Investigación'

const categoryVariants: Record<
  BuildingCategory,
  NonNullable<VariantProps<typeof badgeVariants>['variant']>
> = {
  Principal: 'default',
  Defensa: 'outline',
  Recursos: 'secondary',
  Militar: 'destructive',
  Investigación: 'ghost',
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
  const cost = buildingCostAtLevel(building.key, nextLevel)
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
        <Icon className="text-muted-foreground size-5 shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{building.name}</p>
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
            {building.description}
          </p>
          <Badge variant={categoryVariants[category]} className="mt-1">
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
  const { city, isLoading, reload } = useCity()
  const { user, isLoading: authLoading } = useAuth()
  const [catalog, setCatalog] = React.useState<BuildingTypePayload[] | null>(
    null
  )
  const [upgradingKey, setUpgradingKey] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
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

  React.useEffect(() => {
    if (authLoading || !user) return
    let active = true

    fetchBuildingTypes()
      .then((response) => {
        if (active) setCatalog(response.building_types)
      })
      .catch(() => {
        if (active) setCatalog([])
      })

    return () => {
      active = false
    }
  }, [authLoading, user])

  const buildingMap = React.useMemo(() => {
    if (!city) return new Map<string, CityBuilding>()
    return new Map(city.buildings.map((b) => [b.key, b]))
  }, [city])

  async function handleUpgrade(building: BuildingTypePayload) {
    const cityBuilding = buildingMap.get(building.key)
    if (!cityBuilding) return
    setError(null)
    setUpgradingKey(building.key)
    try {
      await upgradeBuilding(cityBuilding.id)
      await reload()
    } catch (caught) {
      const msg =
        caught instanceof ApiError
          ? caught.message
          : 'No se pudo iniciar la mejora.'
      setError(msg)
    } finally {
      setUpgradingKey(null)
    }
  }

  if (isLoading || !catalog) {
    return <p className="text-muted-foreground text-sm">Cargando edificios…</p>
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Construcción</CardTitle>
          <CardDescription>
            Mejora tus edificios para aumentar su producción y desbloquear
            nuevas capacidades.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground flex items-center gap-2 text-xs">
            <Info className="size-3.5 shrink-0" />
            Costes ×1,6 (oro, madera, piedra, hierro) y tiempo ×1,5 por nivel.
            Nivel máximo 5.
          </p>
          {error ? (
            <p className="text-destructive mt-2 text-xs">{error}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="divide-y px-0 py-0">
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
                  isBusy={upgradingKey === building.key}
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
