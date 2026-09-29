import { describe, expect, it } from 'vitest'
import { AUTH_STORAGE_KEY, hasValidSession, useAuthStore } from './authStore'

describe('hasValidSession', () => {
  it('sin token no hay sesión', () => {
    expect(hasValidSession({ token: null, expiresAt: null })).toBe(false)
  })

  it('con token vigente hay sesión; vencido, no', () => {
    const now = 1_000_000
    expect(hasValidSession({ token: 't', expiresAt: now + 1 }, now)).toBe(true)
    expect(hasValidSession({ token: 't', expiresAt: now - 1 }, now)).toBe(false)
  })
})

describe('useAuthStore', () => {
  it('guarda la sesión en localStorage y la borra al cerrar sesión', () => {
    useAuthStore.getState().setSession({
      token: 'abc',
      user: { player_id: 'p1', alias: 'alumno1' },
      expiresIn: 86400,
    })
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toContain('"token":"abc"')

    useAuthStore.getState().logout()
    expect(useAuthStore.getState().token).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toContain('"token":null')
  })
})
