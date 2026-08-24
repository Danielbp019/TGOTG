import { AccountHeader } from '@/components/account/account-header'
import { BlessingBadge } from '@/components/game/blessing-badge'
import { ResourceBar } from '@/components/resources/resource-bar'
import { MainMenu } from '@/components/navigation/main-menu'
import { ServerClock } from '@/components/layout/server-clock'
import { Separator } from '@/components/ui/separator'

export function SidebarContent() {
  return (
    <>
      <div className="scroll-thin flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain">
        <h1 className="font-heading px-3 text-lg font-bold">
          El Juego de los Dioses
        </h1>
        <AccountHeader />
        <BlessingBadge />
        <Separator />
        <div>
          <h2 className="text-muted-foreground mb-1 px-3 text-xs font-medium">
            Recursos
          </h2>
          <ResourceBar />
        </div>
        <Separator />
        <div className="flex-1">
          <h2 className="text-muted-foreground mb-1 px-3 text-xs font-medium">
            Menú
          </h2>
          <MainMenu />
        </div>
      </div>
      <Separator />
      <footer className="px-3">
        <ServerClock />
      </footer>
    </>
  )
}

export function Sidebar() {
  return (
    <aside className="bg-card hidden h-full w-72 shrink-0 flex-col gap-4 border-r p-4 md:flex">
      <SidebarContent />
    </aside>
  )
}
