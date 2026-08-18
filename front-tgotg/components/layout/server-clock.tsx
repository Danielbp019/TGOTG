'use client'

import * as React from 'react'

import { fetchServerTime } from '@/lib/api'

function formatTime(date: Date) {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function ServerClock() {
  const [time, setTime] = React.useState(() => formatTime(new Date()))
  const serverOffset = React.useRef(0)

  React.useEffect(() => {
    let active = true

    fetchServerTime()
      .then((serverTime) => {
        if (!active) return
        serverOffset.current = new Date(serverTime).getTime() - Date.now()
        setTime(formatTime(new Date(Date.now() + serverOffset.current)))
      })
      .catch(() => {
        serverOffset.current = 0
      })

    return () => {
      active = false
    }
  }, [])

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(formatTime(new Date(Date.now() + serverOffset.current)))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">Hora del servidor</span>
      <span
        className="font-mono text-base font-medium tracking-wider tabular-nums"
        aria-live="off"
      >
        {time}
      </span>
    </div>
  )
}