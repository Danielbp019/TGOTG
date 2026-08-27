'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transferResources } from '@/lib/api'
import { transferResourcesSchema, type TransferResourcesValues } from '@/lib/validations/clans'
import { FormDialog } from '@/components/ui/form-dialog'
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

  const form = useForm<TransferResourcesValues>({
    resolver: zodResolver(transferResourcesSchema),
    defaultValues: { gold: 0, wood: 0, stone: 0, iron: 0, food: 0 },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  const transferMutation = useMutation({
    mutationFn: (data: TransferResourcesValues) =>
      transferResources({
        recipient_player_id: recipient.id,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-resources'] })
      reset()
      onOpenChange(false)
    },
  })

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  function validateAndSubmit(data: TransferResourcesValues) {
    const totalAmount = Object.values(data).reduce((a, b) => a + (b ?? 0), 0)
    if (totalAmount === 0) {
      form.setError('root', { message: 'Debes enviar al menos un recurso.' })
      return
    }
    transferMutation.mutate(data)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Enviar recursos"
      description={`Envía recursos a ${recipient.nick}.`}
      onSubmit={handleSubmit(validateAndSubmit)}
      submitLabel="Enviar"
      submitLoadingLabel="Enviando..."
      isPending={transferMutation.isPending}
      error={errors.root?.message ?? transferMutation.error?.message ?? null}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="gold">Oro</Label>
          <Input
            id="gold"
            type="number"
            min={0}
            {...register('gold', { valueAsNumber: true })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="wood">Madera</Label>
          <Input
            id="wood"
            type="number"
            min={0}
            {...register('wood', { valueAsNumber: true })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stone">Piedra</Label>
          <Input
            id="stone"
            type="number"
            min={0}
            {...register('stone', { valueAsNumber: true })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="iron">Hierro</Label>
          <Input
            id="iron"
            type="number"
            min={0}
            {...register('iron', { valueAsNumber: true })}
          />
        </div>
        <div className="grid gap-2 col-span-2">
          <Label htmlFor="food">Comida</Label>
          <Input
            id="food"
            type="number"
            min={0}
            {...register('food', { valueAsNumber: true })}
          />
        </div>
      </div>
    </FormDialog>
  )
}
