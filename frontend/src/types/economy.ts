// Contrato: docs/api/endpoints-piloto.md (rama develop) · sección Pacha
// Los nombres de campos se mantienen en snake_case, igual que el JSON del backend.

export type League = 'chaski' | 'qollqa' | 'amauta' | 'apu'

export type JarId = 'meta' | 'emergencias' | 'libre'

/** PROVISIONAL: el contrato solo muestra "banco"; confirmar los otros valores con BE. */
export type LoanProduct = 'banco' | 'tienda' | 'prestamista'

export interface Loan {
  id: string
  product: LoanProduct
  principal: number
  remaining: number
  monthly_rate: number
  installment: number
  next_due_tick: number
}

export interface Savings {
  meta: {
    balance: number
    goal_item: string | null
    goal_target: number
  }
  emergencias: { balance: number }
  libre: { balance: number }
}

export interface Job {
  id: string
  name: string
  wage_per_week: number
  /** 0–1 */
  performance: number
}

/** Respuesta de GET /pacha/state. */
export interface PlayerState {
  player_id: string
  wallet: number
  savings: Savings
  job: Job
  loans: Loan[]
  /** 300–850 */
  credit_score: number
  /** 0–1 */
  stress: number
  /** 0–1000 */
  score: number
  league: League
  current_tick: number
  inventory: string[]
  flags: string[]
  /** IDs de eventos por decidir (ej. "EMR-001"). */
  pending_events: string[]
  /** IDs de misiones activas (ej. "MSN-001"). */
  active_missions: string[]
}

export interface MissionProgress {
  current?: number
  target?: number
  complete: boolean
  reason?: string
}

export interface DaySummary {
  income: number
  expenses: number
  interest_earned: number
  loan_payments: number
  events_triggered: string[]
  missions_progress: Record<string, MissionProgress>
  score_change: number
  stress_change: number
}

/** Respuesta de POST /pacha/next-day. */
export interface NextDayResponse {
  tick: number
  summary: DaySummary
  new_state: PlayerState
}

/**
 * PROVISIONAL: el contrato no define cómo llega la carta del evento
 * (pending_events solo trae IDs). Forma tomada de PILOTO-2-SEMANAS §3.4.
 * Ver PLAN-FRONTEND §10.5.
 */
export interface EventCard {
  id: string
  name: string
  description: string
  icon: string
  category: 'emergency' | 'temptation' | 'opportunity' | 'macro' | 'social'
  choices: EventChoice[]
  teaches: string[]
}

/** PROVISIONAL: ver EventCard. */
export interface EventChoice {
  id: string
  text: string
  preview_label: string
}
