'use client'

import * as React from 'react'

import { Label } from '@/components/ui/label'
import { getSavedTimeFormat, saveTimeFormat } from '@/lib/settings'
import type { TimeFormat } from '@/lib/settings'
import { cn } from '@/lib/utils'

interface PreferencesTabProps {
  onReset?: () => number
}

export function PreferencesTab({ onReset }: PreferencesTabProps) {
  const [timeFormat, setTimeFormat] = React.useState<TimeFormat>('24h')

  const versionRef = React.useRef(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!onReset) return
    const v = onReset()
    if (v !== versionRef.current) {
      versionRef.current = v
      setTimeFormat(getSavedTimeFormat())
    }
  })

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="account-time-format">Formato de hora</Label>
        <p className="text-muted-foreground text-xs">
          Cómo se muestra la hora del servidor en la interfaz.
        </p>
        <div
          id="account-time-format"
          className="grid grid-cols-2 gap-2"
        >
          {(
            [
              { id: '24h', label: '24 horas' },
              { id: '12h', label: '12 horas' },
            ] as const
          ).map((option) => {
            const selected = option.id === timeFormat
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setTimeFormat(option.id)
                  saveTimeFormat(option.id)
                }}
                aria-pressed={selected}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  selected
                    ? 'border-primary bg-primary/5 ring-primary ring-2'
                    : 'border-border hover:bg-muted'
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
