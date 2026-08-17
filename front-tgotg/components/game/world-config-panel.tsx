'use client'

import * as React from 'react'
import { Check, Globe, Rocket } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { gameDurations, gameMultipliers } from '@/data/new-game'
import { worldConfigSchema } from '@/lib/validations/new-game'
import { cn } from '@/lib/utils'

export function WorldConfigPanel() {
  const [durationId, setDurationId] = React.useState('normal')
  const [multiplierId, setMultiplierId] = React.useState('x1')
  const [error, setError] = React.useState<string | undefined>()
  const [started, setStarted] = React.useState(false)

  function handleStart() {
    const result = worldConfigSchema.safeParse({
      durationId,
      multiplierId,
    })
    if (!result.success) {
      setError(result.error.issues[0]?.message)
      return
    }
    setError(undefined)
    setStarted(true)
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading flex items-center gap-2 text-lg font-bold">
          <Globe className="text-primary size-5" />
          Configuración del mundo
        </h1>
        <p className="text-muted-foreground text-sm">
          Define las reglas de la nueva contienda. Solo tú, como dios
          administrador, puedes iniciar el mundo.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Duración de la partida</CardTitle>
          <CardDescription>
            Cuánto durará la contienda entre las civilizaciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {gameDurations.map((duration) => {
            const selected = duration.id === durationId
            return (
              <button
                key={duration.id}
                type="button"
                onClick={() => {
                  setDurationId(duration.id)
                  setError(undefined)
                }}
                aria-pressed={selected}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors',
                  selected
                    ? 'border-primary bg-primary/5 ring-primary ring-2'
                    : 'border-border hover:bg-muted'
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-heading text-sm font-medium">
                    {duration.label}
                  </span>
                  {selected && <Check className="text-primary size-4" />}
                </div>
                <span className="text-muted-foreground text-xs">
                  {duration.days} días
                </span>
                <span className="text-muted-foreground text-xs">
                  {duration.description}
                </span>
              </button>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Multiplicador</CardTitle>
          <CardDescription>
            La velocidad de producción y construcción del mundo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {gameMultipliers.map((multiplier) => {
            const selected = multiplier.id === multiplierId
            return (
              <button
                key={multiplier.id}
                type="button"
                onClick={() => {
                  setMultiplierId(multiplier.id)
                  setError(undefined)
                }}
                aria-pressed={selected}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors',
                  selected
                    ? 'border-primary bg-primary/5 ring-primary ring-2'
                    : 'border-border hover:bg-muted'
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-heading text-sm font-medium">
                    {multiplier.label}
                  </span>
                  {selected && <Check className="text-primary size-4" />}
                </div>
                <span className="text-muted-foreground text-xs">
                  {multiplier.multiplier}× producción
                </span>
                <span className="text-muted-foreground text-xs">
                  {multiplier.description}
                </span>
              </button>
            )
          })}
        </CardContent>
      </Card>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {started && (
        <p className="text-sm text-emerald-600">
          El mundo ha sido creado y ya puedes guiar a tu civilización.
        </p>
      )}

      <div>
        <Button
          onClick={handleStart}
          disabled={started}
          className="w-full sm:w-auto"
        >
          <Rocket />
          {started ? 'Mundo iniciado' : 'Iniciar el mundo'}
        </Button>
      </div>
    </div>
  )
}
