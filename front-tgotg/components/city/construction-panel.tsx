'use client'

import * as React from 'react'
import { Info } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'

import { LevelBar } from '@/components/city/level-bar'
import { Badge, badgeVariants } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  constructionBuildings,
  MAX_BUILDING_LEVEL,
  type BuildingCategory,
} from '@/data/buildings'
import type { BuildingType } from '@/types'
import { cn } from '@/lib/utils'

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

export function ConstructionPanel() {
  const [levels, setLevels] = React.useState<Record<BuildingType, number>>(
    () =>
      Object.fromEntries(
        constructionBuildings.map((building) => [building.type, building.level])
      ) as Record<BuildingType, number>
  )

  function levelUp(type: BuildingType) {
    setLevels((prev) => ({
      ...prev,
      [type]: Math.min(prev[type] + 1, MAX_BUILDING_LEVEL),
    }))
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
            Vista previa visual: los costes y tiempos aún no están definidos.
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="divide-y px-0 py-0">
          <ul>
            {constructionBuildings.map((building) => {
              const level = levels[building.type]
              const isMaxLevel = level >= MAX_BUILDING_LEVEL
              return (
                <li
                  key={building.type}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <building.icon className="text-muted-foreground size-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {building.name}
                      </p>
                      <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                        {building.description}
                      </p>
                      <Badge
                        variant={categoryVariants[building.category]}
                        className="mt-1"
                      >
                        {building.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-1 sm:max-w-40">
                    <LevelBar level={level} max={MAX_BUILDING_LEVEL} />
                    <span className="text-muted-foreground text-xs tabular-nums">
                      Nivel {level} / {MAX_BUILDING_LEVEL}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isMaxLevel}
                    onClick={() => levelUp(building.type)}
                    className={cn(
                      'w-full sm:w-auto',
                      isMaxLevel && 'opacity-100'
                    )}
                  >
                    {isMaxLevel ? 'Nivel máximo' : 'Subir nivel'}
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
