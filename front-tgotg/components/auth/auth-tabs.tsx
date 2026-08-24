'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const authTabs = [
  { href: '/login', label: 'Iniciar sesión' },
  { href: '/register', label: 'Crear cuenta' },
]

export function AuthTabs() {
  const pathname = usePathname()

  return (
    <div
      role="tablist"
      aria-label="Acceso al reino"
      className="bg-marble-dim relative z-10 mb-6 flex gap-1 rounded-md p-1"
    >
      {authTabs.map((tab) => {
        const active = pathname === tab.href

        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex-1 rounded-sm px-2 py-1.5 text-center text-sm font-semibold transition-colors duration-300',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-ink-soft hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
