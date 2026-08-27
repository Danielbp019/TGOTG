'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transferResources } from '@/lib/api'
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
import type { ClanMember } from '@/types'

interface ResourceTransferDialogProps {
  recipient: ClanMember
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResourceTransferDialog({
  recipient,
  open,
  onOpenChange,
}: ResourceTransferDialogProps) {
  const queryClient = useQueryClient()
  const [resources, setResources] = useState({
    gold: 0,
    wood: 0,
    stone: 0,
    iron: 0,
    food: 0,
  })
  const [error, setError] = useState<string | null>(null)

  const transferMutation = useMutation({
    mutationFn: () =>
      transferResources({
        recipient_player_id: recipient.id,
        ...resources,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resources'] })
      setResources({ gold: 0, wood: 0, stone: 0, iron: 0, food: 0 })
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  function handleOpenChange(next: boolean) {
    if (!next) {
      setResources({ gold: 0, wood: 0, stone: 0, iron: 0, food: 0 })
      setError(null)
    }
    onOpenChange(next)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const totalAmount = Object.values(resources).reduce((a, b) => a + b, 0)
    if (totalAmount === 0) {
      setError('Debes enviar al menos un recurso.')
      return
    }

    transferMutation.mutate()
  }

  function handleResourceChange(resource: string, value: string) {
    const numValue = parseInt(value) || 0
    setResources((prev) => ({ ...prev, [resource]: Math.max(0, numValue) }))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar recursos</DialogTitle>
          <DialogDescription>
            Envía recursos a {recipient.nick}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gold">Oro</Label>
              <Input
                id="gold"
                type="number"
                min={0}
                value={resources.gold || ''}
                onChange={(event) =>
                  handleResourceChange('gold', event.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wood">Madera</Label>
              <Input
                id="wood"
                type="number"
                min={0}
                value={resources.wood || ''}
                onChange={(event) =>
                  handleResourceChange('wood', event.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stone">Piedra</Label>
              <Input
                id="stone"
                type="number"
                min={0}
                value={resources.stone || ''}
                onChange={(event) =>
                  handleResourceChange('stone', event.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="iron">Hierro</Label>
              <Input
                id="iron"
                type="number"
                min={0}
                value={resources.iron || ''}
                onChange={(event) =>
                  handleResourceChange('iron', event.target.value)
                }
              />
            </div>
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="food">Comida</Label>
              <Input
                id="food"
                type="number"
                min={0}
                value={resources.food || ''}
                onChange={(event) =>
                  handleResourceChange('food', event.target.value)
                }
              />
            </div>
          </div>

          {error && <p className="text-destructive text-xs">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={transferMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={transferMutation.isPending}>
              {transferMutation.isPending ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
