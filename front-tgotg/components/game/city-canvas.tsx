'use client'

import dynamic from 'next/dynamic'

import { useCity } from '@/components/city/city-provider'

const PhaserGame = dynamic(
  () => import('@/components/game/phaser-game').then((mod) => mod.PhaserGame),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground flex h-full w-full items-center justify-center">
        Cargando la ciudad…
      </div>
    ),
  }
)

export function CityCanvas() {
  const { city, isLoading, version } = useCity()

  if (isLoading || !city) {
    return (
      <div className="text-muted-foreground flex h-full w-full items-center justify-center">
        Cargando la ciudad…
      </div>
    )
  }

  return <PhaserGame key={version} buildings={city.buildings} />
}