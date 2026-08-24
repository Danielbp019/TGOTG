'use client'

import * as React from 'react'
import { LogOut, Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-provider'
import { AccountSettingsDialog } from '@/components/account/account-settings-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AccountHeader() {
  const { user, logout } = useAuth()
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [loggingOut, setLoggingOut] = React.useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
  }

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 rounded-lg"
              aria-label="Menú de cuenta"
            >
              <Settings className="size-5" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" sideOffset={6}>
          <DropdownMenuItem
            variant="default"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings />
            Ajustes de cuenta
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={loggingOut}
            onClick={handleLogout}
          >
            <LogOut />
            {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold">
          {user?.nick ?? '—'}
        </span>
        <span className="text-muted-foreground truncate text-xs">Cuenta</span>
      </div>
      <AccountSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  )
}
