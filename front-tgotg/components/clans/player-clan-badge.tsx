'use client'

import { Badge } from '@/components/ui/badge'

interface PlayerClanBadgeProps {
  acronym?: string | null
}

export function PlayerClanBadge({ acronym }: PlayerClanBadgeProps) {
  if (!acronym) return null

  return (
    <Badge variant="outline" className="text-xs">
      [{acronym}]
    </Badge>
  )
}
