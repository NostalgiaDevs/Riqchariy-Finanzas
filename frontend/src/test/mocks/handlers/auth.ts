import { http, HttpResponse } from 'msw'
import { API_BASE } from '@/core/api/client'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/types/user'
import { createMockUser, mockDb, tokenFor } from '../db'
import { DEMO_CLASSROOM } from '../fixtures'
import { apiError, latency } from './helpers'

export const authHandlers = [
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    await latency()
    const body = (await request.json()) as Partial<LoginRequest>
    const user = body.alias ? mockDb.users.get(body.alias.trim().toLowerCase()) : undefined
    if (!user || user.password !== body.password) {
      return apiError(401, 'Alias o contraseña incorrectos.')
    }
    return HttpResponse.json<LoginResponse>({
      player_id: user.player_id,
      alias: user.alias,
      token: tokenFor(user),
      expires_in: 86400,
    })
  }),

  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    await latency()
    const body = (await request.json()) as Partial<RegisterRequest>
    const alias = body.alias?.trim().toLowerCase() ?? ''
    if (!alias || !body.password || !body.classroom_code) {
      return apiError(422, 'Completa todos los campos.')
    }
    if (body.password.length < 8) {
      return apiError(422, 'La contraseña debe tener al menos 8 caracteres.')
    }
    if (body.classroom_code.trim().toUpperCase() !== DEMO_CLASSROOM) {
      return apiError(400, 'Ese código de aula no existe. Pídeselo a tu profe.')
    }
    if (mockDb.users.has(alias)) {
      return apiError(409, 'Ese alias ya está en uso. Prueba con otro.')
    }
    const user = createMockUser(alias, body.password, DEMO_CLASSROOM)
    return HttpResponse.json<RegisterResponse>(
      { player_id: user.player_id, alias: user.alias, token: tokenFor(user) },
      { status: 201 },
    )
  }),
]
