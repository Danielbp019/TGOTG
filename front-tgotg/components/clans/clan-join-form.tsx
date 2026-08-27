'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { joinClan } from '@/lib/api'
import { joinClanSchema, type JoinClanValues } from '@/lib/validations/clans'
import { FormDialog } from '@/components/ui/form-dialog'
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

  const form = useForm<JoinClanValues>({
    resolver: zodResolver(joinClanSchema),
    defaultValues: { message: '' },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  const joinMutation = useMutation({
    mutationFn: (data: JoinClanValues) =>
      joinClan(clan.id, data.message || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-clan'] })
      reset()
      onOpenChange(false)
    },
  })

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={`Unirse a ${clan.name}`}
      description={`Envía una solicitud para unirte al clan [${clan.acronym}].`}
      onSubmit={handleSubmit((data) => joinMutation.mutate(data))}
      submitLabel="Enviar solicitud"
      submitLoadingLabel="Enviando..."
      isPending={joinMutation.isPending}
      error={joinMutation.error?.message ?? null}
    >
      <div className="grid gap-2">
        <Label htmlFor="join-message">Mensaje (opcional)</Label>
        <Textarea
          id="join-message"
          {...register('message')}
          placeholder="¿Por qué quieres unirte?"
          className="min-h-[100px]"
        />
        {errors.message && (
          <p className="text-destructive text-xs">{errors.message.message}</p>
        )}
      </div>
    </FormDialog>
  )
}
