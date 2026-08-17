import { CityCanvas } from '@/components/game/city-canvas'
import { CityStatus } from '@/components/city/city-status'
import { ConstructionPanel } from '@/components/city/construction-panel'

export default function CityPage() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <div className="ring-foreground/10 h-[60vh] min-h-72 shrink-0 overflow-hidden rounded-xl ring-1">
        <CityCanvas />
      </div>
      <CityStatus />
      <ConstructionPanel />
    </div>
  )
}
