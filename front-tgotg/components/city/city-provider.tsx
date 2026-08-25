'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import { setCityBuildings, setWorldSize } from '@/game/city-data'
import type { CityPayload } from '@/lib/api'
import { ApiError, fetchCity, fetchCityById } from '@/lib/api'
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
  const params = useParams<{ id?: string }>()
  // Ciudad activa: la de la ruta /ciudad/[id] o, en su defecto, la primera del jugador.
  const activeCityId = typeof params?.id === 'string' ? params.id : null
  const [city, setCity] = React.useState<CityPayload | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<ApiError | null>(null)
  const [version, setVersion] = React.useState(0)
  const userId = user?.id ?? null

  const load = React.useCallback(
    async (signal?: AbortSignal) => {
      if (authLoading || !userId) return
      setIsLoading(true)
      setError(null)
      try {
        const response = await (
          activeCityId ? fetchCityById(activeCityId, signal) : fetchCity(signal)
        )
        setCity(response.city)
        setCityBuildings(response.city.buildings)
        if (response.city.worldSize) setWorldSize(response.city.worldSize)
        setVersion((current) => current + 1)
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === 'AbortError')
          return
        if (caught instanceof ApiError) {
          if (caught.status === 401 || caught.status === 403 || caught.status === 404) {
            setCity(null)
          }
          setError(caught)
        } else {
          setError(new ApiError(500, 'No se pudo cargar la ciudad.'))
        }
      } finally {
        setIsLoading(false)
      }
    },
    [authLoading, userId, activeCityId]
  )

  const reload = load

  // Evita mostrar datos de la ciudad anterior al navegar a otra.
  const [prevCityId, setPrevCityId] = React.useState(activeCityId)
  if (prevCityId !== activeCityId) {
    setPrevCityId(activeCityId)
    setCity(null)
    setError(null)
  }

  React.useEffect(() => {
    if (authLoading || !userId) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void load(controller.signal)
    }, 0)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [authLoading, userId, load])

  // Recarga cuando termina la mejora más próxima; un temporizador de 1 s
  // evita depender del reloj del cliente para programar la petición.
  const nextUpgradeAt = React.useMemo(() => {
    const times = (city?.buildings ?? [])
      .map((building) => building.upgradeFinishesAt)
      .filter((finish): finish is string => Boolean(finish))
      .map((finish) => new Date(finish).getTime())

    return times.length > 0 ? Math.min(...times) : null
  }, [city])

  React.useEffect(() => {
    if (!nextUpgradeAt) return

    let reloading = false

    const id = window.setInterval(() => {
      if (reloading || Date.now() < nextUpgradeAt + 2000) return

      reloading = true
      void load().finally(() => {
        reloading = false
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [nextUpgradeAt, load])

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
