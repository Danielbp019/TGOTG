'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Castle,
  Droplets,
  Mountain,
  Pickaxe,
  TreePine,
  Wheat,
} from 'lucide-react'

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
import {
  ApiError,
  createCity,
  fetchRegionsCached,
  type RegionPayload,
} from '@/lib/api'
import { useCities } from '@/hooks/use-cities'
import {
  createCitySchema,
  type CreateCityValues,
} from '@/lib/validations/city'

interface CreateCityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CreateCityErrors = Partial<Record<keyof CreateCityValues, string>>

const initialValues: CreateCityValues = {
  nombre: '',
  region: '',
  bioma: '',
}

interface BiomeMeta {
  label: string
  bonus: string
  description: string
  icon: React.ElementType
  iconColor: string
}

const BIOME_META: Record<string, BiomeMeta> = {
  pradera: {
    label: 'Pradera',
    bonus: '+10 % comida',
    description: 'Llanuras fértiles ideales para granjas y pastos.',
    icon: Wheat,
    iconColor: 'text-forest',
  },
  bosque: {
    label: 'Bosque',
    bonus: '+10 % madera',
    description: 'Espesura interminable de robles y pinos.',
    icon: TreePine,
    iconColor: 'text-wine',
  },
  'montaña': {
    label: 'Montaña',
    bonus: '+10 % piedra',
    description: 'Picos rocosos ricos en canteras.',
    icon: Mountain,
    iconColor: 'text-stone',
  },
  colinaRica: {
    label: 'Colina rica',
    bonus: '+10 % hierro',
    description: 'Vetas profundas de mineral bajo las colinas.',
    icon: Pickaxe,
    iconColor: 'text-ink-soft',
  },
  costa: {
    label: 'Costa',
    bonus: '+10 % oro',
    description: 'Costas prósperas que atraen comercio y tributos.',
    icon: Droplets,
    iconColor: 'text-azure',
  },
}

const FALLBACK_BIOME_META: BiomeMeta = {
  label: '',
  bonus: '',
  description: '',
  icon: Castle,
  iconColor: 'text-muted-foreground',
}

function biomeMeta(key: string): BiomeMeta {
  return BIOME_META[key] ?? { ...FALLBACK_BIOME_META, label: key }
}

export function CreateCityDialog({ open, onOpenChange }: CreateCityDialogProps) {
  const router = useRouter()
  const { reload } = useCities()
  const [values, setValues] = React.useState<CreateCityValues>(initialValues)
  const [errors, setErrors] = React.useState<CreateCityErrors>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const [regions, setRegions] = React.useState<RegionPayload[]>([])
  const [regionsError, setRegionsError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const selectedRegion = regions.find((r) => r.id === values.region) ?? null

  async function loadRegions() {
    setRegionsError(null)
    try {
      const response = await fetchRegionsCached()
      setRegions(response.regions)
    } catch {
      setRegionsError('No se pudieron cargar las regiones.')
    }
  }

  React.useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => {
      void loadRegions()
    }, 0)
    return () => window.clearTimeout(t)
  }, [open])

  function reset() {
    setValues(initialValues)
    setErrors({})
    setFormError(null)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset()
    }
    onOpenChange(next)
  }

  function handleField(field: keyof CreateCityValues, value: string) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'region' ? { bioma: '' } : {}),
    }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const result = createCitySchema.safeParse(values)
    if (!result.success) {
      const issueFor = (field: string) =>
        result.error.issues.find((issue) => issue.path.join('.') === field)
          ?.message
      setErrors({
        nombre: issueFor('nombre'),
        region: issueFor('region'),
        bioma: issueFor('bioma'),
      })
      return
    }

    const regionId = values.region
    const biomeId = values.bioma

    setSubmitting(true)
    setFormError(null)
    try {
      const response = await createCity({
        name: result.data.nombre,
        region_id: regionId,
        biome_id: biomeId,
      })
      await reload()
      handleOpenChange(false)
      router.push(`/ciudad/${response.city.id}`)
    } catch (caught) {
      if (caught instanceof ApiError) {
        setFormError(caught.message)
        setErrors({
          nombre: caught.errors.name?.[0],
          region: caught.errors.region_id?.[0],
          bioma: caught.errors.biome_id?.[0],
        })
      } else {
        setFormError('No se pudo crear la ciudad. Inténtalo de nuevo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear nueva ciudad</DialogTitle>
          <DialogDescription>
            Elige el nombre y el territorio donde se asentará tu nueva ciudad.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <div className="bg-muted flex h-48 items-center justify-center rounded-xl border text-sm font-medium">
            mapa aquí
          </div>

          <div className="grid gap-2">
            <Label htmlFor="create-city-nombre">Nombre de la ciudad</Label>
            <Input
              id="create-city-nombre"
              value={values.nombre}
              onChange={(e) => handleField('nombre', e.target.value)}
              placeholder="Ej. Nueva Aurora"
              maxLength={30}
              aria-invalid={Boolean(errors.nombre)}
            />
            {errors.nombre ? (
              <p className="text-destructive text-xs">{errors.nombre}</p>
            ) : (
              <p className="text-muted-foreground text-xs">Máximo 30 caracteres.</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Región</Label>
            {regionsError ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                <p className="text-destructive text-xs">{regionsError}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void loadRegions()}
                >
                  Reintentar
                </Button>
              </div>
            ) : regions.length === 0 ? (
              <p className="text-muted-foreground text-xs">Cargando regiones…</p>
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
              <p className="text-destructive text-xs">{errors.region}</p>
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
                        <span className="text-sm font-medium">{meta.label}</span>
                      </span>
                      {meta.bonus && (
                        <span className="text-primary text-xs font-medium">
                          {meta.bonus}
                        </span>
                      )}
                      {meta.description && (
                        <span className="text-muted-foreground text-xs leading-relaxed">
                          {meta.description}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
            {errors.bioma && (
              <p className="text-destructive text-xs">{errors.bioma}</p>
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
              disabled={submitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Fundando…' : 'Crear ciudad'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
