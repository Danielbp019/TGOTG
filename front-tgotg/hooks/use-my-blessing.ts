'use client'

import * as React from 'react'

import { fetchMyBlessing, type BlessingPayload, type MyBlessingResponse } from '@/lib/api'
import { useAuth } from '@/components/auth/auth-provider'
import { subscribeToBlessingChanges } from '@/lib/blessing'

let cachedResponse: MyBlessingResponse | undefined
let pendingPromise: Promise<MyBlessingResponse> | null = null

function fetchDeduped(): Promise<MyBlessingResponse> {
  if (pendingPromise) return pendingPromise
  pendingPromise = fetchMyBlessing()
    .then((res) => {
      cachedResponse = res
      return res
    })
    .catch(() => {
      const fallback: MyBlessingResponse = { in_game: false, blessing: null }
      cachedResponse = fallback
      return fallback
    })
    .finally(() => {
      setTimeout(() => {
        pendingPromise = null
      }, 2000)
    })
  return pendingPromise
}

export function useMyBlessing() {
  const { user, isLoading: authLoading } = useAuth()
  const [data, setData] = React.useState<MyBlessingResponse | undefined>(cachedResponse)

  const refresh = React.useCallback(async () => {
    if (authLoading || !user) {
      setData(undefined)
      return
    }
    const res = await fetchDeduped()
    setData(res)
  }, [authLoading, user])

  React.useEffect(() => {
    if (authLoading || !user) {
      setData(undefined)
      return
    }
    if (cachedResponse !== undefined) {
      setData(cachedResponse)
    }
    const t = window.setTimeout(refresh, 0)
    const unsub = subscribeToBlessingChanges(refresh)
    return () => {
      window.clearTimeout(t)
      unsub()
    }
  }, [authLoading, user, refresh])

  return {
    blessing: data?.blessing ?? null,
    inGame: data?.in_game ?? false,
    refresh,
    hasLoaded: data !== undefined,
  }
}
