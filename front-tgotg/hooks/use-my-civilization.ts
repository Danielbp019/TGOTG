'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchMyCivilization } from '@/lib/api'
import { useAuth } from '@/components/auth/auth-provider'

export function useMyCivilization() {
  const { user, isLoading: authLoading } = useAuth()

  const query = useQuery({
    queryKey: ['player-civilization', user?.id ?? null],
    queryFn: fetchMyCivilization,
    enabled: !!user && !authLoading,
  })

  return {
    civilization: query.data?.in_game ? query.data.civilization : null,
    isLoading: query.isLoading,
    error: query.error ?? null,
  }
}
