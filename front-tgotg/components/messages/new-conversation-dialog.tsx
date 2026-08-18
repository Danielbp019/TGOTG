'use client'

import * as React from 'react'

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
import {
  newConversationSchema,
  type NewConversationValues,
} from '@/lib/validations/messages'

interface NewConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (values: NewConversationValues) => Promise<string | null>
}

type NewConversationErrors = Partial<
  Record<keyof NewConversationValues, string>
>

const initialValues: NewConversationValues = {
  destinatario: '',
  primerMensaje: '',
}

export function NewConversationDialog({
  open,
  onOpenChange,
  onCreate,
}: NewConversationDialogProps) {
  const [values, setValues] =
    React.useState<NewConversationValues>(initialValues)
  const [errors, setErrors] = React.useState<NewConversationErrors>({})
  const [submitting, setSubmitting] = React.useState(false)

  function reset() {
    setValues(initialValues)
    setErrors({})
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset()
    }
    onOpenChange(next)
  }

  function handleField(field: keyof NewConversationValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = newConversationSchema.safeParse(values)
    if (!result.success) {
      setErrors({
        destinatario: result.error.issues.find(
          (issue) => issue.path.join('.') === 'destinatario'
        )?.message,
        primerMensaje: result.error.issues.find(
          (issue) => issue.path.join('.') === 'primerMensaje'
        )?.message,
      })
      return
    }

    setSubmitting(true)
    try {
      const error = await onCreate(result.data)
      if (error) {
        setErrors((prev) => ({ ...prev, destinatario: error }))
        return
      }
      reset()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo mensaje</DialogTitle>
          <DialogDescription>
            Inicia una conversación con otro dios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="new-msg-recipient">Destinatario</Label>
            <Input
              id="new-msg-recipient"
              type="text"
              value={values.destinatario}
              onChange={(event) =>
                handleField('destinatario', event.target.value)
              }
              aria-invalid={Boolean(errors.destinatario)}
              aria-describedby={
                errors.destinatario ? 'new-msg-recipient-error' : undefined
              }
              placeholder="Nombre del dios"
            />
            {errors.destinatario && (
              <p
                id="new-msg-recipient-error"
                className="text-destructive text-xs"
              >
                {errors.destinatario}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-msg-body">Primer mensaje</Label>
            <Input
              id="new-msg-body"
              type="text"
              value={values.primerMensaje}
              onChange={(event) =>
                handleField('primerMensaje', event.target.value)
              }
              aria-invalid={Boolean(errors.primerMensaje)}
              aria-describedby={
                errors.primerMensaje ? 'new-msg-body-error' : undefined
              }
              placeholder="Escribe tu mensaje"
            />
            {errors.primerMensaje && (
              <p id="new-msg-body-error" className="text-destructive text-xs">
                {errors.primerMensaje}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Enviando…' : 'Enviar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
