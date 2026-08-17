import {
  Castle,
  Swords,
  FlaskConical,
  Map,
  Users,
  MessageSquare,
} from 'lucide-react'
import type { MenuItem } from '@/types'

export const mainMenu: MenuItem[] = [
  { label: 'Ciudad', href: '/', icon: Castle },
  { label: 'Ejército', href: '/ejercito', icon: Swords, disabled: true },
  {
    label: 'Investigación',
    href: '/investigacion',
    icon: FlaskConical,
    disabled: true,
  },
  { label: 'Mapa', href: '/mapa', icon: Map, disabled: true },
  { label: 'Alianzas', href: '/alianzas', icon: Users, disabled: true },
  { label: 'Mensajes', href: '/mensajes', icon: MessageSquare },
]
