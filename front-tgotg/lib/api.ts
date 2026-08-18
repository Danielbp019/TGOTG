const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

const TOKEN_STORAGE_KEY = 'tgotg:auth-token'
const UNAUTHORIZED_EVENT = 'tgotg:unauthorized'

export interface AuthUser {
  id: string
  nick: string
  email: string
  role: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export interface BlessingPayload {
  key: string
  name: string
  benefit: string
  description: string | null
}

export interface MyBlessingResponse {
  in_game: boolean
  blessing: BlessingPayload | null
}

interface ApiErrorPayload {
  message?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  readonly status: number
  readonly errors: Record<string, string[]>

  constructor(
    status: number,
    message: string,
    errors: Record<string, string[]> = {}
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function notifyUnauthorized() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
}

export function subscribeToUnauthorized(callback: () => void) {
  window.addEventListener(UNAUTHORIZED_EVENT, callback)
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, callback)
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (response.status === 401) {
    clearToken()
    notifyUnauthorized()
    throw new ApiError(401, 'Sesión caducada. Inicia sesión de nuevo.')
  }

  const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload.message ?? 'Error de servidor',
      payload.errors ?? {}
    )
  }

  return payload as T
}

export function loginRequest(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function registerRequest(data: {
  nick: string
  email: string
  password: string
  password_confirmation: string
}) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function logoutRequest() {
  return apiFetch<{ message: string }>('/auth/logout', {
    method: 'POST',
  })
}

export function fetchMe() {
  return apiFetch<AuthUser>('/user')
}

export async function fetchServerTime() {
  const data = await apiFetch<{ time: string }>('/server-time')
  return data.time
}

export function fetchMyBlessing() {
  return apiFetch<MyBlessingResponse>('/player/blessing')
}

export function updateMyBlessing(key: string) {
  return apiFetch<{ blessing: BlessingPayload }>('/player/blessing', {
    method: 'PUT',
    body: JSON.stringify({ key }),
  })
}