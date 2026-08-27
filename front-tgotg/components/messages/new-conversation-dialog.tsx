'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMyClan } from '@/lib/api'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield } from 'lucide-react'
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
  const [showClanMembers, setShowClanMembers] = React.useState(false)

  const { data: clanData } = useQuery({
    queryKey: ['my-clan'],
    queryFn: fetchMyClan,
    enabled: showClanMembers,
  })

  function reset() {
    setValues(initialValues)
    setErrors({})
    setShowClanMembers(false)
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

  function handleSelectClanMember(nick: string) {
    setValues((prev) => ({ ...prev, destinatario: nick }))
    setErrors((prev) => ({ ...prev, destinatario: undefined }))
    setShowClanMembers(false)
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

  const clanMembers =
    clanData?.clan?.members?.filter(
      (m) => m.nick !== values.destinatario
    ) ?? []

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
            <div className="flex items-center justify-between">
              <Label htmlFor="new-msg-recipient">Destinatario</Label>
              {clanData?.clan && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClanMembers(!showClanMembers)}
                >
                  <Shield className="mr-1 h-3 w-3" />
                  Clan
                </Button>
              )}
            </div>
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

          {showClanMembers && clanMembers.length > 0 && (
            <div className="border rounded-lg">
              <div className="p-2 border-b">
                <p className="text-xs text-muted-foreground">
                  Miembros del clan
                </p>
              </div>
              <ScrollArea className="h-[150px]">
                <div className="p-1">
                  {clanMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors"
                      onClick={() => handleSelectClanMember(member.nick)}
                    >
                      {member.nick}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {showClanMembers && clanMembers.length === 0 && (
            <div className="border rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">
                No hay otros miembros en tu clan.
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="new-msg-body">Primer mensaje</Label>
            <Textarea
              id="new-msg-body"
              value={values.primerMensaje}
              onChange={(event) =>
                handleField('primerMensaje', event.target.value)
              }
              aria-invalid={Boolean(errors.primerMensaje)}
              aria-describedby={
                errors.primerMensaje ? 'new-msg-body-error' : undefined
              }
              placeholder="Escribe tu mensaje"
              className="min-h-[120px]"
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
