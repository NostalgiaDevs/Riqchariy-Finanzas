// Contrato: docs/api/endpoints-piloto.md (rama develop)
// Tipos de request/response de cada endpoint que no están en user.ts, economy.ts o game.ts.

import type { JarId, League, PlayerState } from './economy'

// ── Decisiones ──

export interface DecisionRequest {
  event_id: string
  choice_id: string
}

export interface DecisionResponse {
  outcome: string
  effects: {
    wallet_change: number
    stress_change: number
    score_change: number
    flags_added: string[]
    teaches: string[]
  }
  new_state: PlayerState
}

export type RiskLevel = 'low' | 'medium' | 'high'

export interface DecisionPreviewResponse {
  preview: {
    wallet_after: number
    stress_after: number
    warning: string | null
    risk_level: RiskLevel
  }
}

// ── Ahorro ──

export interface SavingsTransferRequest {
  from: 'wallet' | JarId
  to: 'wallet' | JarId
  amount: number
}

export interface SavingsTransferResponse {
  success: boolean
  wallet: number
  jar_balance: number
  friction_warning: string | null
}

// ── Tienda ──

export interface ShopItem {
  id: string
  name: string
  price: number
  icon: string
  description: string
  installment_available: boolean
  installment_detail: {
    per_month: number
    months: number
    total: number
  } | null
  can_afford: boolean
}

export interface ShopItemsResponse {
  rotation_week: number
  items: ShopItem[]
}

export type PaymentMethod = 'contado' | 'cuotas'

export interface ShopBuyRequest {
  item_id: string
  payment_method: PaymentMethod
}

export interface ShopBuyResponse {
  success: boolean
  item: string
  cost: number
  payment_method: PaymentMethod
  new_wallet: number
  stress_change: number
}

// ── Leaderboard ──

export interface LeaderboardEntry {
  rank: number
  alias: string
  score: number
  league: League
  league_icon: string
}

export interface LeaderboardResponse {
  classroom: string
  rankings: LeaderboardEntry[]
  my_rank: number
  total_players: number
}

// ── Chatbot ──

export interface ChatRequest {
  message: string
}

export interface ChatResponse {
  response: string
  concepts_referenced: string[]
  sources: string[]
}

// ── Misiones ──

export interface Mission {
  id: string
  name: string
  description: string
  icon: string
  progress: { current: number; target: number }
  reward: number
  expires_tick: number
}

export interface MissionsResponse {
  active: Mission[]
  /** PROVISIONAL: el contrato muestra arrays vacíos; se asume lista de IDs. */
  completed_this_week: string[]
  /** PROVISIONAL: se asume lista de IDs. */
  claimable: string[]
}

export interface MissionClaimResponse {
  mission_id: string
  reward: number
  new_wallet: number
  message: string
}

// ── Health ──

export interface HealthResponse {
  status: 'ok' | string
  version: string
  db?: string
  redis?: string
  uptime_seconds?: number
}

// ── Errores ──

/** Formato de error de FastAPI: detail es un string o la lista de errores de validación (422). */
export interface ApiErrorBody {
  detail?: string | { msg: string; loc?: (string | number)[] }[]
  message?: string
}
