'use client'

import * as React from 'react'
import { Send, Trash2 } from 'lucide-react'

import type { ChatConversation } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { chatReplySchema } from '@/lib/validations/messages'

interface ChatViewerProps {
  conversation?: ChatConversation
  onSend: (text: string) => void
  onDelete: (id: string) => void
}

export function ChatViewer({
  conversation,
  onSend,
  onDelete,
}: ChatViewerProps) {
  const [text, setText] = React.useState('')
  const [error, setError] = React.useState<string | undefined>()
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const mensajes = conversation?.mensajes

  React.useEffect(() => {
    const el = bodyRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [conversation?.id, mensajes?.length])

  if (!conversation) {
    return (
      <Card className="flex min-h-0 flex-1 items-center justify-center">
        <p className="text-muted-foreground px-4 text-sm">
          Selecciona una conversación para leerla.
        </p>
      </Card>
    )
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = chatReplySchema.safeParse({ mensaje: text })
    if (!result.success) {
      setError(result.error.issues[0]?.message)
      return
    }
    onSend(result.data.mensaje)
    setText('')
    setError(undefined)
  }

  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardHeader className="flex-row items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {conversation.participante.iniciales}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="truncate">
            {conversation.participante.nombre}
          </CardTitle>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(conversation.id)}
          aria-label="Eliminar conversación"
        >
          <Trash2 />
        </Button>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <div
          ref={bodyRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
        >
          {conversation.mensajes.map((message) => {
            const outgoing = message.autor === 'out'
            return (
              <div
                key={message.id}
                className={cn(
                  'flex flex-col',
                  outgoing ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap',
                    outgoing ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  {message.texto}
                </div>
                <time className="text-muted-foreground mt-1 text-xs">
                  {formatDateTime(message.fecha)}
                </time>
              </div>
            )
          })}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex shrink-0 items-start gap-2 border-t p-3"
          noValidate
        >
          <Input
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setError(undefined)
            }}
            placeholder="Escribe un mensaje..."
            aria-label="Mensaje"
            aria-invalid={Boolean(error)}
          />
          <Button type="submit" size="icon" aria-label="Enviar">
            <Send />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
