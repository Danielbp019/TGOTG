'use client'

import * as React from 'react'

import { useAuth } from '@/components/auth/auth-provider'
import {
  getSavedTimeFormat,
  subscribeToTimeFormatChanges,
  type TimeFormat,
} from '@/lib/settings'
import { getServerOffsetMs } from '@/lib/server-time'

function formatTime(date: Date, format: TimeFormat) {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: format === '12h',
  })
}

export function ServerClock() {
  const { user, isLoading: authLoading } = useAuth()
  const [time, setTime] = React.useState<string | null>(null)
  const [timeFormat, setTimeFormat] = React.useState<TimeFormat>('24h')
  const serverOffset = React.useRef(0)

  React.useEffect(() => {
    if (authLoading || !user) return
    let active = true

    const initial = window.setTimeout(() => {
      const initialFormat = getSavedTimeFormat()
      setTimeFormat(initialFormat)
      setTime(formatTime(new Date(), initialFormat))
    }, 0)

    getServerOffsetMs()
      .then((offsetMs) => {
        if (!active) return
        serverOffset.current = offsetMs
        setTime(
          formatTime(
            new Date(Date.now() + serverOffset.current),
            getSavedTimeFormat()
          )
        )
      })
      .catch(() => {
        serverOffset.current = 0
      })

    const refresh = () => setTimeFormat(getSavedTimeFormat())
    const unsubscribe = subscribeToTimeFormatChanges(refresh)

    return () => {
      active = false
      window.clearTimeout(initial)
      unsubscribe()
    }
  }, [authLoading, user])

  React.useEffect(() => {
    if (authLoading || !user) return
    const timer = window.setInterval(() => {
      setTime(
        formatTime(new Date(Date.now() + serverOffset.current), timeFormat)
      )
    }, 1000)
    return () => window.clearInterval(timer)
  }, [authLoading, user, timeFormat])

  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">Hora del servidor</span>
      <span
        className="font-mono text-base font-medium tracking-wider tabular-nums"
        aria-live="off"
        suppressHydrationWarning
      >
        {time ?? '--:--:--'}
      </span>
    </div>
  )
}
