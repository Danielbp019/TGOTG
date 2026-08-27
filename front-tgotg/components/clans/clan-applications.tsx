'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  acceptClanApplication,
  rejectClanApplication,
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import type { ClanApplication } from '@/types'

interface ClanApplicationsProps {
  clanId: string
  applications: ClanApplication[]
}

export function ClanApplications({
  clanId,
  applications,
}: ClanApplicationsProps) {
  const queryClient = useQueryClient()

  const acceptMutation = useMutation({
    mutationFn: (applicationId: string) =>
      acceptClanApplication(clanId, applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clan-applications', clanId] })
      queryClient.invalidateQueries({ queryKey: ['my-clan'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (applicationId: string) =>
      rejectClanApplication(clanId, applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clan-applications', clanId] })
    },
  })

  if (applications.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-muted-foreground">No hay solicitudes pendientes.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <h3 className="font-semibold">
          Solicitudes pendientes ({applications.length})
        </h3>
      </div>
      <div className="divide-y">
        {applications.map((application) => (
          <div
            key={application.id}
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {application.player.nick.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{application.player.nick}</p>
                {application.message && (
                  <p className="text-xs text-muted-foreground max-w-xs truncate">
                    &quot;{application.message}&quot;
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(application.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => rejectMutation.mutate(application.id)}
                disabled={
                  acceptMutation.isPending || rejectMutation.isPending
                }
                title="Rechazar"
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => acceptMutation.mutate(application.id)}
                disabled={
                  acceptMutation.isPending || rejectMutation.isPending
                }
                title="Aceptar"
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
