'use client'

import { useMyBlessing } from '@/hooks/use-my-blessing'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { blessingIcons } from '@/data/icons'

export function BlessingBadge() {
  const { blessing } = useMyBlessing()

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