'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { joinClan } from '@/lib/api'
import { joinClanSchema } from '@/lib/validations/clans'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Clan } from '@/types'

interface ClanJoinFormProps {
  clan: Clan
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClanJoinForm({ clan, open, onOpenChange }: ClanJoinFormProps) {
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const joinMutation = useMutation({
    mutationFn: () => joinClan(clan.id, message || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-clan'] })
      setMessage('')
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  function handleOpenChange(next: boolean) {
    if (!next) {
      setMessage('')
      setError(null)
    }
    onOpenChange(next)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const result = joinClanSchema.safeParse({ message })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Error de validación')
      return
    }

    joinMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unirse a {clan.name}</DialogTitle>
          <DialogDescription>
            Envía una solicitud para unirte al clan [{clan.acronym}].
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="join-message">Mensaje (opcional)</Label>
            <Textarea
              id="join-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="¿Por qué quieres unirte?"
              className="min-h-[100px]"
            />
          </div>

          {error && <p className="text-destructive text-xs">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={joinMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={joinMutation.isPending}>
              {joinMutation.isPending ? 'Enviando...' : 'Enviar solicitud'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
