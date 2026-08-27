import type { PlotShape, ResourceKey } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

const UNAUTHORIZED_EVENT = 'tgotg:unauthorized'

export interface AuthUser {
  id: string
  nick: string
  email: string
  role: string
}

export interface AuthResponse {
  user: AuthUser
  token?: string
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

export interface BuildingLevelCost {
  gold: number
  wood: number
  stone: number
  iron: number
  minutes: number
}

export interface BuildingTypePayload {
  key: string
  name: string
  category: string
  description: string | null
  max_level: number
  gold_cost: number
  wood_cost: number
  stone_cost: number
  iron_cost: number
  base_minutes: number
  repair_material: string
  /** Costo por nivel (índice 0 = nivel 1), calculado por el backend. */
  levels: BuildingLevelCost[]
}

export interface CivilizationPayload {
  key: string
  name: string
  benefit: string
  description: string | null
}

export interface MyCivilizationResponse {
  in_game: boolean
  civilization: CivilizationPayload | null
}

export interface GameOptionPayload {
  key: string
  label: string
  value: number
  description: string | null
}

export interface GameOptionsPayload {
  durations: GameOptionPayload[]
  multipliers: GameOptionPayload[]
}

export interface CityBuildingRepairCost {
  gold: number
  material: string
  amount: number
}

export interface CityBuilding {
  id: string
  key: string
  name: string
  category: string
  level: number
  damage: number
  repairing: boolean
  repairPaid: boolean
  repairMaterial: string
  /** Costo total de reparación pagada; null si no aplica. */
  repairCost: CityBuildingRepairCost | null
  upgrading: boolean
  upgradeFinishesAt: string | null
  shape: PlotShape
  x: number
  y: number
  width: number
  height: number
}

export interface CityPayload {
  name: string | null
  resources: Record<ResourceKey, number>
  perHour: Record<ResourceKey, number>
  population: number
  happiness: number
  defense: number
  stationedTroops: number
  defensePower: number
  protectionUntil: string | null
  worldSize: { width: number; height: number }
  buildings: CityBuilding[]
}

export interface WorldPayload {
  id: string
  status: string
  durationDays: number
  speedMultiplier: number
  startedAt: string | null
  endedAt: string | null
}

export interface ConversationParticipantPayload {
  nick: string
}

export interface ConversationMessagePayload {
  id: string
  body: string
  sentAt: string
  fromMe: boolean
}

export interface ConversationSummaryPayload {
  id: string
  participant: ConversationParticipantPayload
  lastMessage: Omit<ConversationMessagePayload, 'id'> | null
  unreadCount: number
}

export interface ConversationDetailPayload {
  id: string
  participant: ConversationParticipantPayload
  messages: ConversationMessagePayload[]
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

let lastUnauthorizedAt = 0

export function notifyUnauthorized() {
  if (typeof window === 'undefined') return
  const now = Date.now()
  if (now - lastUnauthorizedAt < 1000) return
  lastUnauthorizedAt = now
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
}

export function subscribeToUnauthorized(callback: () => void) {
  window.addEventListener(UNAUTHORIZED_EVENT, callback)
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, callback)
}

function getXsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
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

  const xsrf = getXsrfToken()
  if (xsrf) headers.set('X-XSRF-TOKEN', xsrf)

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401) {
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

export function loginRequest(email: string, password: string, remember: boolean = false) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, remember }),
  })
}

