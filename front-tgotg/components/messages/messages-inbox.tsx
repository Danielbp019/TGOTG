'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

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
import { Skeleton } from '@/components/ui/skeleton'

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
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = React.useState<string | undefined>()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [error, setError] = React.useState<string | undefined>()

  const enabled = !!user && !authLoading

  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    enabled,
  })

  const conversations = React.useMemo(
    () => conversationsQuery.data?.conversations.map(summaryToChat) ?? [],
    [conversationsQuery.data]
  )

  const initializedRef = React.useRef(false)
  React.useEffect(() => {
    if (conversations.length > 0 && !initializedRef.current) {
      initializedRef.current = true
      setSelectedId(conversations[0]?.id)
    }
  }, [conversations])

  const selectedQuery = useQuery({
    queryKey: ['conversation', selectedId],
    queryFn: () => fetchConversation(selectedId!),
    enabled: enabled && !!selectedId,
  })

  const selected = React.useMemo(() => {
    if (!selectedQuery.data) return undefined
    return detailToChat(selectedQuery.data.conversation)
  }, [selectedQuery.data])

  const sendMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      sendMessage(id, text),
    onSuccess: (response) => {
      const chat = detailToChat(response.conversation)
      queryClient.setQueryData(['conversation', chat.id], {
        conversation: response.conversation,
      })
      queryClient.setQueryData(['conversations'], (old: Awaited<ReturnType<typeof fetchConversations>> | undefined) => {
        if (!old) return old
        return {
          conversations: old.conversations.map((c) =>
            c.id === chat.id
              ? { ...c, lastMessage: response.conversation.messages.at(-1) ?? c.lastMessage, unreadCount: 0 }
              : c
          ),
        }
      })
      setError(undefined)
    },
    onError: (caught) => {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'No se pudo enviar el mensaje.'
      )
    },
  })

  const createMutation = useMutation({
    mutationFn: (values: NewConversationValues) =>
      createConversation({
        recipient_nick: values.destinatario.trim(),
        body: values.primerMensaje.trim(),
      }),
    onSuccess: (response) => {
      const chat = detailToChat(response.conversation)
      queryClient.setQueryData(['conversations'], (old: Awaited<ReturnType<typeof fetchConversations>> | undefined) => {
        if (!old) return { conversations: [response.conversation] }
        return {
          conversations: [
            response.conversation,
            ...old.conversations.filter((c) => c.id !== chat.id),
          ],
        }
      })
      setSelectedId(chat.id)
      setDialogOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData(['conversations'], (old: Awaited<ReturnType<typeof fetchConversations>> | undefined) => {
        if (!old) return old
        return {
          conversations: old.conversations.filter((c) => c.id !== id),
        }
      })
      if (selectedId === id) {
        setSelectedId(undefined)
      }
    },
    onError: (caught) => {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'No se pudo eliminar la conversación.'
      )
    },
  })

  function handleSelect(id: string) {
    setSelectedId(id)
  }

  function handleSend(text: string) {
    if (!selectedId) return
    sendMutation.mutate({ id: selectedId, text })
  }

  async function handleCreate(
    values: NewConversationValues
  ): Promise<string | null> {
    try {
      await createMutation.mutateAsync(values)
      return null
    } catch (caught) {
      if (caught instanceof ApiError) return caught.message
      return 'No se pudo crear la conversación.'
    }
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id)
  }

  if (conversationsQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="flex w-full flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
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
