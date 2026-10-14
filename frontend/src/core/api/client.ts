import { useAuthStore } from '@/core/store/authStore'
import type { ApiErrorBody } from '@/types/api'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

/** Todos los endpoints del contrato viven bajo /api/v1 (excepto /health). */
export const API_BASE = `${API_URL}/api/v1`
export const HEALTH_URL = `${API_URL}/health`

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const FALLBACK_MESSAGES: Record<number, string> = {
  0: 'No pudimos conectar con el servidor. Revisa tu internet.',
  401: 'Tu sesión terminó. Vuelve a entrar.',
  404: 'No encontramos lo que buscabas.',
  429: 'Vas muy rápido. Espera un momento e intenta de nuevo.',
  500: 'Algo salió mal de nuestro lado. Intenta de nuevo.',
}

/** Extrae un mensaje legible del cuerpo de error de FastAPI. */
export function readErrorMessage(status: number, body: unknown): string {
  const data = (body ?? {}) as ApiErrorBody
  if (typeof data.detail === 'string' && data.detail) return data.detail
  if (Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg
  if (typeof data.message === 'string' && data.message) return data.message
  return FALLBACK_MESSAGES[status] ?? FALLBACK_MESSAGES[500]!
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** false para /auth/*: no envía token ni cierra sesión ante un 401. */
  auth?: boolean
  signal?: AbortSignal
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = options
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (auth) {
    const token = useAuthStore.getState().token
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, FALLBACK_MESSAGES[0]!)
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    // Token vencido o inválido: se cierra la sesión y RequireAuth manda a /login.
    if (response.status === 401 && auth) useAuthStore.getState().logout()
    throw new ApiError(response.status, readErrorMessage(response.status, payload))
  }

  return payload as T
}
