'use client'

import * as React from 'react'

import { ApiError, fetchCities, type CitiesPayload } from '@/lib/api'
import { useAuth } from '@/components/auth/auth-provider'

export type CitySummary = CitiesPayload['cities'][number]

interface UseCitiesResult {
  cities: CitySummary[]
  isLoading: boolean
  error: ApiError | null
  reload: () => Promise<void>
}

export function useCities(): UseCitiesResult {
  const { user, isLoading: authLoading } = useAuth()
  const [cities, setCities] = React.useState<CitySummary[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<ApiError | null>(null)
  const userId = user?.id ?? null

  const load = React.useCallback(async () => {
    if (authLoading || !userId) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetchCities()
      setCities(response.cities)
    } catch (caught) {
      if (caught instanceof ApiError) {
        if (caught.status === 401) setCities([])
        setError(caught)
      } else {
        setError(new ApiError(500, 'No se pudo cargar la lista de ciudades.'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [authLoading, userId])

  const reload = load

  React.useEffect(() => {
    if (authLoading) return
    if (!userId) {
      const t = window.setTimeout(() => {
        setCities([])
        setIsLoading(false)
      }, 0)
      return () => window.clearTimeout(t)
    }
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [authLoading, userId, load])

  return { cities, isLoading, error, reload }
}
