import { CityCanvas } from '@/components/game/city-canvas'
import { CityStatus } from '@/components/city/city-status'
import { CityTitle } from '@/components/city/city-title'
import { ConstructionPanel } from '@/components/city/construction-panel'

export default function CityPage() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <CityTitle />
      <div className="ring-foreground/10 h-[75vh] min-h-96 shrink-0 overflow-hidden rounded-xl bg-black ring-1">
        <CityCanvas />
      </div>
      <CityStatus />
      <ConstructionPanel />
    </div>
  )
}
