'use client'

import * as React from 'react'

import { useCity } from '@/components/city/city-provider'
import { useMyResources } from '@/hooks/use-my-resources'
import { resources } from '@/data/resources'
import { Skeleton } from '@/components/ui/skeleton'

export function ResourceBar() {
  const { city } = useCity()
  const {
    resources: playerResources,
    isLoading,
    error,
  } = useMyResources()

  return (
    <ul className="flex flex-col gap-1">
      {Object.values(resources).map((resource) => {
        const amount = playerResources?.[resource.key]

        return (
          <li
            key={resource.key}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm"
          >
            <span className="text-muted-foreground flex items-center gap-3">
              <resource.icon
                className={`size-4 shrink-0 ${resource.iconColor}`}
              />
              <span>{resource.label}</span>
            </span>
            <span className="flex items-baseline gap-2">
              {amount === undefined ? (
                error && !isLoading ? (
                  <span className="text-muted-foreground text-xs">—</span>
                ) : (
                  <Skeleton className="h-4 w-12" />
                )
              ) : (
                <>
                  <span className="font-medium tabular-nums">
                    {amount.toLocaleString('es-ES')}
                  </span>
                  {city && (
                    <span className="text-muted-foreground text-xs tabular-nums">
                      +{city.perHour[resource.key]}/h
                    </span>
                  )}
                </>
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
