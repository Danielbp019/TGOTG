'use client'

import { ShieldCheck } from 'lucide-react'
import { useCity } from '@/components/city/city-provider'
import { resources } from '@/data/resources'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useEffect, useState } from 'react'
import type { ResourceKey } from '@/types'

export function CityStatus() {
  const { city, isLoading } = useCity()
  const [protectionRemaining, setProtectionRemaining] = useState<number | null>(
    null
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!city?.protectionUntil) {
        setProtectionRemaining(null)
        return
      }

      const diffMs = new Date(city.protectionUntil).getTime() - Date.now()
      setProtectionRemaining(
        diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60)) : 0
      )
    }, 0)

    return () => window.clearTimeout(timer)
  }, [city?.protectionUntil])

  const productionKeys: ResourceKey[] = [
    'gold',
    'wood',
    'stone',
    'iron',
    'food',
  ]

  function deriveArmyOverall(stationedTroops: number, defensePower: number) {
    if (stationedTroops === 0) return 'Sin tropas'
    if (defensePower >= 300) return 'Preparado'
    if (defensePower >= 100) return 'En formación'
    return 'Débil'
  }

  const production = productionKeys.map((key) => ({
    resource: resources[key],
    perHour: city?.perHour[key] ?? 0,
  }))

  const status = {
    population: city?.population ?? 0,
    happiness: city?.happiness ?? 0,
    defense: city?.defense ?? 0,
  }

  const army = {
    stationedTroops: city?.stationedTroops ?? 0,
    defensePower: city?.defensePower ?? 0,
    overall: deriveArmyOverall(
      city?.stationedTroops ?? 0,
      city?.defensePower ?? 0
    ),
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Producción</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Cargando…</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {production.map((item) => (
                <li
                  key={item.resource.key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground flex items-center gap-2">
                    <item.resource.icon
                      className={`size-4 shrink-0 ${item.resource.iconColor}`}
                    />
                    {item.resource.label}
                  </span>
                  <span className="tabular-nums">+{item.perHour}/h</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Estado de la ciudad</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Población</span>
              <span className="tabular-nums">{status.population}</span>
            </div>
            <Progress value={70} aria-label="Población" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Felicidad</span>
              <span className="tabular-nums">{status.happiness}%</span>
            </div>
            <Progress value={status.happiness} aria-label="Felicidad" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Defensa</span>
              <span className="tabular-nums">{status.defense}</span>
            </div>
            <Progress value={status.defense} aria-label="Defensa" />
          </div>
          {protectionRemaining !== null && (
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Protección</span>
              {protectionRemaining > 0 ? (
                <span>{protectionRemaining} h</span>
              ) : (
                <span>Expirada</span>
              )}
            </div>
          )}
          {protectionRemaining !== null && protectionRemaining > 0 && (
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desfensa durante</span>
                <span className="tabular-nums">{protectionRemaining} h</span>
              </div>
              <div>
                <span className="text-danger-600 text-xs font-medium">
                  <ShieldCheck className="size-3.5" /> Tu ciudad está protegida
                  contra ataques
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Ejército</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Tropas estacionadas</dt>
              <dd className="tabular-nums">{army.stationedTroops}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Fuerza defensiva</dt>
              <dd className="tabular-nums">{army.defensePower}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Estado general</dt>
              <dd>{army.overall}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
