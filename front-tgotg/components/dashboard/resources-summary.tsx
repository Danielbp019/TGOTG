'use client'

import { useMyResources } from '@/hooks/use-my-resources'
import { useMyBlessing } from '@/hooks/use-my-blessing'
import { useMyCivilization } from '@/hooks/use-my-civilization'
import { resources } from '@/data/resources'
import { blessingIcons } from '@/data/icons'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function formatDaily(perHour: number): string {
  const daily = perHour * 24
  if (daily >= 1000) {
    return `≈ ${(daily / 1000).toFixed(1)}k/día`
  }
  return `≈ ${Math.round(daily)}/día`
}

export function ResourcesSummary() {
  const { resources: playerResources, perHour, isLoading } = useMyResources()
  const { blessing } = useMyBlessing()
  const { civilization } = useMyCivilization()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalPerHour = perHour
    ? Object.values(perHour).reduce((sum, v) => sum + v, 0)
    : 0

  const BlessingIcon = blessing ? blessingIcons[blessing.key] : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recursos Totales</CardTitle>
        {totalPerHour > 0 && (
          <span className="text-muted-foreground text-xs">
            +{totalPerHour.toLocaleString('es-ES')}/h total
          </span>
        )}
      </CardHeader>

      <CardContent>
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {Object.values(resources).map((resource) => {
            const amount = playerResources?.[resource.key] ?? 0
            const hour = perHour?.[resource.key] ?? 0

            return (
              <div
                key={resource.key}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm">
                  <resource.icon className={`size-4 ${resource.iconColor}`} />
                  <span className="font-medium tabular-nums">
                    {amount.toLocaleString('es-ES')}
                  </span>
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {hour > 0 ? `+${hour} ${formatDaily(hour)}` : '—'}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {civilization && (
            <span className="flex items-center gap-1.5">
              <span className="text-muted-foreground">🏰</span>
              <span className="font-medium">{civilization.name}</span>
            </span>
          )}
          {blessing && (
            <span className="flex items-center gap-1.5">
              {BlessingIcon && <BlessingIcon className="size-4" />}
              <span className="font-medium">{blessing.name}</span>
              <span className="text-muted-foreground text-xs">
                ({blessing.benefit})
              </span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
