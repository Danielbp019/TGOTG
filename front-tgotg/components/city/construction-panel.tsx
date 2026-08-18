'use client'

import * as React from 'react'
import { Building2, Info } from 'lucide-react'
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
import { buildingIcons } from '@/data/icons'
import type { BuildingTypePayload } from '@/lib/api'
import { fetchBuildingTypes } from '@/lib/api'
import { cn } from '@/lib/utils'

type BuildingCategory =
  | 'Principal'
  | 'Defensa'
  | 'Recursos'
  | 'Militar'
  | 'Investigación'

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
  return ['Principal', 'Defensa', 'Recursos', 'Militar', 'Investigación'].includes(
    value
  )
}

export function ConstructionPanel() {
  const { city, isLoading } = useCity()
  const [catalog, setCatalog] = React.useState<BuildingTypePayload[] | null>(
    null
  )

  React.useEffect(() => {
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
  }, [])

  const levels = React.useMemo(() => {
    if (!city) return new Map<string, number>()
    return new Map(city.buildings.map((building) => [building.key, building.level]))
  }, [city])

  if (isLoading || !catalog) {
    return (
      <p className="text-muted-foreground text-sm">
        Cargando edificios…
      </p>
    )
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
            Vista previa visual: los costes, tiempos y la mejora de edificios
            llegarán próximamente.
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="divide-y px-0 py-0">
          <ul>
            {catalog.map((building) => {
              const level = levels.get(building.key) ?? 0
              const maxLevel = building.max_level
              const isMaxLevel = level >= maxLevel
              const category = isBuildingCategory(building.category)
                ? building.category
                : 'Principal'
              const Icon = buildingIcons[building.key] ?? Building2
              return (
                <li
                  key={building.key}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Icon className="text-muted-foreground size-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {building.name}
                      </p>
                      <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                        {building.description}
                      </p>
                      <Badge
                        variant={categoryVariants[category]}
                        className="mt-1"
                      >
                        {category}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-1 sm:max-w-40">
                    <LevelBar level={level} max={maxLevel} />
                    <span className="text-muted-foreground text-xs tabular-nums">
                      Nivel {level} / {maxLevel}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                    className={cn('w-full sm:w-auto', 'opacity-100')}
                  >
                    {isMaxLevel ? 'Nivel máximo' : 'Próximamente'}
                  </Button>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}