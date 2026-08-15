import { Sidebar, SidebarContent } from "@/components/layout/sidebar"
import { BottomPanel } from "@/components/layout/bottom-panel"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MenuIcon } from "lucide-react"

interface GameShellProps {
  children: React.ReactNode
}

export function GameShell({ children }: GameShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4 md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Abrir menú" />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="left" className="w-72! p-4!">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="font-heading text-base font-bold">
            El Juego de los Dioses
          </h1>
        </header>
        <main className="min-h-0 flex-1 overflow-auto bg-background">
          {children}
        </main>
        <BottomPanel />
      </div>
    </div>
  )
}