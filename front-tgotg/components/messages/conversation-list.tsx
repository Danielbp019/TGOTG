'use client'

import { Plus } from 'lucide-react'

import type { ChatConversation } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ConversationListProps {
  conversations: ChatConversation[]
  selectedId?: string
  onSelect: (id: string) => void
  onNew: () => void
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNew,
}: ConversationListProps) {
  return (
    <Card className="flex max-h-72 min-h-0 shrink-0 flex-col md:max-h-none md:w-72">
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle>Mensajes</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onNew}
          aria-label="Nuevo mensaje"
        >
          <Plus />
        </Button>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          {conversations.length === 0 ? (
            <p className="text-muted-foreground px-3 py-3 text-sm">
              Sin conversaciones. Crea una nueva.
            </p>
          ) : (
            <ul className="divide-y">
              {conversations.map((conversation) => {
                const last =
                  conversation.mensajes[conversation.mensajes.length - 1]
                const active = conversation.id === selectedId
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(conversation.id)}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-3 text-left transition-colors',
                        active ? 'bg-muted' : 'hover:bg-muted/60'
                      )}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {conversation.participante.iniciales}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">
                            {conversation.participante.nombre}
                          </p>
                          {last && (
                            <time className="text-muted-foreground shrink-0 text-xs">
                              {formatDate(last.fecha)}
                            </time>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <p className="text-muted-foreground truncate text-xs">
                            {last?.texto}
                          </p>
                          {conversation.noLeidos > 0 && (
                            <span className="bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                              {conversation.noLeidos}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
