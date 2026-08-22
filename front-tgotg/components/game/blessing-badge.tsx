'use client'

import * as React from 'react'

import { useAuth } from '@/components/auth/auth-provider'
import type { BlessingPayload } from '@/lib/api'
import { fetchMyBlessing } from '@/lib/api'
import { subscribeToBlessingChanges } from '@/lib/blessing'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { blessingIcons } from '@/data/icons'

export function BlessingBadge() {
  const { user, isLoading: authLoading } = useAuth()
  const [blessing, setBlessing] = React.useState<BlessingPayload | null>(null)

  React.useEffect(() => {
    if (authLoading || !user) {
      setBlessing(null)
      return
    }
    const refresh = () => {
      fetchMyBlessing()
        .then((response) => setBlessing(response.blessing))
        .catch(() => setBlessing(null))
    }
    const timer = window.setTimeout(refresh, 0)
    const unsubscribe = subscribeToBlessingChanges(refresh)
    return () => {
      window.clearTimeout(timer)
      unsubscribe()
    }
  }, [authLoading, user])

  if (!blessing) return null

  const Icon = blessingIcons[blessing.key]

  return (
    <div className="flex items-center gap-3 px-3">
      <Tooltip>
        <TooltipTrigger
          render={
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              {Icon && <Icon className="size-4" />}
            </div>
          }
        />
        <TooltipContent>{blessing.benefit}</TooltipContent>
      </Tooltip>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-muted-foreground text-xs">Bendición</span>
        <span className="truncate text-sm font-medium">{blessing.name}</span>
      </div>
    </div>
  )
}