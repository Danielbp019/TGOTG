import type * as React from 'react'

import { cn } from '@/lib/utils'

interface EyebrowProps {
  children: React.ReactNode
  className?: string
  lineClassName?: string
}

export function Eyebrow({ children, className, lineClassName }: EyebrowProps) {
  return (
    <p
      className={cn(
        'text-azure flex items-center gap-2.5 font-mono text-[0.72rem] font-medium tracking-[0.18em] uppercase',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn('bg-gold h-px w-5.5', lineClassName)}
      />
      {children}
    </p>
  )
}
