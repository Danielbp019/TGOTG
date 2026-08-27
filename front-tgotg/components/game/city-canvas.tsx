'use client'

import dynamic from 'next/dynamic'

import { useCity } from '@/components/city/city-provider'
import { Skeleton } from '@/components/ui/skeleton'

const PhaserGame = dynamic(
  () => import('@/components/game/phaser-game').then((mod) => mod.PhaserGame),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    ),
  }
)

export function CityCanvas() {
  const { city, isLoading, version } = useCity()

  if (isLoading || !city) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  return <PhaserGame key={version} buildings={city.buildings} />
}
