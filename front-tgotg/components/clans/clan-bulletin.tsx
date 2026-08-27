'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClanBulletin, deleteClanBulletin } from '@/lib/api'
import {
  clanBulletinSchema,
  type ClanBulletinValues,
} from '@/lib/validations/clans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormDialog } from '@/components/ui/form-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus } from 'lucide-react'
import type { ClanBulletin as ClanBulletinType, ClanRole } from '@/types'

interface ClanBulletinProps {
  clanId: string
  bulletins: ClanBulletinType[]
  currentUserRole?: ClanRole
}

export function ClanBulletin({
  clanId,
  bulletins,
  currentUserRole,
}: ClanBulletinProps) {
  const queryClient = useQueryClient()
  const [showDialog, setShowDialog] = useState(false)
  const [bulletinToDelete, setBulletinToDelete] = useState<string | null>(null)

  const form = useForm<ClanBulletinValues>({
    resolver: zodResolver(clanBulletinSchema),
    defaultValues: { title: '', content: '' },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  const createMutation = useMutation({
    mutationFn: (data: ClanBulletinValues) =>
      createClanBulletin(clanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-clan'] })
      reset()
      setShowDialog(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (bulletinId: string) =>
      deleteClanBulletin(clanId, bulletinId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-clan'] })
      setBulletinToDelete(null)
    },
  })

  const canEdit =
    currentUserRole === 'leader' ||
    currentUserRole === 'subleader' ||
    currentUserRole === 'officer'

  function handleDialogOpenChange(open: boolean) {
    if (!open) reset()
    setShowDialog(open)
  }

  return (
    <Card className="w-full min-h-[300px] max-h-[500px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Tablón</CardTitle>
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva publicación
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto min-h-0">
        <FormDialog
          open={showDialog}
          onOpenChange={handleDialogOpenChange}
          title="Nueva publicación en el tablón"
          description="Escribe un mensaje para todos los miembros del clan."
          onSubmit={handleSubmit((data) => createMutation.mutate(data))}
          submitLabel="Publicar"
          submitLoadingLabel="Publicando…"
          isPending={createMutation.isPending}
          error={createMutation.error?.message ?? null}
        >
          <div className="grid gap-2">
            <Label htmlFor="bulletin-title">Título</Label>
            <Input
              id="bulletin-title"
              {...register('title')}
              placeholder="Título de la publicación"
            />
            {errors.title && (
              <p className="text-destructive text-xs">{errors.title.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bulletin-content">Contenido</Label>
            <Textarea
              id="bulletin-content"
              {...register('content')}
              placeholder="Escribe el contenido del tablón..."
              className="min-h-[120px]"
            />
            {errors.content && (
              <p className="text-destructive text-xs">{errors.content.message}</p>
            )}
          </div>
        </FormDialog>

        <ConfirmDialog
          open={bulletinToDelete !== null}
          onOpenChange={(open) => { if (!open) setBulletinToDelete(null) }}
          title="Eliminar publicación"
          description="¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={() => { if (bulletinToDelete) deleteMutation.mutate(bulletinToDelete) }}
          isPending={deleteMutation.isPending}
        />

        {bulletins.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">
            No hay publicaciones en el tablón.
          </p>
        ) : (
          <div className="space-y-4">
            {bulletins.map((bulletin) => (
              <div key={bulletin.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{bulletin.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      Por {bulletin.author.nick} ·{' '}
                      {new Date(bulletin.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setBulletinToDelete(bulletin.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap">{bulletin.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
