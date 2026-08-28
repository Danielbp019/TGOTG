'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fetchMyClan } from '@/lib/api'
import { FormDialog } from '@/components/ui/form-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
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

export function NewConversationDialog({
  open,
  onOpenChange,
  onCreate,
}: NewConversationDialogProps) {
  const [showClanMembers, setShowClanMembers] = React.useState(false)

  const form = useForm<NewConversationValues>({
    resolver: zodResolver(newConversationSchema),
    defaultValues: { destinatario: '', primerMensaje: '' },
  })

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = form

  const destinatarioValue = useWatch({ control, name: 'destinatario' })

  const { data: clanData } = useQuery({
    queryKey: ['my-clan'],
    queryFn: fetchMyClan,
    enabled: showClanMembers,
  })

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset()
      setShowClanMembers(false)
    }
    onOpenChange(next)
  }

  function handleSelectClanMember(nick: string) {
    setValue('destinatario', nick, { shouldValidate: true })
    setShowClanMembers(false)
  }

  async function onSubmit(data: NewConversationValues) {
    const error = await onCreate(data)
    if (error) {
      setError('destinatario', { message: error })
      return
    }
    reset()
    setShowClanMembers(false)
  }

  const clanMembers =
    clanData?.clan?.members?.filter(
      (m) => m.nick !== destinatarioValue
    ) ?? []

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Nuevo mensaje"
      description="Inicia una conversación con otro dios."
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Enviar"
      submitLoadingLabel="Enviando…"
      isPending={isSubmitting}
    >
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
          {...register('destinatario')}
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
            {errors.destinatario.message}
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
          {...register('primerMensaje')}
          aria-invalid={Boolean(errors.primerMensaje)}
          aria-describedby={
            errors.primerMensaje ? 'new-msg-body-error' : undefined
          }
          placeholder="Escribe tu mensaje"
          className="min-h-[120px]"
        />
        {errors.primerMensaje && (
          <p id="new-msg-body-error" className="text-destructive text-xs">
            {errors.primerMensaje.message}
          </p>
        )}
      </div>
    </FormDialog>
  )
}
