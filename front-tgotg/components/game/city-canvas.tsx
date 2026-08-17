"use client"

import dynamic from "next/dynamic"

const PhaserGame = dynamic(
  () => import("@/components/game/phaser-game").then((mod) => mod.PhaserGame),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        Cargando la ciudad…
      </div>
    ),
  }
)

export function CityCanvas() {
  return <PhaserGame />
}
