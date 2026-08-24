'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'

import {
  fetchMe,
  loginRequest,
  logoutRequest,
  registerRequest,
  subscribeToUnauthorized,
  type AuthUser,
} from '@/lib/api'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    nick: string
    email: string
    password: string
    password_confirmation: string
  }) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: AuthUser) => void
}

const AUTH_PATHS = ['/login', '/register']

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.includes(pathname)
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const hasRedirectedRef = React.useRef(false)
  const hasLoadedRef = React.useRef(false)

  React.useEffect(() => {
    // El usuario se resuelve una sola vez por sesión de página:
    // los cambios de ruta no deben volver a consultar /api/user.
    if (hasLoadedRef.current) return

    let active = true
    const timer = window.setTimeout(() => {
      const finish = () => {
        if (!active) return
        hasLoadedRef.current = true
        setIsLoading(false)
      }

      if (isAuthPath(pathname)) {
        if (active) setUser(null)
        finish()
        return
      }

      fetchMe()
        .then((current) => {
          if (active) setUser(current)
        })
        .catch(() => {
          if (active) setUser(null)
        })
        .finally(finish)
    }, 0)

    const unsubscribe = subscribeToUnauthorized(() => {
      setUser(null)
    })

    return () => {
      active = false
      window.clearTimeout(timer)
      unsubscribe()
    }
  }, [pathname])

  React.useEffect(() => {
    if (isLoading) return

    const isAuthRoute = isAuthPath(pathname)
    if (!user && !isAuthRoute) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true
        router.replace('/login')
      }
    } else if (user && isAuthRoute) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true
        router.replace('/')
      }
    } else {
      hasRedirectedRef.current = false
    }
  }, [isLoading, pathname, router, user])

  const login = React.useCallback(
    async (email: string, password: string) => {
      const { user: authenticated } = await loginRequest(email, password)
      setUser(authenticated)
      hasRedirectedRef.current = true
      router.replace('/')
    },
    [router]
  )

  const register = React.useCallback(
    async (data: {
      nick: string
      email: string
      password: string
      password_confirmation: string
    }) => {
      const { user: created } = await registerRequest(data)
      setUser(created)
      hasRedirectedRef.current = true
      router.replace('/')
    },
    [router]
  )

  const logout = React.useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // Sesión ya expirada.
    } finally {
      setUser(null)
      hasRedirectedRef.current = true
      router.replace('/login')
    }
  }, [router])

  const updateUser = React.useCallback((updated: AuthUser) => {
    setUser(updated)
  }, [])

  const value = React.useMemo(
    () => ({ user, isLoading, login, register, logout, updateUser }),
    [isLoading, login, logout, register, updateUser, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
