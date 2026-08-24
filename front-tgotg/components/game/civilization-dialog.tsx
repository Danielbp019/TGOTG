'use client'

import * as React from 'react'
import { Check, Landmark } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { civilizationIcons } from '@/data/icons'
import { useAuth } from '@/components/auth/auth-provider'
import type { CivilizationPayload } from '@/lib/api'
import {
  ApiError,
  fetchCivilizationsCached,
  fetchMyCivilization,
  updateMyCivilization,
} from '@/lib/api'
import { notifyBlessingChanged } from '@/lib/blessing'
import { civilizationSchema } from '@/lib/validations/new-game'
import { cn } from '@/lib/utils'

export function CivilizationDialog() {
  const { user, isLoading: authLoading } = useAuth()
  const [open, setOpen] = React.useState(false)
  const [civilizations, setCivilizations] = React.useState<
    CivilizationPayload[]
  >([])
  const [selectedId, setSelectedId] = React.useState<string | undefined>()
  const [error, setError] = React.useState<string | undefined>()
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (authLoading || !user) return
    let active = true

    fetchCivilizationsCached()
      .then((response) => {
        if (!active) return
        setCivilizations(response.civilizations)
      })
      .catch(() => {})

    fetchMyCivilization()
      .then((response) => {
        if (!active) return
        if (!response.in_game || response.civilization) return
        setOpen(true)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [authLoading, user])

  function handleOpenChange(next: boolean) {
    if (next) return
    setOpen(false)
  }

  async function handleConfirm() {
    if (!selectedId) return
    const result = civilizationSchema.safeParse({ civilizationId: selectedId })
    if (!result.success) {
      setError(result.error.issues[0]?.message)
      return
    }

    setSaving(true)
    setError(undefined)
    try {
      await updateMyCivilization(selectedId)
      notifyBlessingChanged()
      setOpen(false)
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.errors.key?.[0] ?? caught.message)
      } else {
        setError('No se pudo guardar la civilización. Inténtalo de nuevo.')
      }
    } finally {
      setSaving(false)
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
            <Landmark className="text-primary size-4" />
            Elige tu pueblo
          </DialogTitle>
          <DialogDescription>
            Cada civilización otorga un bono permanente a tu pueblo durante toda
            la partida. Esta decisión no se puede cambiar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {civilizations.map((civilization) => {
            const selected = selectedId === civilization.key
            const Icon = civilizationIcons[civilization.key]
            return (
              <button
                key={civilization.key}
                type="button"
                onClick={() => {
                  setSelectedId(civilization.key)
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
                  {civilization.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {civilization.description}
                </span>
                <span className="text-primary text-xs font-medium">
                  {civilization.benefit}
                </span>
              </button>
            )
          })}
        </div>

        {error && <p className="text-destructive text-xs">{error}</p>}

        <DialogFooter showCloseButton={false}>
          <Button onClick={handleConfirm} disabled={saving} className="w-full">
            {saving ? 'Eligiendo pueblo…' : 'Fundar mi civilización'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
