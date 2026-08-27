'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClanBulletin, deleteClanBulletin } from '@/lib/api'
import {
  clanBulletinSchema,
  type ClanBulletinValues,
} from '@/lib/validations/clans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const [values, setValues] = useState<ClanBulletinValues>({
    title: '',
    content: '',
  })
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  const createMutation = useMutation({
    mutationFn: (data: ClanBulletinValues) =>
      createClanBulletin(clanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-clan'] })
      setValues({ title: '', content: '' })
      setShowDialog(false)
    },
    onError: (error: Error) => {
      setErrors({ general: error.message })
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

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setErrors({})

    const result = clanBulletinSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Partial<Record<string, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    createMutation.mutate(result.data)
  }

  function handleDialogOpenChange(open: boolean) {
    if (!open) {
      setValues({ title: '', content: '' })
      setErrors({})
    }
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
        <Dialog open={showDialog} onOpenChange={handleDialogOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva publicación en el tablón</DialogTitle>
              <DialogDescription>
                Escribe un mensaje para todos los miembros del clan.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
              <div className="grid gap-2">
                <Label htmlFor="bulletin-title">Título</Label>
                <Input
                  id="bulletin-title"
                  value={values.title}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Título de la publicación"
                />
                {errors.title && (
                  <p className="text-destructive text-xs">{errors.title}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bulletin-content">Contenido</Label>
                <Textarea
                  id="bulletin-content"
                  value={values.content}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, content: event.target.value }))
                  }
                  placeholder="Escribe el contenido del tablón..."
                  className="min-h-[120px]"
                />
                {errors.content && (
                  <p className="text-destructive text-xs">{errors.content}</p>
                )}
              </div>
              {errors.general && (
                <p className="text-destructive text-xs">{errors.general}</p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                  disabled={createMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Publicando…' : 'Publicar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={bulletinToDelete !== null} onOpenChange={(open) => { if (!open) setBulletinToDelete(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar publicación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBulletinToDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => { if (bulletinToDelete) deleteMutation.mutate(bulletinToDelete) }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Eliminando…' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
