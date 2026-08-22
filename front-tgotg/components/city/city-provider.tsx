'use client'

import * as React from 'react'
import { setCityBuildings, setWorldSize } from '@/game/city-data'
import type { CityPayload } from '@/lib/api'
import { ApiError, fetchCity } from '@/lib/api'
import { useAuth } from '@/components/auth/auth-provider'

interface CityContextValue {
  city: CityPayload | null
  isLoading: boolean
  error: ApiError | null
  /** Número de cargas completadas con éxito, útil para remontar escenas. */
  version: number
  reload: () => Promise<void>
}

const CityContext = React.createContext<CityContextValue | null>(null)

export function CityProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const [city, setCity] = React.useState<CityPayload | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<ApiError | null>(null)
  const [version, setVersion] = React.useState(0)
  const userId = user?.id ?? null

  const load = React.useCallback(async (signal?: AbortSignal) => {
    if (authLoading || !userId) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetchCity(signal)
      setCity(response.city)
      setCityBuildings(response.city.buildings)
      if (response.city.worldSize) setWorldSize(response.city.worldSize)
      setVersion((current) => current + 1)
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return
      if (caught instanceof ApiError) {
        if (caught.status === 401) {
          setCity(null)
        }
        setError(caught)
      } else {
        setError(new ApiError(500, 'No se pudo cargar la ciudad.'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [authLoading, userId])

  React.useEffect(() => {
    if (authLoading || !userId) {
      setIsLoading(false)
      return
    }
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [authLoading, userId, load])

  const hasUpgrading = React.useMemo(
    () => city?.buildings.some((b) => b.upgrading) ?? false,
    [city]
  )

  React.useEffect(() => {
    if (!hasUpgrading) return
    const id = window.setInterval(() => {
      load()
    }, 5000)
    return () => window.clearInterval(id)
  }, [hasUpgrading, load])

  const value = React.useMemo(
    () => ({ city, isLoading, error, version, reload: load }),
    [city, isLoading, error, version, load]
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
