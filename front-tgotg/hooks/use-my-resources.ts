'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchMyResources } from '@/lib/api'
import { useAuth } from '@/components/auth/auth-provider'

export type PlayerResources = NonNullable<
  Awaited<ReturnType<typeof fetchMyResources>>['resources']
>

export function useMyResources() {
  const { user, isLoading: authLoading } = useAuth()

  const query = useQuery({
    queryKey: ['player-resources', user?.id ?? null],
    queryFn: fetchMyResources,
    enabled: !!user && !authLoading,
  })

  return {
    resources: query.data?.in_game ? query.data.resources : null,
    isLoading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  }
}
