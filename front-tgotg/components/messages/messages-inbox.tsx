'use client'

import * as React from 'react'

import type { ChatConversation, ChatMessage } from '@/types'
import type {
  ConversationDetailPayload,
  ConversationSummaryPayload,
} from '@/lib/api'
import { useAuth } from '@/components/auth/auth-provider'
import {
  ApiError,
  createConversation,
  deleteConversation,
  fetchConversation,
  fetchConversations,
  sendMessage,
} from '@/lib/api'
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

function messageToChat(message: {
  id: string
  body: string
  sentAt: string
  fromMe: boolean
}): ChatMessage {
  return {
    id: message.id,
    autor: message.fromMe ? 'out' : 'in',
    texto: message.body,
    fecha: message.sentAt,
  }
}

function summaryToChat(summary: ConversationSummaryPayload): ChatConversation {
  const lastMessage = summary.lastMessage
  return {
    id: summary.id,
    participante: {
      nombre: summary.participant.nick,
      iniciales: getInitials(summary.participant.nick),
    },
    mensajes: [],
    noLeidos: summary.unreadCount,
    ultimoMensaje: lastMessage
      ? {
          id: `${summary.id}-last`,
          autor: lastMessage.fromMe ? 'out' : 'in',
          texto: lastMessage.body,
          fecha: lastMessage.sentAt,
        }
      : undefined,
  }
}

function detailToChat(detail: ConversationDetailPayload): ChatConversation {
  const mensajes = detail.messages.map(messageToChat)
  return {
    id: detail.id,
    participante: {
      nombre: detail.participant.nick,
      iniciales: getInitials(detail.participant.nick),
    },
    mensajes,
    noLeidos: 0,
    ultimoMensaje: mensajes[mensajes.length - 1],
  }
}

export function MessagesInbox() {
  const { user, isLoading: authLoading } = useAuth()
  const [conversations, setConversations] = React.useState<ChatConversation[]>(
    []
  )
  const [selectedId, setSelectedId] = React.useState<string | undefined>()
  const [selected, setSelected] = React.useState<ChatConversation | undefined>()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | undefined>()

  React.useEffect(() => {
    if (authLoading || !user) {
      const t = window.setTimeout(() => setLoading(false), 0)
      return () => window.clearTimeout(t)
    }
    let active = true

    fetchConversations()
      .then((response) => {
        if (!active) return
        setConversations(response.conversations.map(summaryToChat))
        setSelectedId((current) => current ?? response.conversations[0]?.id)
      })
      .catch((caught) => {
        if (!active) return
        setError(
          caught instanceof ApiError
            ? caught.message
            : 'No se pudieron cargar los mensajes.'
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [authLoading, user])

  React.useEffect(() => {
    if (authLoading || !user || !selectedId) return
    let active = true

    fetchConversation(selectedId)
      .then((response) => {
        if (!active) return
        const chat = detailToChat(response.conversation)
        setSelected(chat)
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === chat.id ? chat : conversation
          )
        )
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [authLoading, user, selectedId])

  function handleSelect(id: string) {
    setSelectedId(id)
  }

  async function handleSend(text: string) {
    if (!selectedId) return
    try {
      const response = await sendMessage(selectedId, text)
      const chat = detailToChat(response.conversation)
      setSelected(chat)
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === chat.id ? chat : conversation
        )
      )
      setError(undefined)
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'No se pudo enviar el mensaje.'
      )
    }
  }

  async function handleCreate(
    values: NewConversationValues
  ): Promise<string | null> {
    try {
      const response = await createConversation({
        recipient_nick: values.destinatario.trim(),
        body: values.primerMensaje.trim(),
      })
      const chat = detailToChat(response.conversation)
      setConversations((prev) => [
        chat,
        ...prev.filter((conversation) => conversation.id !== chat.id),
      ])
      setSelectedId(chat.id)
      setDialogOpen(false)
      return null
    } catch (caught) {
      if (caught instanceof ApiError) return caught.message
      return 'No se pudo crear la conversación.'
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteConversation(id)
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'No se pudo eliminar la conversación.'
      )
      return
    }

    const index = conversations.findIndex(
      (conversation) => conversation.id === id
    )
    const next = conversations.filter((conversation) => conversation.id !== id)
    setConversations(next)
    if (selectedId === id) {
      setSelected(undefined)
      setSelectedId(next[Math.min(index, next.length - 1)]?.id)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground text-sm">Cargando mensajes…</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-6 md:flex-row">
      {error && <p className="text-destructive text-sm">{error}</p>}

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
