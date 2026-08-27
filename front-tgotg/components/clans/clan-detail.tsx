'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchClanApplications,
  leaveClan,
  disbandClan,
} from '@/lib/api'
import { ClanMembersList } from './clan-members-list'
import { ClanBulletin } from './clan-bulletin'
import { ClanChat } from './clan-chat'
import { ClanApplications } from './clan-applications'
import { ResourceTransferDialog } from './resource-transfer-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Users, MessageSquare, LogOut, Trash2 } from 'lucide-react'
import type { ClanDetail as ClanDetailType, ClanMember } from '@/types'

interface ClanDetailProps {
  clan: ClanDetailType
}

export function ClanDetail({ clan }: ClanDetailProps) {
  const queryClient = useQueryClient()
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [transferRecipient, setTransferRecipient] = useState<ClanMember | null>(
    null
  )

  const { data: applicationsData } = useQuery({
    queryKey: ['clan-applications', clan.id],
    queryFn: () => fetchClanApplications(clan.id),
    enabled:
      clan.currentUserRole === 'leader' ||
      clan.currentUserRole === 'subleader' ||
      clan.currentUserRole === 'officer',
  })

  const leaveMutation = useMutation({
    mutationFn: leaveClan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-clan'] })
    },
  })

  const disbandMutation = useMutation({
    mutationFn: () => disbandClan(clan.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-clan'] })
      queryClient.invalidateQueries({ queryKey: ['clans'] })
    },
  })

  const applications = applicationsData?.applications ?? []

  function handleTransfer(member: ClanMember) {
    setTransferRecipient(member)
    setShowTransferDialog(true)
  }

  const canManageApplications =
    clan.currentUserRole === 'leader' ||
    clan.currentUserRole === 'subleader' ||
    clan.currentUserRole === 'officer'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{clan.name}</h1>
              <p className="text-muted-foreground">[{clan.acronym}]</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Líder: {clan.leader.nick} · {clan.memberCount}/{clan.maxMembers}{' '}
            miembros
          </p>
        </div>
        <div className="flex gap-2">
          {clan.currentUserRole === 'leader' && (
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  confirm(
                    '¿Estás seguro de que quieres disbolver el clan? Esta acción no se puede deshacer.'
                  )
                ) {
                  disbandMutation.mutate()
                }
              }}
              disabled={disbandMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Disbolver
            </Button>
          )}
          {clan.currentUserRole !== 'leader' && (
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres abandonar el clan?')) {
                  leaveMutation.mutate()
                }
              }}
              disabled={leaveMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Abandonar
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Miembros
          </TabsTrigger>
          <TabsTrigger value="bulletin">
            Tablón
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </TabsTrigger>
          {canManageApplications && applications.length > 0 && (
            <TabsTrigger value="applications">
              Solicitudes ({applications.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members">
          <ClanMembersList
            members={clan.members}
            currentUserRole={clan.currentUserRole}
            onTransfer={handleTransfer}
          />
        </TabsContent>

        <TabsContent value="bulletin">
          <ClanBulletin
            clanId={clan.id}
            bulletins={clan.bulletins}
            currentUserRole={clan.currentUserRole}
          />
        </TabsContent>

        <TabsContent value="chat">
          <ClanChat clanId={clan.id} />
        </TabsContent>

        {canManageApplications && applications.length > 0 && (
          <TabsContent value="applications">
            <ClanApplications
              clanId={clan.id}
              applications={applications}
            />
          </TabsContent>
        )}
      </Tabs>

      {transferRecipient && (
        <ResourceTransferDialog
          recipient={transferRecipient}
          open={showTransferDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowTransferDialog(false)
              setTransferRecipient(null)
            }
          }}
        />
      )}
    </div>
  )
}
