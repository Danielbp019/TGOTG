'use client'

import * as React from 'react'
import { AlertTriangle, Clock, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/components/auth/auth-provider'
import type { AccountProfileValues } from '@/lib/validations/account'
import { ProfileTab } from '@/components/account/tabs/profile-tab'
import { PreferencesTab } from '@/components/account/tabs/preferences-tab'
import { DangerZoneTab } from '@/components/account/tabs/danger-zone-tab'

interface AccountSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountSettingsDialog({
  open,
  onOpenChange,
}: AccountSettingsDialogProps) {
  const { user } = useAuth()
  const [resetVersion, setResetVersion] = React.useState(0)

  const initialProfile: AccountProfileValues = React.useMemo(
    () => ({
      email: user?.email ?? '',
      nick: user?.nick ?? '',
      currentPassword: '',
      password: '',
      confirmPassword: '',
    }),
    [user]
  )

  function handleOpenChange(next: boolean) {
    if (next) {
      setResetVersion((v) => v + 1)
    }
    onOpenChange(next)
  }

  function getResetVersion() {
    return resetVersion
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Ajustes de cuenta</DialogTitle>
          <DialogDescription>
            Gestiona los datos de tu cuenta y su seguridad.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-auto overflow-hidden">
          <div className="grid gap-4 pr-3">
            <Tabs defaultValue="datos">
              <TabsList className="w-full">
                <TabsTrigger value="datos">
                  <User />
                  Datos de usuario
                </TabsTrigger>
                <TabsTrigger value="preferencias">
                  <Clock />
                  Preferencias
                </TabsTrigger>
                <TabsTrigger value="peligro">
                  <AlertTriangle />
                  Zona de peligro
                </TabsTrigger>
              </TabsList>

              <TabsContent value="datos">
                <ProfileTab
                  initialProfile={initialProfile}
                  onReset={getResetVersion}
                />
              </TabsContent>

              <TabsContent value="preferencias">
                <PreferencesTab onReset={getResetVersion} />
              </TabsContent>

              <TabsContent value="peligro">
                <DangerZoneTab onReset={getResetVersion} />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
