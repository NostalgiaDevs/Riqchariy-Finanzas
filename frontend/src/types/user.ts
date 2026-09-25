// Contrato: docs/api/endpoints-piloto.md (rama develop) · sección Auth
// Los alumnos usan un alias: el piloto no guarda datos personales reales.

export interface RegisterRequest {
  alias: string
  password: string
  classroom_code: string
}

export interface RegisterResponse {
  player_id: string
  alias: string
  token: string
}

export interface LoginRequest {
  alias: string
  password: string
}

export interface LoginResponse {
  player_id: string
  alias: string
  token: string
  /** Segundos hasta que el JWT expira (86400 = 24h). */
  expires_in: number
}

/** Lo que el frontend guarda del usuario logueado. */
export interface SessionUser {
  player_id: string
  alias: string
}
