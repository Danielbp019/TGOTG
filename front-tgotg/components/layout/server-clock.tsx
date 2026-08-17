'use client'

import * as React from 'react'

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

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatTime(new Date()))
    }, 1000)
    return () => clearInterval(timer)
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
