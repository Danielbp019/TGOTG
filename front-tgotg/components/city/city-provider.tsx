'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { setCityBuildings, setWorldSize } from '@/game/city-data'
import type { CityPayload } from '@/lib/api'
import { ApiError, fetchCity, fetchCityById } from '@/lib/api'
import { useAuth } from '@/components/auth/auth-provider'

interface CityContextValue {
  city: CityPayload | null
  isLoading: boolean
  error: ApiError | null
  /** Timestamp de la última carga exitosa, útil para remontar escenas. */
  version: number
  reload: () => Promise<void>
}

const CityContext = React.createContext<CityContextValue | null>(null)

export function CityProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const params = useParams<{ id?: string }>()
  const activeCityId = typeof params?.id === 'string' ? params.id : null
  const userId = user?.id ?? null
  const [version, setVersion] = React.useState(0)

  const queryKey = React.useMemo(
    () => ['city', activeCityId ?? 'default'] as const,
    [activeCityId]
  )

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const response = await (
        activeCityId
          ? fetchCityById(activeCityId, signal)
          : fetchCity(signal)
      )
      return response.city
    },
    enabled: !!userId && !authLoading,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false
      const hasUpgrading = data.buildings.some((b) => b.upgrading)
      return hasUpgrading ? 5000 : false
    },
  })

  const city = query.data ?? null
  const isLoading = query.isLoading
  const error = React.useMemo(
    () =>
      query.error instanceof ApiError
        ? query.error
        : query.error
          ? new ApiError(500, 'No se pudo cargar la ciudad.')
          : null,
    [query.error]
  )

  // Sincronizar datos con Phaser cuando cambian.
  React.useEffect(() => {
    if (!city) return
    setCityBuildings(city.buildings)
    if (city.worldSize) setWorldSize(city.worldSize)
  }, [city])

  // Incrementar versión cuando la query se resuelve con éxito.
  const prevFetchStatusRef = React.useRef(query.fetchStatus)
  React.useEffect(() => {
    if (
      prevFetchStatusRef.current === 'fetching' &&
      query.fetchStatus === 'idle' &&
      query.status === 'success'
    ) {
      setVersion((v) => v + 1)
    }
    prevFetchStatusRef.current = query.fetchStatus
  }, [query.fetchStatus, query.status])

  // Resetear versión al cambiar de ciudad.
  const prevCityRef = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (prevCityRef.current !== activeCityId) {
      prevCityRef.current = activeCityId
      setVersion(0)
    }
  }, [activeCityId])

  const reload = React.useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey })
  }, [queryClient, queryKey])

  const value = React.useMemo(
    () => ({ city, isLoading, error, version, reload }),
    [city, isLoading, error, version, reload]
  )

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>
}

export function useCity() {
  const context = React.useContext(CityContext)
  if (!context) {
    throw new Error('useCity debe usarse dentro de <CityProvider>')
  }
  return context
}
