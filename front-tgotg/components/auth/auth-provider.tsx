'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'

import {
  clearToken,
  fetchMe,
  getToken,
  loginRequest,
  logoutRequest,
  registerRequest,
  setToken,
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
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      if (!getToken()) {
        if (active) setIsLoading(false)
        return
      }

      fetchMe()
        .then((current) => {
          if (active) setUser(current)
        })
        .catch(() => {
          if (active) {
            clearToken()
            setUser(null)
          }
        })
        .finally(() => {
          if (active) setIsLoading(false)
        })
    }, 0)

    const unsubscribe = subscribeToUnauthorized(() => {
      setUser(null)
      router.replace('/login')
    })

    return () => {
      active = false
      window.clearTimeout(timer)
      unsubscribe()
    }
  }, [router])

  React.useEffect(() => {
    if (isLoading) return

    const isAuthRoute = pathname === '/login' || pathname === '/register'
    if (!user && !isAuthRoute) {
      router.replace('/login')
    } else if (user && isAuthRoute) {
      router.replace('/')
    }
  }, [isLoading, pathname, router, user])

  const login = React.useCallback(
    async (email: string, password: string) => {
      const { token, user: authenticated } = await loginRequest(email, password)
      setToken(token)
      setUser(authenticated)
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
      const { token, user: created } = await registerRequest(data)
      setToken(token)
      setUser(created)
      router.replace('/')
    },
    [router]
  )

  const logout = React.useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      clearToken()
      setUser(null)
      router.replace('/login')
    }
  }, [router])

  const value = React.useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [isLoading, login, logout, register, user]
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