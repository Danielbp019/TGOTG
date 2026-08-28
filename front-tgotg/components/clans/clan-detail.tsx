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
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Shield, LogOut, Trash2 } from 'lucide-react'
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
  const [showDisbandDialog, setShowDisbandDialog] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)

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
      setShowDisbandDialog(false)
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
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading flex items-center gap-2 text-lg font-bold">
            <Shield className="text-primary size-5" />
            {clan.name}
            <span className="text-muted-foreground text-sm font-normal">[{clan.acronym}]</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Líder: {clan.leader.nick} · {clan.memberCount}/{clan.maxMembers} miembros
          </p>
        </div>
        <div className="flex gap-2">
          {clan.currentUserRole === 'leader' && (
            <Button
              variant="destructive"
              onClick={() => setShowDisbandDialog(true)}
              disabled={disbandMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Disolver
            </Button>
          )}
          {clan.currentUserRole !== 'leader' && (
            <Button
              variant="outline"
              onClick={() => setShowLeaveDialog(true)}
              disabled={leaveMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Abandonar
            </Button>
          )}
        </div>
      </header>

      <ClanBulletin
        clanId={clan.id}
        bulletins={clan.bulletins}
        currentUserRole={clan.currentUserRole}
      />

      {canManageApplications && applications.length > 0 && (
        <ClanApplications
          clanId={clan.id}
          applications={applications}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ClanMembersList
          members={clan.members}
          currentUserId={clan.currentPlayerId}
          onTransfer={handleTransfer}
        />
        <ClanChat clanId={clan.id} />
      </div>

      <ConfirmDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        title="Abandonar clan"
        description={`¿Estás seguro de que quieres abandonar el clan ${clan.name}? Perderás todos los privilegios de miembro.`}
        confirmLabel="Abandonar"
        onConfirm={() => leaveMutation.mutate()}
        isPending={leaveMutation.isPending}
      />

      <ConfirmDialog
        open={showDisbandDialog}
        onOpenChange={setShowDisbandDialog}
        title="¿Disolver el clan?"
        description={`Esta acción no se puede deshacer. El clan ${clan.name} [${clan.acronym}] será eliminado permanentemente y todos sus miembros quedarán sin clan.`}
        confirmLabel="Disolver clan"
        onConfirm={() => disbandMutation.mutate()}
        isPending={disbandMutation.isPending}
      />

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
