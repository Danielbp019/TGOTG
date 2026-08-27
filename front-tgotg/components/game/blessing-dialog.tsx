'use client'

import * as React from 'react'
import { Check, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { blessingIcons } from '@/data/icons'
import { useAuth } from '@/components/auth/auth-provider'
import { useMyBlessing } from '@/hooks/use-my-blessing'
import type { BlessingPayload } from '@/lib/api'
import { fetchBlessings } from '@/lib/api'
import { blessingSchema } from '@/lib/validations/new-game'
import { cn } from '@/lib/utils'

export function BlessingDialog() {
  const { user, isLoading: authLoading } = useAuth()
  const { blessing: myBlessing, inGame, hasLoaded, selectBlessing, isSaving } =
    useMyBlessing()
  const [open, setOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string | undefined>()
  const [error, setError] = React.useState<string | undefined>()

  const blessingsQuery = useQuery({
    queryKey: ['blessings'],
    queryFn: () => fetchBlessings(),
    enabled: !!user && !authLoading,
    select: (data) => data.blessings,
  })

  const blessings = blessingsQuery.data ?? []

  React.useEffect(() => {
    if (authLoading || !user || !hasLoaded) return
    if (!inGame || myBlessing) return

    const t = window.setTimeout(() => setOpen(true), 0)
    return () => window.clearTimeout(t)
  }, [authLoading, user, hasLoaded, inGame, myBlessing])

  function handleOpenChange(next: boolean) {
    if (next) return
    setOpen(false)
  }

  async function handleConfirm() {
    if (!selectedId) return
    const result = blessingSchema.safeParse({ blessingId: selectedId })
    if (!result.success) {
      setError(result.error.issues[0]?.message)
      return
    }

    setError(undefined)
    try {
      await selectBlessing(selectedId)
      setOpen(false)
    } catch (caught) {
      if (caught instanceof Error) {
        setError(caught.message)
      } else {
        setError('No se pudo guardar la bendición. Inténtalo de nuevo.')
      }
    }
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
          {blessings.map((blessing: BlessingPayload) => {
            const selected = selectedId === blessing.key
            const Icon = blessingIcons[blessing.key]
            return (
              <button
                key={blessing.key}
                type="button"
                onClick={() => {
                  setSelectedId(blessing.key)
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
                  {Icon && <Icon className="size-5 shrink-0" />}
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
          <Button onClick={handleConfirm} disabled={isSaving} className="w-full">
            {isSaving ? 'Guardando bendición…' : 'Aceptar bendición'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
