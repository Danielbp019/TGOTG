import {
  Castle,
  ScrollText,
  Swords,
  FlaskConical,
  Globe,
  Map,
  Users,
  MessageSquare,
} from 'lucide-react'
import type { MenuItem } from '@/types'

export const mainMenu: MenuItem[] = [
  { label: 'Resumen', href: '/', icon: ScrollText },
  { label: 'Ciudad', href: '/ciudad', icon: Castle },
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
  {
    label: 'Configuración del mundo',
    href: '/configuracion',
    icon: Globe,
    adminOnly: true,
  },
]
