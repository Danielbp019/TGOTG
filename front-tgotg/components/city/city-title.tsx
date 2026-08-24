'use client'

import { useCity } from '@/components/city/city-provider'

export function CityTitle() {
  const { city, isLoading } = useCity()

  if (isLoading || !city) {
    return (
      <h2 className="font-heading flex min-h-8 shrink-0 items-center justify-center text-2xl font-bold lg:text-3xl">
        <span className="bg-muted h-6 w-40 animate-pulse rounded" />
      </h2>
    )
  }

  return (
    <h2 className="font-heading text-center text-2xl leading-tight font-bold lg:text-3xl">
      {city.name}
    </h2>
  )
}
