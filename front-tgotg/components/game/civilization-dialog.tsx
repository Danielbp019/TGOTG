'use client'

import * as React from 'react'
import { Check, Landmark } from 'lucide-react'
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
import { civilizationIcons } from '@/data/icons'
import { useAuth } from '@/components/auth/auth-provider'
import type { CivilizationPayload } from '@/lib/api'
import {
  fetchCivilizations,
  fetchMyCivilization,
  updateMyCivilization,
} from '@/lib/api'
import { civilizationSchema } from '@/lib/validations/new-game'
import { cn } from '@/lib/utils'

export function CivilizationDialog() {
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string | undefined>()
  const [error, setError] = React.useState<string | undefined>()

  const civilizationsQuery = useQuery({
    queryKey: ['civilizations'],
    queryFn: () => fetchCivilizations(),
    enabled: !!user && !authLoading,
    select: (data) => data.civilizations,
  })

  const myCivQuery = useQuery({
    queryKey: ['player-civilization'],
    queryFn: () => fetchMyCivilization(),
    enabled: !!user && !authLoading,
  })

  const civilizations = civilizationsQuery.data ?? []

  React.useEffect(() => {
    if (authLoading || !user) return
    const data = myCivQuery.data
    if (!data) return
    if (!data.in_game || data.civilization) return
    const t = window.setTimeout(() => setOpen(true), 0)
    return () => window.clearTimeout(t)
  }, [authLoading, user, myCivQuery.data])

  const saveMutation = useMutation({
    mutationFn: (key: string) => updateMyCivilization(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-civilization'] })
      queryClient.invalidateQueries({ queryKey: ['player-blessing', user?.id ?? null] })
      queryClient.invalidateQueries({ queryKey: ['player-resources', user?.id ?? null] })
    },
  })

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

    setError(undefined)
    try {
      await saveMutation.mutateAsync(selectedId)
      setOpen(false)
    } catch (caught) {
      if (caught instanceof Error) {
        setError(caught.message)
      } else {
        setError('No se pudo guardar la civilización. Inténtalo de nuevo.')
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
            <Landmark className="text-primary size-4" />
            Elige tu pueblo
          </DialogTitle>
          <DialogDescription>
            Cada civilización otorga un bono permanente a tu pueblo durante toda
            la partida. Esta decisión no se puede cambiar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {civilizations.map((civilization: CivilizationPayload) => {
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
          <Button
            onClick={handleConfirm}
            disabled={saveMutation.isPending}
            className="w-full"
          >
            {saveMutation.isPending
              ? 'Eligiendo pueblo…'
              : 'Fundar mi civilización'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
