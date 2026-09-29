// Contrato: docs/api/endpoints-piloto.md (rama develop) · sección Minijuegos

import type { MissionProgress } from './economy'

export type GameId = 'kiosco' | 'la_trampa' | 'invierte_o_pierde' | 'mercado_rapido' | 'qori_quiz'

/** Resultado del Kiosco, tal como lo define el contrato. */
export interface KioscoResultData {
  score: number
  items_sold: number
  time_seconds: number
  perfect: boolean
}

/**
 * PROVISIONAL: payload de PILOTO-2-SEMANAS (puzzle de deudas).
 * ALCANCE-MVP describe La Trampa como juego de estafas → ver PLAN-FRONTEND §10.1.
 */
export interface LaTrampaResultData {
  turns_to_win: number | null
  strategy_used: 'avalanche' | 'snowball' | 'mixed'
  total_interest_paid: number
}

/** PROVISIONAL: SPRINTS-PILOTO S3.BE.03. */
export interface InvierteOPierdeResultData {
  final_value: number
  diversification_score: number
  fell_for_scam: boolean
}

/** PROVISIONAL: SPRINTS-PILOTO S3.BE.03. */
export interface MercadoRapidoResultData {
  profit: number
  accuracy_pct: number
  investigated_before_buying_pct: number
}

/** PROVISIONAL: SPRINTS-PILOTO S3.BE.03. */
export interface QoriQuizResultData {
  score: number
  correct_count: number
  weakest_topic: string
}

export interface GameResultDataMap {
  kiosco: KioscoResultData
  la_trampa: LaTrampaResultData
  invierte_o_pierde: InvierteOPierdeResultData
  mercado_rapido: MercadoRapidoResultData
  qori_quiz: QoriQuizResultData
}

/** Body de POST /games/results. */
export type GameResultRequest = {
  [G in GameId]: { game_id: G; data: GameResultDataMap[G] }
}[GameId]

export interface GameResultResponse {
  reward: number
  performance_update: number
  missions_progress: Record<string, MissionProgress>
  message: string
}
