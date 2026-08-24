import * as React from 'react'

import { cn } from '@/lib/utils'

export function AuthCard({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'border-stone-line bg-card relative overflow-hidden rounded-[1.375rem] border p-6 shadow-(--tg-shadow-card) sm:p-8',
        className
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="border-gold-dim pointer-events-none absolute inset-2 rounded-xl border"
      />
      {children}
    </div>
  )
}
