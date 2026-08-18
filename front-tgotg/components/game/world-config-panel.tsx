'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Check, Globe, Rocket } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCity } from '@/components/city/city-provider'
import type { GameOptionPayload } from '@/lib/api'
import { ApiError, createWorld, fetchGameOptions } from '@/lib/api'
import { worldConfigSchema } from '@/lib/validations/new-game'
import { cn } from '@/lib/utils'

export function WorldConfigPanel() {
  const router = useRouter()
  const { reload } = useCity()

  const [durations, setDurations] = React.useState<GameOptionPayload[]>([])
  const [multipliers, setMultipliers] = React.useState<GameOptionPayload[]>([])
  const [durationId, setDurationId] = React.useState<string | null>(null)
  const [multiplierId, setMultiplierId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | undefined>()
  const [saving, setSaving] = React.useState(false)
  const [started, setStarted] = React.useState(false)

  React.useEffect(() => {
    let active = true

    fetchGameOptions()
      .then((response) => {
        if (!active) return
        setDurations(response.durations)
        setMultipliers(response.multipliers)
        setDurationId(response.durations[0]?.key ?? null)
        setMultiplierId(response.multipliers[0]?.key ?? null)
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar las opciones del mundo.')
      })

    return () => {
      active = false
    }
  }, [])

  async function handleStart() {
    if (!durationId || !multiplierId) return

    const result = worldConfigSchema.safeParse({
      durationId,
      multiplierId,
    })
    if (!result.success) {
      setError(result.error.issues[0]?.message)
      return
    }

    setSaving(true)
    setError(undefined)
    try {
      await createWorld({
        duration_key: durationId,
        multiplier_key: multiplierId,
      })
      setStarted(true)
      await reload()
      router.push('/')
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message)
      } else {
        setError('No se pudo iniciar el mundo. Inténtalo de nuevo.')
      }
    } finally {
      setSaving(false)
    }
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
          {durations.map((duration) => {
            const selected = duration.key === durationId
            return (
              <button
                key={duration.key}
                type="button"
                onClick={() => {
                  setDurationId(duration.key)
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
                  {Math.round(duration.value)} días
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
          {multipliers.map((multiplier) => {
            const selected = multiplier.key === multiplierId
            return (
              <button
                key={multiplier.key}
                type="button"
                onClick={() => {
                  setMultiplierId(multiplier.key)
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
                  {multiplier.value}× producción
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
          disabled={saving}
          className="w-full sm:w-auto"
        >
          <Rocket />
          {saving ? 'Creando el mundo…' : 'Iniciar el mundo'}
        </Button>
      </div>
    </div>
  )
}