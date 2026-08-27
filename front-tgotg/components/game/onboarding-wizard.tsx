'use client'

import * as React from 'react'
import { Check, Sparkles } from 'lucide-react'
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
import { blessingIcons, civilizationIcons } from '@/data/icons'
import { useAuth } from '@/components/auth/auth-provider'
import { useMyBlessing } from '@/hooks/use-my-blessing'
import type { BlessingPayload, CivilizationPayload } from '@/lib/api'
import {
  fetchBlessings,
  fetchCivilizations,
  fetchMyCivilization,
  updateMyCivilization,
} from '@/lib/api'
import { blessingSchema, civilizationSchema } from '@/lib/validations/new-game'
import { cn } from '@/lib/utils'

export function OnboardingWizard() {
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const {
    blessing: myBlessing,
    inGame,
    hasLoaded,
    selectBlessing,
    isSaving: isSavingBlessing,
  } = useMyBlessing()

  const [open, setOpen] = React.useState(false)
  const [selectedBlessing, setSelectedBlessing] = React.useState<string>()
  const [selectedCiv, setSelectedCiv] = React.useState<string>()
  const [error, setError] = React.useState<string>()

  const blessingsQuery = useQuery({
    queryKey: ['blessings'],
    queryFn: () => fetchBlessings(),
    enabled: !!user && !authLoading,
    select: (data) => data.blessings,
  })

  const myCivQuery = useQuery({
    queryKey: ['player-civilization'],
    queryFn: () => fetchMyCivilization(),
    enabled: !!user && !authLoading,
  })

  const civilizationsQuery = useQuery({
    queryKey: ['civilizations'],
    queryFn: () => fetchCivilizations(),
    enabled: !!user && !authLoading,
    select: (data) => data.civilizations,
  })

  const blessings = blessingsQuery.data ?? []
  const civilizations = civilizationsQuery.data ?? []

  const saveCivMutation = useMutation({
    mutationFn: (key: string) => updateMyCivilization(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-civilization'] })
      queryClient.invalidateQueries({
        queryKey: ['player-blessing', user?.id ?? null],
      })
      queryClient.invalidateQueries({
        queryKey: ['player-resources', user?.id ?? null],
      })
    },
  })

  const isSaving = isSavingBlessing || saveCivMutation.isPending

  React.useEffect(() => {
    if (authLoading || !user || !hasLoaded) return
    if (!inGame) return

    const civData = myCivQuery.data
    const needsBlessing = !myBlessing
    const needsCiv = civData !== undefined && !civData.civilization

    if (!needsBlessing && !needsCiv) return

    const t = window.setTimeout(() => setOpen(true), 0)
    return () => window.clearTimeout(t)
  }, [authLoading, user, hasLoaded, inGame, myBlessing, myCivQuery.data])

  function handleOpenChange(next: boolean) {
    if (next) return
    setOpen(false)
  }

  async function handleConfirm() {
    if (!selectedBlessing || !selectedCiv) return

    const bResult = blessingSchema.safeParse({ blessingId: selectedBlessing })
    if (!bResult.success) {
      setError(bResult.error.issues[0]?.message)
      return
    }
    const cResult = civilizationSchema.safeParse({ civilizationId: selectedCiv })
    if (!cResult.success) {
      setError(cResult.error.issues[0]?.message)
      return
    }

    setError(undefined)
    try {
      await Promise.all([
        selectBlessing(selectedBlessing),
        saveCivMutation.mutateAsync(selectedCiv),
      ])
      setOpen(false)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'No se pudo guardar tu elección. Inténtalo de nuevo.'
      )
    }
  }

  const needsBlessing = !myBlessing
  const needsCiv =
    myCivQuery.data !== undefined && !myCivQuery.data.civilization

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary size-4" />
            Bienvenido, dios
          </DialogTitle>
          <DialogDescription>
            Has sido elegido para guiar una civilización en la gran guerra.
            Elige la bendición que acompañará a tu pueblo y la civilización que
            fundarás. Ambas decisiones son permanentes.
          </DialogDescription>
        </DialogHeader>

        {needsBlessing && (
          <div className="grid gap-2">
            <p className="text-foreground text-sm font-medium">Bendición</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {blessings.map((blessing: BlessingPayload) => {
                const selected = selectedBlessing === blessing.key
                const Icon = blessingIcons[blessing.key]
                return (
                  <button
                    key={blessing.key}
                    type="button"
                    onClick={() => {
                      setSelectedBlessing(blessing.key)
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
          </div>
        )}

        {needsCiv && (
          <div className="grid gap-2">
            <p className="text-foreground text-sm font-medium">Civilización</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {civilizations.map((civilization: CivilizationPayload) => {
                const selected = selectedCiv === civilization.key
                const Icon = civilizationIcons[civilization.key]
                return (
                  <button
                    key={civilization.key}
                    type="button"
                    onClick={() => {
                      setSelectedCiv(civilization.key)
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
          </div>
        )}

        {error && <p className="text-destructive text-xs">{error}</p>}

        <DialogFooter showCloseButton={false}>
          <Button
            onClick={handleConfirm}
            disabled={isSaving || !selectedBlessing || !selectedCiv}
            className="w-full"
          >
            {isSaving ? 'Guardando…' : 'Comenzar mi reino'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
