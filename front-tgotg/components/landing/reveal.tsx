'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

const hiddenClasses = ['translate-y-4', 'opacity-0']
const visibleClasses = ['translate-y-0', 'opacity-100']

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className, delay }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const reveal = () => {
      element.classList.remove(...hiddenClasses)
      element.classList.add(...visibleClasses)
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveal()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal()
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        'transition-all duration-700 ease-out',
        ...hiddenClasses,
        className
      )}
    >
      {children}
    </div>
  )
}
