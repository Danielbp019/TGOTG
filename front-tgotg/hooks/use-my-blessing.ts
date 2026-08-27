'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { fetchMyBlessing, updateMyBlessing } from '@/lib/api'
import { useAuth } from '@/components/auth/auth-provider'

export function useMyBlessing() {
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['player-blessing', user?.id ?? null],
    queryFn: fetchMyBlessing,
    enabled: !!user && !authLoading,
  })

  const mutation = useMutation({
    mutationFn: (key: string) => updateMyBlessing(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-blessing', user?.id ?? null] })
      queryClient.invalidateQueries({ queryKey: ['player-resources', user?.id ?? null] })
    },
  })

  return {
    blessing: query.data?.blessing ?? null,
    inGame: query.data?.in_game ?? false,
    refresh: query.refetch,
    hasLoaded: query.status !== 'pending',
    selectBlessing: mutation.mutateAsync,
    isSaving: mutation.isPending,
  }
}
