import { delay, HttpResponse } from 'msw'
import type { PlayerState } from '@/types/economy'
import { mockDb, userFromRequest, type MockUser } from '../db'

/** Latencia simulada (0 en tests para que sean rápidos). */
export const latency = () => delay(import.meta.env.MODE === 'test' ? 0 : 350)

/** Error con el mismo formato que FastAPI: { detail }. */
export const apiError = (status: number, detail: string) =>
  HttpResponse.json({ detail }, { status })

interface AuthedContext {
  request: Request
  params: Record<string, string | readonly string[] | undefined>
  user: MockUser
  state: PlayerState
}

type AuthedResolver = (ctx: AuthedContext) => Response | Promise<Response>

/** Envuelve un handler que exige token válido: 401 si falta, igual que el backend. */
export function withAuth(resolver: AuthedResolver) {
  return async ({
    request,
    params,
  }: {
    request: Request
    params: Record<string, string | readonly string[] | undefined>
  }) => {
    await latency()
    const user = userFromRequest(request)
    const state = user ? mockDb.states.get(user.player_id) : undefined
    if (!user || !state) return apiError(401, 'Tu sesión terminó. Vuelve a entrar.')
    return resolver({ request, params, user, state })
  }
}

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export const round2 = (n: number) => Math.round(n * 100) / 100
