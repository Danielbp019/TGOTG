'use client'

import * as React from 'react'
import { Droplets, Mountain, Pickaxe, TreePine, Wheat } from 'lucide-react'

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CreateCityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const biomes = [
  {
    key: 'pradera',
    label: 'Pradera',
    bonus: '+10 % comida',
    description: 'Llanuras fértiles ideales para granjas y pastos.',
    icon: Wheat,
    iconColor: 'text-forest',
  },
  {
    key: 'bosque',
    label: 'Bosque',
    bonus: '+10 % madera',
    description: 'Espesura interminable de robles y pinos.',
    icon: TreePine,
    iconColor: 'text-wine',
  },
  {
    key: 'montana',
    label: 'Montaña',
    bonus: '+10 % piedra',
    description: 'Picos rocosos ricos en canteras.',
    icon: Mountain,
    iconColor: 'text-stone',
  },
  {
    key: 'colina-rica',
    label: 'Colina rica',
    bonus: '+10 % hierro',
    description: 'Vetas profundas de mineral bajo las colinas.',
    icon: Pickaxe,
    iconColor: 'text-ink-soft',
  },
  {
    key: 'costa',
    label: 'Costa',
    bonus: '+10 % oro',
    description: 'Costas prósperas que atraen comercio y tributos.',
    icon: Droplets,
    iconColor: 'text-azure',
  },
] as const

export function CreateCityDialog({ open, onOpenChange }: CreateCityDialogProps) {
  const [nombre, setNombre] = React.useState('')
  const [region, setRegion] = React.useState('')
  const [bioma, setBioma] = React.useState('')

  function handleOpenChange(next: boolean) {
    if (!next) {
      setNombre('')
      setRegion('')
      setBioma('')
    }
    onOpenChange(next)
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

        <div className="grid gap-4">
          <div className="bg-muted flex h-48 items-center justify-center rounded-xl border text-sm font-medium">
            mapa aquí
          </div>

          <div className="grid gap-2">
            <Label htmlFor="create-city-nombre">Nombre de la ciudad</Label>
            <Input
              id="create-city-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Nueva Aurora"
              maxLength={30}
            />
            <p className="text-muted-foreground text-xs">Máximo 30 caracteres.</p>
          </div>

          <div className="grid gap-2">
            <Label>Región</Label>
            <p className="text-muted-foreground text-xs">
              Regiones fijas — se definirán próximamente.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(['Norte', 'Sur', 'Este', 'Oeste', 'Centro'] as const).map((r) => {
                const selected = region === r
                return (
                  <button
                    key={r}
                    type="button"
                    disabled
                    onClick={() => setRegion(r)}
                    aria-pressed={selected}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm font-medium opacity-60',
                      selected ? 'border-primary bg-primary/5 ring-2' : 'border-border'
                    )}
                  >
                    {r}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Bioma</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {biomes.map((b) => {
                const selected = bioma === b.key
                return (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setBioma(b.key)}
                    aria-pressed={selected}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors',
                      selected
                        ? 'border-primary bg-primary/5 ring-2'
                        : 'border-border hover:bg-muted'
                    )}
                  >
                    <b.icon className={cn('size-5', b.iconColor)} />
                    <span className="text-sm font-medium">{b.label}</span>
                    <span className="text-primary text-xs font-medium">{b.bonus}</span>
                    <span className="text-muted-foreground text-xs leading-relaxed">
                      {b.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Biomas</CardTitle>
              <CardDescription>
                Cada bioma otorga un bono de producción en su recurso asociado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Wheat className="text-forest size-4" /> Pradera
                  </span>
                  <span className="text-muted-foreground">+10 % comida</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TreePine className="text-wine size-4" /> Bosque
                  </span>
                  <span className="text-muted-foreground">+10 % madera</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Mountain className="text-stone size-4" /> Montaña
                  </span>
                  <span className="text-muted-foreground">+10 % piedra</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Pickaxe className="text-ink-soft size-4" /> Colina rica
                  </span>
                  <span className="text-muted-foreground">+10 % hierro</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Droplets className="text-azure size-4" /> Costa
                  </span>
                  <span className="text-muted-foreground">+10 % oro</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => handleOpenChange(false)}>
            Crear ciudad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
