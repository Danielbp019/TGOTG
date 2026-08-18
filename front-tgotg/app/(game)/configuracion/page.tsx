'use client'

import { ShieldAlert } from 'lucide-react'

import { WorldConfigPanel } from '@/components/game/world-config-panel'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/components/auth/auth-provider'

export default function WorldConfigPage() {
  const { user } = useAuth()

  if (user?.role !== 'admin') {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4" />
              Acceso restringido
            </CardTitle>
            <CardDescription>
              Solo el dios administrador puede configurar e iniciar el mundo.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return <WorldConfigPanel />
}