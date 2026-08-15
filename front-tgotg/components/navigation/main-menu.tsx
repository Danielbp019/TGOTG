import Link from "next/link"
import { mainMenu } from "@/data/menu"
import { cn } from "@/lib/utils"

export function MainMenu() {
  return (
    <nav className="flex flex-col gap-1">
      {mainMenu.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-disabled={item.disabled}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            !item.disabled && "bg-muted text-foreground hover:bg-muted/80",
            item.disabled && "pointer-events-none text-muted-foreground/60"
          )}
        >
          <item.icon className="size-4 shrink-0" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
