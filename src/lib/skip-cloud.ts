import type { PricingRecord } from './pricing-types'

const SKIP_CLOUD_URL = import.meta.env.VITE_SKIP_CLOUD_URL ?? ''
const TOKEN_KEY = 'sc-token'
const USER_KEY = 'sc-user'

export interface SkipCloudUser {
  id: string
  email: string
  name?: string
}

function ensureConfigured() {
  if (!SKIP_CLOUD_URL) {
    throw new Error('Skip Cloud não configurado. Verifique a variável VITE_SKIP_CLOUD_URL.')
  }
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export function getStoredUser(): SkipCloudUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SkipCloudUser
  } catch {
    return null
  }
}

function persistSession(user: SkipCloudUser | null, token: string | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function loginWithPassword(email: string, password: string): Promise<SkipCloudUser> {
  ensureConfigured()
  const res = await fetch(`${SKIP_CLOUD_URL}/api/collections/users/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Credenciais inválidas')
  }
  const data = await res.json()
  const user: SkipCloudUser = {
    id: data.record.id,
    email: data.record.email,
    name: data.record.name,
  }
  persistSession(user, data.token)
  return user
}

export async function signUp(
  email: string,
  password: string,
  name?: string,
): Promise<SkipCloudUser> {
  ensureConfigured()
  const res = await fetch(`${SKIP_CLOUD_URL}/api/collections/users/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, passwordConfirm: password, name: name || '' }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Erro ao criar conta')
  }
  return loginWithPassword(email, password)
}

export function clearSession() {
  persistSession(null, null)
}

export async function savePricingRecord(
  data: Omit<PricingRecord, 'id' | 'created' | 'updated'>,
): Promise<PricingRecord> {
  ensureConfigured()
  const res = await fetch(`${SKIP_CLOUD_URL}/api/collections/pricing_data/records`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Erro ao salvar dados de precificação')
  }
  return res.json()
}

export async function fetchPricingRecords(userId: string): Promise<PricingRecord[]> {
  ensureConfigured()
  const filter = encodeURIComponent(`user = "${userId}"`)
  const res = await fetch(
    `${SKIP_CLOUD_URL}/api/collections/pricing_data/records?filter=${filter}&sort=-created&perPage=200`,
    { headers: authHeaders() },
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Erro ao buscar dados de precificação')
  }
  const data = await res.json()
  return (data.items || []) as PricingRecord[]
}