export function registerRequest(data: {
  nick: string
  email: string
  password: string
  password_confirmation: string
  remember?: boolean
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

export function updateAccountProfile(data: {
  nick: string
  current_password?: string
  password?: string
  password_confirmation?: string
}) {
  return apiFetch<{ user: AuthUser }>('/account/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteAccount(data: {
  confirm_nick: string
  password: string
}) {
  return apiFetch<{ message: string }>('/account', {
    method: 'DELETE',
    body: JSON.stringify(data),
  })
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

export function fetchMyCivilization() {
  return apiFetch<MyCivilizationResponse>('/player/civilization')
}

export interface MyResourcesResponse {
  in_game: boolean
  resources: Record<ResourceKey, number> | null
}

export function fetchMyResources() {
  return apiFetch<MyResourcesResponse>('/player/resources')
}

export function updateMyCivilization(key: string) {
  return apiFetch<{ civilization: CivilizationPayload }>(
    '/player/civilization',
    {
      method: 'PUT',
      body: JSON.stringify({ key }),
    }
  )
}

export function fetchCivilizations() {
  return apiFetch<{ civilizations: CivilizationPayload[] }>('/civilizations')
}

export function fetchBlessings() {
  return apiFetch<{ blessings: BlessingPayload[] }>('/blessings')
}

export function fetchBuildingTypes() {
  return apiFetch<{ building_types: BuildingTypePayload[] }>('/building-types')
}



export interface BiomePayload {
  id: string
  key: string
  label: string | null
  description: string | null
  bonusResource: string
  bonusValue: number
}

export interface RegionPayload {
  id: string
  key: string
  label: string
  polygon: number[]
  sortOrder: number
  biomes: BiomePayload[]
}

export interface CitiesPayload {
  cities: Array<{
    id: string
    name: string
    region: { id: string; key: string; label: string } | null
    biome: { id: string; key: string } | null
  }>
}

export function fetchRegions() {
  return apiFetch<{ regions: RegionPayload[] }>('/regions')
}

export function fetchBiomes() {
  return apiFetch<{ biomes: BiomePayload[] }>('/biomes')
}



export function fetchCities() {
  return apiFetch<CitiesPayload>('/cities')
}

export function createCity(data: { name: string; region_id: string; biome_id: string }) {
  return apiFetch<{ city: { id: string; name: string } }>('/cities', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function fetchGameOptions() {
  return apiFetch<GameOptionsPayload>('/game-options')
}

export function fetchCity(signal?: AbortSignal) {
  return apiFetch<{ city: CityPayload }>('/city', { signal } as RequestInit)
}

export function fetchCityById(id: string, signal?: AbortSignal) {
  return apiFetch<{ city: CityPayload }>(`/cities/${id}`, { signal } as RequestInit)
}

export function repairBuilding(buildingId: string, type: 'paid' | 'auto') {
  return apiFetch<{
    building: Pick<CityBuilding, 'key' | 'damage'> & {
      repairing: boolean
      repairPaid: boolean
    }
  }>(`/city/buildings/${buildingId}/repair`, {
    method: 'POST',
    body: JSON.stringify({ type }),
  })
}

export function upgradeBuilding(buildingId: string, instant?: boolean) {
  const query = instant ? '?instant=1' : ''
  return apiFetch<{
    building: Pick<
      CityBuilding,
      'id' | 'level' | 'upgrading' | 'upgradeFinishesAt'
    > & {
      targetLevel?: number
      cost?: {
        gold: number
        wood: number
        stone: number
        iron: number
        minutes: number
      }
    }
  }>(`/city/buildings/${buildingId}/upgrade${query}`, {
    method: 'POST',
  })
}

export function createWorld(data: {
  duration_key: string
  multiplier_key: string
}) {
  return apiFetch<{ world: WorldPayload }>('/worlds', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function fetchConversations() {
  return apiFetch<{ conversations: ConversationSummaryPayload[] }>(
    '/conversations'
  )
}

export function fetchConversation(id: string) {
  return apiFetch<{ conversation: ConversationDetailPayload }>(
    `/conversations/${id}`
  )
}

export function createConversation(data: {
  recipient_nick: string
  body: string
}) {
  return apiFetch<{ conversation: ConversationDetailPayload }>(
    '/conversations',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  )
}

export function sendMessage(id: string, body: string) {
  return apiFetch<{ conversation: ConversationDetailPayload }>(
    `/conversations/${id}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ body }),
    }
  )
}

export function deleteConversation(id: string) {
  return apiFetch<{ message: string }>(`/conversations/${id}`, {
    method: 'DELETE',
  })
}
