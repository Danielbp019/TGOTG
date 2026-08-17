"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { mainMenu } from "@/data/menu"
import { cn } from "@/lib/utils"

export function MainMenu() {
  const pathname = usePathname()

  function isActive(href: string) {
    return href === "/"
      ? pathname === href
      : pathname.startsWith(href)
  }

  return (
    <nav className="flex flex-col gap-1">
      {mainMenu.map((item) => {
        const active = !item.disabled && isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-disabled={item.disabled}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active && "bg-muted text-foreground hover:bg-muted/80",
              !item.disabled && !active && "text-muted-foreground hover:bg-muted hover:text-foreground",
              item.disabled && "pointer-events-none text-muted-foreground/60"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}