import { z } from 'zod'

export const newConversationSchema = z.object({
  destinatario: z.string().trim().min(1, 'Escribe el nombre del destinatario'),
  primerMensaje: z.string().trim().min(1, 'Escribe un primer mensaje'),
})

export type NewConversationValues = z.infer<typeof newConversationSchema>

export const chatReplySchema = z.object({
  mensaje: z.string().trim().min(1, 'El mensaje no puede estar vacío'),
})

export type ChatReplyValues = z.infer<typeof chatReplySchema>
