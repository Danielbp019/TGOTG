import { AccountHeader } from "@/components/account/account-header"
import { ResourceBar } from "@/components/resources/resource-bar"
import { MainMenu } from "@/components/navigation/main-menu"
import { Separator } from "@/components/ui/separator"

export function SidebarContent() {
  return (
    <>
      <h1 className="px-3 font-heading text-lg font-bold">El Juego de los Dioses</h1>
      <AccountHeader />
      <Separator />
      <div>
        <h2 className="mb-1 px-3 text-xs font-medium text-muted-foreground">Recursos</h2>
        <ResourceBar />
      </div>
      <Separator />
      <div className="flex-1">
        <h2 className="mb-1 px-3 text-xs font-medium text-muted-foreground">Menú</h2>
        <MainMenu />
      </div>
    </>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col gap-4 border-r bg-card p-4 md:flex">
      <SidebarContent />
    </aside>
  )
}