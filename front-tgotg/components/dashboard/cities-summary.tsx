'use client'

import * as React from 'react'
import Link from 'next/link'
import { useCities } from '@/hooks/use-cities'
import { Skeleton } from '@/components/ui/skeleton'
import { Shield, ShieldAlert, ShieldOff } from 'lucide-react'

function formatProtection(iso: string | null): { label: string; status: 'ok' | 'warning' | 'none' } {
  if (!iso) return { label: 'Sin protección', status: 'none' }

  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return { label: 'Sin protección', status: 'none' }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 2) return { label: `${days}d ${hours}h`, status: 'ok' }
  if (days > 0 || hours > 6) return { label: `${days}d ${hours}h`, status: 'warning' }
  return { label: `${hours}h`, status: 'warning' }
}

export function CitiesSummary() {
  const { cities, isLoading } = useCities()

  if (isLoading) {
    return (
      <div className="rounded-xl border p-4">
        <Skeleton className="mb-3 h-5 w-32" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    )
  }

  if (cities.length === 0) {
    return (
      <div className="rounded-xl border p-4">
        <h3 className="font-heading text-sm font-bold">Tus Ciudades</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Aún no tienes ciudades.{' '}
          <Link href="/ciudades" className="underline">
            Crea una
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border p-4">
      <h3 className="font-heading mb-3 text-sm font-bold">
        Tus Ciudades ({cities.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {cities.map((city) => {
          const protection = formatProtection(city.protectionUntil)
          return (
            <Link
              key={city.id}
              href={`/ciudad/${city.id}`}
              className="hover:bg-muted flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
            >
              <span className="font-medium">{city.name}</span>
              {protection.status === 'ok' && (
                <Shield className="size-4 text-emerald-500" />
              )}
              {protection.status === 'warning' && (
                <ShieldAlert className="size-4 text-amber-500" />
              )}
              {protection.status === 'none' && (
                <ShieldOff className="text-muted-foreground size-4" />
              )}
              <span className="text-muted-foreground text-xs">
                {protection.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
