'use client'

import * as React from 'react'

import { useAuth } from '@/components/auth/auth-provider'
import { fetchServerTime } from '@/lib/api'
import {
  getSavedTimeFormat,
  subscribeToTimeFormatChanges,
  type TimeFormat,
} from '@/lib/settings'

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

    const initialFormat = getSavedTimeFormat()
    setTimeFormat(initialFormat)
    setTime(formatTime(new Date(), initialFormat))

    fetchServerTime()
      .then((serverTime) => {
        if (!active) return
        serverOffset.current = new Date(serverTime).getTime() - Date.now()
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
      unsubscribe()
    }
  }, [authLoading, user])

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(
        formatTime(new Date(Date.now() + serverOffset.current), timeFormat)
      )
    }, 1000)
    return () => window.clearInterval(timer)
  }, [timeFormat])

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