'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClanBulletin, deleteClanBulletin } from '@/lib/api'
import {
  clanBulletinSchema,
  type ClanBulletinValues,
} from '@/lib/validations/clans'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Trash2 } from 'lucide-react'
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
  const [showForm, setShowForm] = useState(false)
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
      setShowForm(false)
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

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : 'Nueva publicación'}
          </Button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
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
          <div className="flex justify-end">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </form>
      )}

      {bulletins.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">
            No hay publicaciones en el tablón.
          </p>
        </div>
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
                    onClick={() => {
                      if (
                        confirm(
                          '¿Estás seguro de que quieres eliminar esta publicación?'
                        )
                      ) {
                        deleteMutation.mutate(bulletin.id)
                      }
                    }}
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
    </div>
  )
}
