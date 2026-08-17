'use client'

import * as React from 'react'
import { Check, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { godBlessings } from '@/data/new-game'
import { getSavedBlessing, saveBlessing } from '@/lib/blessing'
import { blessingSchema } from '@/lib/validations/new-game'
import { cn } from '@/lib/utils'

export function BlessingDialog() {
  const [open, setOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string | undefined>()
  const [error, setError] = React.useState<string | undefined>()

  React.useEffect(() => {
    if (getSavedBlessing()) return
    const timer = window.setTimeout(() => setOpen(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  function handleOpenChange(next: boolean) {
    if (next) return
    if (getSavedBlessing()) setOpen(false)
  }

  function handleConfirm() {
    const result = blessingSchema.safeParse({ blessingId: selectedId })
    if (!result.success) {
      setError(result.error.issues[0]?.message)
      return
    }
    saveBlessing(selectedId ?? '')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary size-4" />
            Bienvenido, dios
          </DialogTitle>
          <DialogDescription>
            Has sido elegido para guiar una civilización en la gran guerra.
            Antes de comenzar, elige la bendición que acompañará a tu pueblo
            durante toda la partida. Esta decisión es permanente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {godBlessings.map((blessing) => {
            const selected = selectedId === blessing.id
            return (
              <button
                key={blessing.id}
                type="button"
                onClick={() => {
                  setSelectedId(blessing.id)
                  setError(undefined)
                }}
                aria-pressed={selected}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors',
                  selected
                    ? 'border-primary bg-primary/5 ring-primary ring-2'
                    : 'border-border hover:bg-muted'
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <blessing.icon className="size-5 shrink-0" />
                  {selected && <Check className="text-primary size-4" />}
                </div>
                <span className="font-heading text-sm font-medium">
                  {blessing.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {blessing.description}
                </span>
                <span className="text-primary text-xs font-medium">
                  {blessing.benefit}
                </span>
              </button>
            )
          })}
        </div>

        {error && <p className="text-destructive text-xs">{error}</p>}

        <DialogFooter showCloseButton={false}>
          <Button onClick={handleConfirm} className="w-full">
            Aceptar bendición
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
