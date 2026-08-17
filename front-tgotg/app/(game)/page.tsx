import { CityCanvas } from "@/components/game/city-canvas"

export default function CityPage() {
  return (
    <div className="flex h-full items-center justify-center overflow-hidden p-6">
      <div className="h-full w-full overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <CityCanvas />
      </div>
    </div>
  )
}