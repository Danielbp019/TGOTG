'use client'

import * as React from 'react'

import { ApiError, fetchMyResources, type MyResourcesResponse } from '@/lib/api'
import { useAuth } from '@/components/auth/auth-provider'

export type PlayerResources = NonNullable<MyResourcesResponse['resources']>

interface UseMyResourcesResult {
  resources: PlayerResources | null
  isLoading: boolean
  error: ApiError | null
  refresh: () => Promise<void>
}

export function useMyResources(): UseMyResourcesResult {
  const { user, isLoading: authLoading } = useAuth()
  const [data, setData] = React.useState<MyResourcesResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<ApiError | null>(null)

  const refresh = React.useCallback(async () => {
    if (authLoading || !user) return
    setIsLoading(true)
    setError(null)
    try {
      setData(await fetchMyResources())
    } catch (caught) {
      if (caught instanceof ApiError) setError(caught)
      else setError(new ApiError(500, 'No se pudieron cargar los recursos.'))
    } finally {
      setIsLoading(false)
    }
  }, [authLoading, user])

  React.useEffect(() => {
    if (authLoading) return
    if (!user) {
      const t = window.setTimeout(() => {
        setData(null)
        setIsLoading(false)
      }, 0)
      return () => window.clearTimeout(t)
    }

    const t = window.setTimeout(() => {
      void refresh()
    }, 0)
    return () => window.clearTimeout(t)
  }, [authLoading, user, refresh])

  return {
    resources: data?.in_game ? data.resources : null,
    isLoading,
    error,
    refresh,
  }
}
