'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchMyClan } from '@/lib/api'
import { ClanList } from './clan-list'
import { ClanDetail } from './clan-detail'
import { Skeleton } from '@/components/ui/skeleton'

export function ClanPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-clan'],
    queryFn: fetchMyClan,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error al cargar los clanes.</p>
      </div>
    )
  }

  if (data?.clan) {
    return <ClanDetail clan={data.clan} />
  }

  return <ClanList />
}
