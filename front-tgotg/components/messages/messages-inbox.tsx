'use client'

import * as React from 'react'

import type { ChatConversation, ChatMessage } from '@/types'
import { chatConversations } from '@/data/messages'
import type { NewConversationValues } from '@/lib/validations/messages'
import { ChatViewer } from '@/components/messages/chat-viewer'
import { ConversationList } from '@/components/messages/conversation-list'
import { NewConversationDialog } from '@/components/messages/new-conversation-dialog'

function getInitials(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function MessagesInbox() {
  const [conversations, setConversations] =
    React.useState<ChatConversation[]>(chatConversations)
  const [selectedId, setSelectedId] = React.useState<string | undefined>(
    chatConversations[0]?.id
  )
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const selected = conversations.find(
    (conversation) => conversation.id === selectedId
  )

  function handleSelect(id: string) {
    setSelectedId(id)
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === id ? { ...conversation, noLeidos: 0 } : conversation
      )
    )
  }

  function handleSend(text: string) {
    if (!selectedId) return
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== selectedId) return conversation
        const message: ChatMessage = {
          id: `${conversation.id}-${conversation.mensajes.length + 1}`,
          autor: 'out',
          texto: text,
          fecha: new Date().toISOString(),
        }
        return {
          ...conversation,
          mensajes: [...conversation.mensajes, message],
          noLeidos: 0,
        }
      })
    )
  }

  function handleCreate(values: NewConversationValues) {
    const nombre = values.destinatario.trim()
    const existing = conversations.find(
      (conversation) =>
        conversation.participante.nombre.toLowerCase() === nombre.toLowerCase()
    )
    if (existing) {
      handleSelect(existing.id)
    } else {
      const nueva: ChatConversation = {
        id: `conv-${Date.now()}`,
        participante: {
          nombre,
          iniciales: getInitials(nombre),
        },
        noLeidos: 0,
        mensajes: [
          {
            id: 'conv-first',
            autor: 'out',
            texto: values.primerMensaje.trim(),
            fecha: new Date().toISOString(),
          },
        ],
      }
      setConversations((prev) => [nueva, ...prev])
      setSelectedId(nueva.id)
    }
    setDialogOpen(false)
  }

  function handleDelete(id: string) {
    const index = conversations.findIndex(
      (conversation) => conversation.id === id
    )
    const next = conversations.filter((conversation) => conversation.id !== id)
    setConversations(next)
    setSelectedId(next[Math.min(index, next.length - 1)]?.id)
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-6 md:flex-row">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={handleSelect}
        onNew={() => setDialogOpen(true)}
      />
      <ChatViewer
        conversation={selected}
        onSend={handleSend}
        onDelete={handleDelete}
      />
      <NewConversationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={handleCreate}
      />
    </div>
  )
}
