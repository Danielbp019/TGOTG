'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchClans } from '@/lib/api'
import { ClanCreateDialog } from './clan-create-dialog'
import { ClanJoinForm } from './clan-join-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Shield, Users } from 'lucide-react'
import type { Clan } from '@/types'

export function ClanList() {
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['clans'],
    queryFn: fetchClans,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error al cargar los clanes.</p>
      </div>
    )
  }

  const clans = data?.clans ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clanes</h1>
          <p className="text-muted-foreground">
            Únete a un clan o crea el tuyo propio.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Shield className="mr-2 h-4 w-4" />
          Crear clan
        </Button>
      </div>

      {clans.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No hay clanes aún</h3>
          <p className="text-muted-foreground">
            Sé el primero en crear un clan.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clans.map((clan) => (
            <div
              key={clan.id}
              className="border rounded-lg p-4 space-y-3 hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{clan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    [{clan.acronym}]
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{clan.memberCount}/{clan.maxMembers} miembros</p>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">
                  Líder: <span className="text-foreground">{clan.leader.nick}</span>
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedClan(clan)}
              >
                Unirse
              </Button>
            </div>
          ))}
        </div>
      )}

      <ClanCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {selectedClan && (
        <ClanJoinForm
          clan={selectedClan}
          open={selectedClan !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedClan(null)
          }}
        />
      )}
    </div>
  )
}
