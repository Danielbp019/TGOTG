'use client'

import * as React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useCity } from '@/components/city/city-provider'
import { fetchConversations } from '@/lib/api'
import { Hammer, MessageSquare } from 'lucide-react'

function formatTimeRemaining(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Finalizando…'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes}min`
}

export function ActivityFeed() {
  const { city } = useCity()
  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
  })

  const activeBuildings =
    city?.buildings.filter((b) => b.upgrading && b.upgradeFinishesAt) ?? []
  const conversations = conversationsQuery.data?.conversations ?? []
  const totalUnread = conversations.reduce(
    (sum: number, c: { unreadCount: number }) => sum + c.unreadCount,
    0
  )
  const lastConversation = conversations[0]

  const hasActivity = activeBuildings.length > 0 || totalUnread > 0

  if (!hasActivity) {
    return (
      <div className="rounded-xl border p-4">
        <h3 className="font-heading text-sm font-bold">Actividad Reciente</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          No hay actividad reciente.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border p-4">
      <h3 className="font-heading mb-3 text-sm font-bold">Actividad Reciente</h3>
      <ul className="flex flex-col gap-2">
        {activeBuildings.map((b) => (
          <li key={b.id} className="flex items-center gap-2 text-sm">
            <Hammer className="size-4 shrink-0 text-amber-500" />
            <span className="flex-1">
              <span className="font-medium">{b.name}</span>
              <span className="text-muted-foreground">
                {' '}→ Nv.{(b.level ?? 0) + 1}
              </span>
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {b.upgradeFinishesAt
                ? formatTimeRemaining(b.upgradeFinishesAt)
                : '…'}
            </span>
          </li>
        ))}

        {totalUnread > 0 && (
          <li className="flex items-center gap-2 text-sm">
            <MessageSquare className="size-4 shrink-0 text-blue-500" />
            <span className="flex-1">
              <span className="font-medium">{totalUnread} mensaje{totalUnread > 1 ? 's' : ''} sin leer</span>
              {lastConversation?.lastMessage && (
                <span className="text-muted-foreground">
                  {' '}(Último: {lastConversation.participant.nick})
                </span>
              )}
            </span>
          </li>
        )}
      </ul>

      <div className="mt-3 flex gap-3">
        {totalUnread > 0 && (
          <Link
            href="/mensajes"
            className="text-primary text-xs font-medium hover:underline"
          >
            Ver mensajes →
          </Link>
        )}
      </div>
    </div>
  )
}
