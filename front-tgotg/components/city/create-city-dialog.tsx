'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { biomeBonusLabel, biomeMeta } from '@/data/biomes'
import { ApiError, createCity, fetchRegions } from '@/lib/api'
import {
  createCitySchema,
  type CreateCityValues,
} from '@/lib/validations/city'

interface CreateCityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCityDialog({ open, onOpenChange }: CreateCityDialogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<CreateCityValues>({
    resolver: zodResolver(createCitySchema),
    defaultValues: { nombre: '', region: '', bioma: '' },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = form

  const [formError, setFormError] = React.useState<string | null>(null)
  const values = watch()

  const regionsQuery = useQuery({
    queryKey: ['regions'],
    queryFn: () => fetchRegions(),
    enabled: open,
    select: (data) => data.regions,
  })

  const regions = regionsQuery.data ?? []
  const selectedRegion = regions.find((r) => r.id === values.region) ?? null

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset()
      setFormError(null)
    }
    onOpenChange(next)
  }

  function handleField(field: keyof CreateCityValues, value: string) {
    setValue(field, value, { shouldValidate: true })
    if (field === 'region') {
      setValue('bioma', '', { shouldValidate: false })
    }
  }

  const submitMutation = useMutation({
    mutationFn: (data: { name: string; region_id: string; biome_id: string }) =>
      createCity(data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['cities'] })
      handleOpenChange(false)
      router.push(`/ciudad/${response.city.id}`)
    },
    onError: (caught) => {
      if (caught instanceof ApiError) {
        setFormError(caught.message)
        if (caught.errors.name) setFieldError('nombre', { message: caught.errors.name[0] })
        if (caught.errors.region_id) setFieldError('region', { message: caught.errors.region_id[0] })
        if (caught.errors.biome_id) setFieldError('bioma', { message: caught.errors.biome_id[0] })
      } else {
        setFormError('No se pudo crear la ciudad. Inténtalo de nuevo.')
      }
    },
  })

  function onSubmit(data: CreateCityValues) {
    setFormError(null)
    submitMutation.mutate({
      name: data.nombre,
      region_id: data.region,
      biome_id: data.bioma,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crear nueva ciudad</DialogTitle>
          <DialogDescription>
            Elige el nombre y el territorio donde se asentará tu nueva ciudad.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <figure className="ring-foreground/10 overflow-hidden rounded-xl ring-1">
            <Image
              src="/game/maps/mapaGlobal2048x1024.jpg"
              alt="Mapa del mundo conocido"
              width={2048}
              height={1024}
              className="block h-auto w-full"
            />
          </figure>

          <div className="grid gap-2">
            <Label htmlFor="create-city-nombre">Nombre de la ciudad</Label>
            <Input
              id="create-city-nombre"
              {...register('nombre')}
              placeholder="Ej. Nueva Aurora"
              maxLength={30}
              aria-invalid={Boolean(errors.nombre)}
            />
            {errors.nombre ? (
              <p className="text-destructive text-xs">{errors.nombre.message}</p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Máximo 30 caracteres.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Región</Label>
            {regionsQuery.isError ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                <p className="text-destructive text-xs">
                  No se pudieron cargar las regiones.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => regionsQuery.refetch()}
                >
                  Reintentar
                </Button>
              </div>
            ) : regions.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                Cargando regiones…
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {regions.map((r) => {
                  const selected = values.region === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleField('region', r.id)}
                      aria-pressed={selected}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        selected
                          ? 'border-primary bg-primary/5 ring-2'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {r.label}
                    </button>
                  )
                })}
              </div>
            )}
            {errors.region && (
              <p className="text-destructive text-xs">{errors.region.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Bioma</Label>
            {!selectedRegion ? (
              <p className="text-muted-foreground text-xs">
                Selecciona primero una región para ver sus biomas.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {selectedRegion.biomes.map((b) => {
                  const meta = biomeMeta(b.key)
                  const selected = values.bioma === b.id
                  const Icon = meta.icon
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleField('bioma', b.id)}
                      aria-pressed={selected}
                      className={cn(
                        'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors',
                        selected
                          ? 'border-primary bg-primary/5 ring-2'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className={cn('size-5', meta.iconColor)} />
                        <span className="text-sm font-medium">
                          {b.label || meta.label}
                        </span>
                      </span>
                      <span className="text-primary text-xs font-medium">
                        {biomeBonusLabel(b.bonusResource, b.bonusValue)}
                      </span>
                      {(b.description || meta.description) && (
                        <span className="text-muted-foreground text-xs leading-relaxed">
                          {b.description || meta.description}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
            {errors.bioma && (
              <p className="text-destructive text-xs">{errors.bioma.message}</p>
            )}
          </div>

          {formError && (
            <p className="text-destructive text-sm" role="alert">
              {formError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Fundando…' : 'Crear ciudad'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
