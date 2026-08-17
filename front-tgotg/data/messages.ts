import type { ChatConversation } from '@/types'

export const chatConversations: ChatConversation[] = [
  {
    id: 'conv-1',
    participante: { nombre: 'Tláloc', iniciales: 'TL' },
    noLeidos: 2,
    mensajes: [
      {
        id: 'conv-1-1',
        autor: 'in',
        texto:
          'Saludos, Dios Supremo. He visto que tu civilización avanza con rapidez.',
        fecha: '2026-08-15T09:20:00',
      },
      {
        id: 'conv-1-2',
        autor: 'out',
        texto: 'Así es. Estoy reforzando mi ciudad antes de expandirme.',
        fecha: '2026-08-15T09:35:00',
      },
      {
        id: 'conv-1-3',
        autor: 'in',
        texto:
          'Sabia decisión. El oeste está repleto de recursos, pero también de enemigos.',
        fecha: '2026-08-17T11:05:00',
      },
      {
        id: 'conv-1-4',
        autor: 'in',
        texto:
          '¿Te interesaría una alianza comercial? Mi granja produce más de lo que necesito.',
        fecha: '2026-08-17T11:06:00',
      },
    ],
  },
  {
    id: 'conv-2',
    participante: { nombre: 'Mictlantecuhtli', iniciales: 'MI' },
    noLeidos: 0,
    mensajes: [
      {
        id: 'conv-2-1',
        autor: 'in',
        texto:
          'Tus murallas impresionan. ¿Planeas atacarme o defenderte de alguien más?',
        fecha: '2026-08-12T18:40:00',
      },
      {
        id: 'conv-2-2',
        autor: 'out',
        texto: 'Solo me protejo. Mis intereses están en el norte.',
        fecha: '2026-08-12T19:10:00',
      },
    ],
  },
  {
    id: 'conv-3',
    participante: { nombre: 'Huitzilopochtli', iniciales: 'HU' },
    noLeidos: 0,
    mensajes: [
      {
        id: 'conv-3-1',
        autor: 'out',
        texto: 'Necesito hierro para equipar a mi ejército. ¿Alguien comercia?',
        fecha: '2026-08-10T14:00:00',
      },
      {
        id: 'conv-3-2',
        autor: 'in',
        texto: 'Yo tengo de sobra. Envíame tu oferta y negociamos.',
        fecha: '2026-08-10T15:25:00',
      },
    ],
  },
]
