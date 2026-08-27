'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClan } from '@/lib/api'
import { createClanSchema, type CreateClanValues } from '@/lib/validations/clans'
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

interface ClanCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ClanCreateErrors = Partial<Record<keyof CreateClanValues, string>>

const initialValues: CreateClanValues = {
  name: '',
  acronym: '',
}

export function ClanCreateDialog({ open, onOpenChange }: ClanCreateDialogProps) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<CreateClanValues>(initialValues)
  const [errors, setErrors] = useState<ClanCreateErrors>({})

  const createMutation = useMutation({
    mutationFn: createClan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-clan'] })
      queryClient.invalidateQueries({ queryKey: ['clans'] })
      reset()
      onOpenChange(false)
    },
    onError: (error: Error) => {
      setErrors({ name: error.message })
    },
  })

  function reset() {
    setValues(initialValues)
    setErrors({})
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  function handleField(field: keyof CreateClanValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = createClanSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: ClanCreateErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreateClanValues
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    createMutation.mutate(result.data)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear clan</DialogTitle>
          <DialogDescription>
            Crea un nuevo clan con un nombre y siglas únicas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="clan-name">Nombre del clan</Label>
            <Input
              id="clan-name"
              value={values.name}
              onChange={(event) => handleField('name', event.target.value)}
              aria-invalid={Boolean(errors.name)}
              placeholder="Ej: Guerreros del Alba"
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="clan-acronym">Siglas (3-5 caracteres)</Label>
            <Input
              id="clan-acronym"
              value={values.acronym}
              onChange={(event) =>
                handleField('acronym', event.target.value.toUpperCase())
              }
              aria-invalid={Boolean(errors.acronym)}
              placeholder="Ej: GDA"
              maxLength={5}
            />
            {errors.acronym && (
              <p className="text-destructive text-xs">{errors.acronym}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear clan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
