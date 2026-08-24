'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Castle } from 'lucide-react'

import { mainMenu } from '@/data/menu'
import { useAuth } from '@/components/auth/auth-provider'
import { useCity } from '@/components/city/city-provider'
import { CreateCityDialog } from '@/components/city/create-city-dialog'
import { cn } from '@/lib/utils'

export function MainMenu() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { city } = useCity()
  const [createOpen, setCreateOpen] = React.useState(false)

  const visibleItems = mainMenu.filter((item) => !item.adminOnly || user?.role === 'admin')

  const [openIds, setOpenIds] = React.useState<Set<string>>(
    () => new Set(visibleItems.filter((i) => i.defaultOpen).map((i) => i.href))
  )

  function isActive(href: string) {
    return href === '/' ? pathname === href : pathname.startsWith(href)
  }

  function toggleOpen(href: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(href)) next.delete(href)
      else next.add(href)
      return next
    })
  }

  return (
    <>
      <nav className="flex flex-col gap-1">
        {visibleItems.map((item) => {
          const active = !item.disabled && isActive(item.href)
          const hasChildren = Boolean(item.children?.length)
          const isOpen = openIds.has(item.href)

          if (hasChildren) {
            const parentActive = pathname.startsWith('/ciudad')
            return (
              <div key={item.href} className="flex flex-col">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleOpen(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                    parentActive && 'bg-muted text-foreground',
                    !parentActive && 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronDown
                    className={cn('size-4 shrink-0 transition-transform', isOpen && 'rotate-180')}
                  />
                </button>

                {isOpen && (
                  <div className="mt-1 ml-4 flex flex-col gap-1 border-l pl-3">
                    {item.children!.map((child) => {
                      const isCreate = child.href === '#crear-ciudad'
                      if (isCreate) {
                        return (
                          <button
                            key={child.href}
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                          >
                            <child.icon className="size-4 shrink-0" />
                            <span>{child.label}</span>
                          </button>
                        )
                      }
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors"
                        >
                          <child.icon className="size-4 shrink-0" />
                          <span>{child.label}</span>
                        </Link>
                      )
                    })}

                    <Link
                      href="/ciudad"
                      aria-current={pathname === '/ciudad' ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                        pathname === '/ciudad'
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Castle className="size-4 shrink-0" />
                      <span>{city?.name ?? 'Principal'}</span>
                    </Link>
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-disabled={item.disabled}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active && 'bg-muted text-foreground hover:bg-muted/80',
                !item.disabled && !active && 'text-muted-foreground hover:bg-muted hover:text-foreground',
                item.disabled && 'text-muted-foreground/60 pointer-events-none'
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <CreateCityDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
