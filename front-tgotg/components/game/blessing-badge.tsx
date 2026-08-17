'use client'

import * as React from 'react'

import { godBlessings } from '@/data/new-game'
import { getSavedBlessing, subscribeToBlessingChanges } from '@/lib/blessing'

export function BlessingBadge() {
  const [blessingId, setBlessingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const refresh = () => setBlessingId(getSavedBlessing())
    const timer = window.setTimeout(refresh, 0)
    const unsubscribe = subscribeToBlessingChanges(refresh)
    return () => {
      window.clearTimeout(timer)
      unsubscribe()
    }
  }, [])

  const blessing = godBlessings.find((item) => item.id === blessingId)
  if (!blessing) return null

  return (
    <div className="flex items-center gap-3 px-3">
      <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
        <blessing.icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-muted-foreground text-xs">Bendición</span>
        <span className="truncate text-sm font-medium">{blessing.name}</span>
      </div>
    </div>
  )
}
