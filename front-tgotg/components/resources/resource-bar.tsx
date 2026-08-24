'use client'

import { useCity } from '@/components/city/city-provider'
import { resources } from '@/data/resources'

export function ResourceBar() {
  const { city, isLoading } = useCity()

  return (
    <ul className="flex flex-col gap-1">
      {Object.values(resources).map((resource) => (
        <li
          key={resource.key}
          className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm"
        >
          <span className="text-muted-foreground flex items-center gap-3">
            <resource.icon className="size-4 shrink-0" />
            <span>{resource.label}</span>
          </span>
          <span className="flex items-baseline gap-2">
            {isLoading || !city ? (
              <span className="text-muted-foreground text-xs">Cargando…</span>
            ) : (
              <>
                <span className="font-medium tabular-nums">
                  {city.resources[resource.key].toLocaleString('es-ES')}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  +{city.perHour[resource.key]}/h
                </span>
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}
