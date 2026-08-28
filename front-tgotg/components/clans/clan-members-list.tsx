'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send } from 'lucide-react'
import type { ClanMember, ClanRole } from '@/types'

interface ClanMembersListProps {
  members: ClanMember[]
  currentUserId?: string
  onTransfer: (member: ClanMember) => void
}

const roleLabels: Record<ClanRole, string> = {
  leader: 'Líder',
  subleader: 'Sublíder',
  officer: 'Oficial',
  member: 'Miembro',
}

const roleBadgeVariants: Record<ClanRole, string> = {
  leader: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  subleader: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  officer: 'bg-green-500/20 text-green-700 border-green-500/30',
  member: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
}

export function ClanMembersList({
  members,
  currentUserId,
  onTransfer,
}: ClanMembersListProps) {
  return (
    <Card className="w-full flex flex-col min-h-[500px]">
      <CardHeader>
        <CardTitle>Miembros del clan</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="max-h-[500px] overflow-y-auto">
          <div className="divide-y">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {member.nick.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{member.nick}</p>
                    <p className="text-xs text-muted-foreground">
                      Miembro desde{' '}
                      {new Date(member.joinedAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={roleBadgeVariants[member.role]}
                  >
                    {roleLabels[member.role]}
                  </Badge>
                  {currentUserId && member.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onTransfer(member)}
                        title="Enviar recursos"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
