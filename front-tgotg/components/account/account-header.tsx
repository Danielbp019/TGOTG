'use client'

import * as React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { currentUser } from '@/data/user'
import { AccountSettingsDialog } from '@/components/account/account-settings-dialog'

export function AccountHeader() {
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>{currentUser.initials}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold">
          {currentUser.name}
        </span>
        <span className="text-muted-foreground truncate text-xs">Cuenta</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Ajustes de cuenta"
        onClick={() => setSettingsOpen(true)}
      >
        <Settings className="size-4" />
      </Button>
      <AccountSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  )
}
