'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchCities } from '@/lib/api'
import { useAuth } from '@/components/auth/auth-provider'

export type CitySummary = Awaited<ReturnType<typeof fetchCities>>['cities'][number]

export function useCities() {
  const { user, isLoading: authLoading } = useAuth()
  const userId = user?.id ?? null

  const query = useQuery({
    queryKey: ['cities', userId],
    queryFn: () => fetchCities(),
    enabled: !!userId && !authLoading,
  })

  return {
    cities: query.data?.cities ?? [],
    isLoading: query.isLoading,
    error: query.error,
    reload: query.refetch,
  }
}
