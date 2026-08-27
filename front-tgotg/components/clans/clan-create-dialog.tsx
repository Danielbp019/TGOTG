'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClan } from '@/lib/api'
import { createClanSchema, type CreateClanValues } from '@/lib/validations/clans'
import { FormDialog } from '@/components/ui/form-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ClanCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClanCreateDialog({ open, onOpenChange }: ClanCreateDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<CreateClanValues>({
    resolver: zodResolver(createClanSchema),
    defaultValues: { name: '', acronym: '' },
  })

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = form

  const createMutation = useMutation({
    mutationFn: createClan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-clan'] })
      queryClient.invalidateQueries({ queryKey: ['clans'] })
      reset()
      onOpenChange(false)
    },
    onError: (error: Error) => {
      setError('name', { message: error.message })
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
      title="Crear clan"
      description="Crea un nuevo clan con un nombre y siglas únicas."
      onSubmit={handleSubmit((data) => createMutation.mutate(data))}
      submitLabel="Crear clan"
      submitLoadingLabel="Creando..."
      isPending={createMutation.isPending}
    >
      <div className="grid gap-2">
        <Label htmlFor="clan-name">Nombre del clan</Label>
        <Input
          id="clan-name"
          {...register('name')}
          aria-invalid={Boolean(errors.name)}
          placeholder="Ej: Guerreros del Alba"
        />
        {errors.name && (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="clan-acronym">Siglas (3-5 caracteres)</Label>
        <Input
          id="clan-acronym"
          {...register('name')}
          onChange={(e) => {
            const upper = e.target.value.toUpperCase()
            form.setValue('acronym', upper, { shouldValidate: true })
          }}
          aria-invalid={Boolean(errors.acronym)}
          placeholder="Ej: GDA"
          maxLength={5}
        />
        {errors.acronym && (
          <p className="text-destructive text-xs">{errors.acronym.message}</p>
        )}
      </div>
    </FormDialog>
  )
}
