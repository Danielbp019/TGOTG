'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchClanMessages, sendClanMessage } from '@/lib/api'
import { clanMessageSchema } from '@/lib/validations/clans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import type { ClanMessage } from '@/types'

interface ClanChatProps {
  clanId: string
}

export function ClanChat({ clanId }: ClanChatProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['clan-messages', clanId],
    queryFn: () => fetchClanMessages(clanId),
    refetchInterval: 5000,
  })

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendClanMessage(clanId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clan-messages', clanId] })
      setInputValue('')
      setError(null)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [data?.messages])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const result = clanMessageSchema.safeParse({ body: inputValue })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Error de validación')
      return
    }

    sendMutation.mutate(result.data.body)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  const messages = data?.messages ?? []

  return (
    <Card className="w-full flex flex-col min-h-[500px]">
      <CardHeader>
        <CardTitle>Chat del clan</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 max-h-[500px] overflow-y-auto pr-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex flex-col gap-3 py-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-1/2 ml-auto" />
              <Skeleton className="h-12 w-2/3" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay mensajes aún. ¡Sé el primero en escribir!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message: ClanMessage) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.sender.id === user?.id ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender.id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.sender.id !== user?.id && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {message.sender.nick}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(message.createdAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="pt-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="min-h-[40px] max-h-[120px]"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={sendMutation.isPending || !inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {error && <p className="text-destructive text-xs mt-1">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
