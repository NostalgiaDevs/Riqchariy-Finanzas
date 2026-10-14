// "Base de datos" en memoria de los mocks. Se reinicia al recargar la página (y en cada test con resetMockDb).

import type { PlayerState } from '@/types/economy'
import { DEMO_CLASSROOM, DEMO_PASSWORD, examplePlayerState, freshPlayerState } from './fixtures'

export interface MockUser {
  player_id: string
  alias: string
  password: string
  classroom_code: string
}

interface MockDb {
  users: Map<string, MockUser>
  states: Map<string, PlayerState>
  claimedMissions: Map<string, Set<string>>
  lastGameAt: Map<string, number>
}

function seed(): MockDb {
  const db: MockDb = {
    users: new Map(),
    states: new Map(),
    claimedMissions: new Map(),
    lastGameAt: new Map(),
  }
  // Seed de S1.DB.03: alumno1…alumno10 con contraseña demo1234 en el aula RIQCHARIY-DEMO.
  for (let i = 1; i <= 10; i++) {
    const user: MockUser = {
      player_id: `mock-player-${i}`,
      alias: `alumno${i}`,
      password: DEMO_PASSWORD,
      classroom_code: DEMO_CLASSROOM,
    }
    db.users.set(user.alias, user)
    db.states.set(user.player_id, examplePlayerState(user.player_id))
  }
  return db
}

export let mockDb = seed()

export function resetMockDb() {
  mockDb = seed()
}

export function createMockUser(alias: string, password: string, classroom_code: string) {
  const user: MockUser = {
    player_id: `mock-player-${crypto.randomUUID()}`,
    alias,
    password,
    classroom_code,
  }
  mockDb.users.set(alias, user)
  mockDb.states.set(user.player_id, freshPlayerState(user.player_id))
  return user
}

export const tokenFor = (user: MockUser) => `mock-token.${user.player_id}`

/** Busca al usuario del header Authorization. null si falta o no es válido. */
export function userFromRequest(request: Request): MockUser | null {
  const header = request.headers.get('Authorization') ?? ''
  const token = header.replace(/^Bearer\s+/i, '')
  if (!token.startsWith('mock-token.')) return null
  const playerId = token.slice('mock-token.'.length)
  for (const user of mockDb.users.values()) {
    if (user.player_id === playerId) return user
  }
  return null
}
