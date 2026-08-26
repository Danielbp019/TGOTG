'use client'

import * as React from 'react'
import { Hammer, Wrench } from 'lucide-react'

import { useCity } from '@/components/city/city-provider'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { buildingColors, buildingIcons } from '@/data/icons'
import { resources } from '@/data/resources'
import type { ResourceKey } from '@/types'
import {
  ApiError,
  repairBuilding,
  type CityBuilding,
  type CityBuildingRepairCost,
} from '@/lib/api'

function repairCost(building: CityBuilding): CityBuildingRepairCost | null {
  if (building.level < 1) return null
  return building.repairCost
}

function isResourceKey(value: string): value is ResourceKey {
  return value in resources
}

export function RepairPanel() {
  const { city, isLoading, reload } = useCity()
  const [busyKey, setBusyKey] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | undefined>()

  const damaged =
    city?.buildings.filter((building) => building.damage > 0) ?? []

  async function handleRepair(building: CityBuilding, type: 'paid' | 'auto') {
    if (!city) return

    setBusyKey(building.key)
    setError(undefined)
    try {
      await repairBuilding(building.id, type)
      await reload()
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message)
      } else {
        setError('No se pudo iniciar la reparación.')
      }
    } finally {
      setBusyKey(null)
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Cargando daños…</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="text-primary size-4" />
          Reparaciones
        </CardTitle>
        <CardDescription>
          Tras un asedio los edificios quedan dañados y producen o defienden
          menos. Paga oro y materiales para reparar rápido, o deja que se repare
          solo lentamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {damaged.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hay edificios dañados. Tus muros están intactos.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {damaged.map((building) => {
              const Icon = buildingIcons[building.key]
              const cost = repairCost(building)
              const material =
                cost && isResourceKey(cost.material) ? cost.material : null
              const MaterialIcon = material ? resources[material].icon : undefined

              return (
                <li
                  key={building.key}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {Icon && (
                      <Icon
                        className={`size-5 shrink-0 ${
                          buildingColors[building.key] ?? 'text-muted-foreground'
                        }`}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {building.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {building.damage}% de daño
                        {building.repairing && (
                          <span className="text-primary">
                            {' '}
                            · en reparación (
                            {building.repairPaid ? 'rápida' : 'lenta'})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {!building.repairing && cost && material && (
                    <div className="flex items-center gap-2 text-xs tabular-nums">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <resources.gold.icon
                          className={`size-3.5 ${resources.gold.iconColor}`}
                        />
                        {cost.gold.toLocaleString('es')}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        {material && MaterialIcon && (
                          <MaterialIcon
                            className={`size-3.5 ${resources[material].iconColor}`}
                          />
                        )}
                        {cost.amount.toLocaleString('es')}
                      </span>
                    </div>
                  )}

                  {!building.repairing ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleRepair(building, 'paid')}
                        disabled={busyKey === building.key}
                        className="flex-1 sm:flex-none"
                      >
                        <Hammer className="size-3.5" />
                        Reparar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRepair(building, 'auto')}
                        disabled={busyKey === building.key}
                        className="flex-1 sm:flex-none"
                      >
                        Auto-reparar
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      Reparándose…
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {error && <p className="text-destructive mt-3 text-xs">{error}</p>}
      </CardContent>
    </Card>
  )
}
