'use client'

import * as React from 'react'
import { Check, Globe, Rocket } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/components/auth/auth-provider'
import type { GameOptionPayload } from '@/lib/api'
import { ApiError, createWorld, fetchGameOptions } from '@/lib/api'
import { worldConfigSchema, type WorldConfigValues } from '@/lib/validations/new-game'
import { cn } from '@/lib/utils'

export function WorldConfigPanel() {
  const { user, isLoading: authLoading, logout } = useAuth()

  const form = useForm<WorldConfigValues>({
    resolver: zodResolver(worldConfigSchema),
    defaultValues: { durationId: '', multiplierId: '' },
  })

  const {
    setValue,
    control,
    formState: { errors },
  } = form

  const durationId = useWatch({ control, name: 'durationId' })
  const multiplierId = useWatch({ control, name: 'multiplierId' })

  const optionsQuery = useQuery({
    queryKey: ['game-options'],
    queryFn: fetchGameOptions,
    enabled: !!user && !authLoading,
  })

  const durations = React.useMemo(() => optionsQuery.data?.durations ?? [], [optionsQuery.data])
  const multipliers = React.useMemo(() => optionsQuery.data?.multipliers ?? [], [optionsQuery.data])

  React.useEffect(() => {
    if (durations.length > 0 && !durationId) {
      setValue('durationId', durations[0].key)
    }
    if (multipliers.length > 0 && !multiplierId) {
      setValue('multiplierId', multipliers[0].key)
    }
  }, [durations, multipliers, durationId, multiplierId, setValue])

  const [saving, setSaving] = React.useState(false)
  const [started, setStarted] = React.useState(false)

  async function handleStart() {
    const isValid = await form.trigger()
    if (!isValid) return

    setSaving(true)
    try {
      await createWorld({
        duration_key: durationId,
        multiplier_key: multiplierId,
      })
      setStarted(true)
      await logout()
    } catch (caught) {
      if (caught instanceof ApiError) {
        form.setError('root', { message: caught.message })
      } else {
        form.setError('root', {
          message: 'No se pudo iniciar el mundo. Inténtalo de nuevo.',
        })
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
          {durations.map((duration: GameOptionPayload) => {
            const selected = duration.key === durationId
            return (
              <button
                key={duration.key}
                type="button"
                onClick={() => {
                  setValue('durationId', duration.key, { shouldValidate: true })
                  form.clearErrors('root')
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
          {multipliers.map((multiplier: GameOptionPayload) => {
            const selected = multiplier.key === multiplierId
            return (
              <button
                key={multiplier.key}
                type="button"
                onClick={() => {
                  setValue('multiplierId', multiplier.key, { shouldValidate: true })
                  form.clearErrors('root')
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

      {errors.root && (
        <p className="text-destructive text-sm">{errors.root.message}</p>
      )}

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
