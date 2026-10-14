import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { useAuthStore } from '@/core/store/authStore'
import { server } from '@/test/server'
import { API_BASE, ApiError, apiRequest, readErrorMessage } from './client'
import { authApi, pachaApi } from './endpoints'

describe('readErrorMessage', () => {
  it('usa detail cuando es texto (HTTPException de FastAPI)', () => {
    expect(readErrorMessage(400, { detail: 'No tienes ⵊ180 en tu billetera' })).toBe(
      'No tienes ⵊ180 en tu billetera',
    )
  })

  it('usa el primer mensaje cuando detail es una lista (error 422 de validación)', () => {
    expect(
      readErrorMessage(422, { detail: [{ msg: 'field required', loc: ['body', 'alias'] }] }),
    ).toBe('field required')
  })

  it('cae a un mensaje amable si el cuerpo no trae nada útil', () => {
    expect(readErrorMessage(500, null)).toBe('Algo salió mal de nuestro lado. Intenta de nuevo.')
    expect(readErrorMessage(418, {})).toBe('Algo salió mal de nuestro lado. Intenta de nuevo.')
  })
})

describe('apiRequest', () => {
  it('envía el token y devuelve el JSON del contrato', async () => {
    const login = await authApi.login({ alias: 'alumno1', password: 'demo1234' })
    useAuthStore.getState().setSession({
      token: login.token,
      user: { player_id: login.player_id, alias: login.alias },
      expiresIn: login.expires_in,
    })

    const state = await pachaApi.getState()
    expect(state.player_id).toBe(login.player_id)
    expect(state.savings.meta.goal_item).toBe('laptop')
  })

  it('ante un 401 cierra la sesión', async () => {
    useAuthStore.getState().setSession({
      token: 'token-vencido',
      user: { player_id: 'x', alias: 'x' },
    })

    await expect(pachaApi.getState()).rejects.toMatchObject({ status: 401 })
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('un 401 en /auth/login no toca la sesión y muestra el mensaje del backend', async () => {
    const error = await authApi.login({ alias: 'alumno1', password: 'mala' }).catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('Alias o contraseña incorrectos.')
  })

  it('convierte un fallo de red en un ApiError con status 0', async () => {
    server.use(http.get(`${API_BASE}/pacha/state`, () => HttpResponse.error()))
    await expect(apiRequest('/pacha/state')).rejects.toMatchObject({
      status: 0,
      message: 'No pudimos conectar con el servidor. Revisa tu internet.',
    })
  })
})
