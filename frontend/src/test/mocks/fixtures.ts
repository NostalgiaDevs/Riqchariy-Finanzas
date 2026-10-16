// Datos de ejemplo copiados de docs/api/endpoints-piloto.md (rama develop).
// Si el contrato cambia, se actualiza aquí y en src/types/.

import type { PlayerState } from '@/types/economy'

export const DEMO_CLASSROOM = 'RIQCHARIY-DEMO'
export const DEMO_PASSWORD = 'demo1234'

/** Estado de ejemplo de GET /pacha/state (el alumno demo arranca así para que la VitalBar tenga datos). */
export function examplePlayerState(player_id: string): PlayerState {
  return {
    player_id,
    wallet: 135,
    savings: {
      meta: { balance: 140, goal_item: 'laptop', goal_target: 900 },
      emergencias: { balance: 80 },
      libre: { balance: 0 },
    },
    job: {
      id: 'ayudante_kiosco',
      name: 'Ayudante de kiosco',
      wage_per_week: 60,
      performance: 0.75,
    },
    loans: [
      {
        id: `loan-${player_id}-1`,
        product: 'banco',
        principal: 100,
        remaining: 65,
        monthly_rate: 0.05,
        installment: 55,
        next_due_tick: 21,
      },
    ],
    credit_score: 610,
    stress: 0.25,
    score: 642,
    league: 'chaski',
    current_tick: 14,
    inventory: ['candado'],
    flags: ['decision_informada'],
    pending_events: ['EMR-001'],
    active_missions: ['MSN-001', 'MSN-004', 'MSN-009'],
  }
}

/** Estado de un alumno recién registrado (S1.DB.03: todo en 0, tick 0). */
export function freshPlayerState(player_id: string): PlayerState {
  return {
    player_id,
    wallet: 0,
    savings: {
      meta: { balance: 0, goal_item: null, goal_target: 0 },
      emergencias: { balance: 0 },
      libre: { balance: 0 },
    },
    job: {
      id: 'ayudante_kiosco',
      name: 'Ayudante de kiosco',
      wage_per_week: 60,
      performance: 1,
    },
    loans: [],
    credit_score: 550,
    stress: 0.1,
    score: 0,
    league: 'chaski',
    current_tick: 0,
    inventory: [],
    flags: [],
    pending_events: [],
    active_missions: ['MSN-001', 'MSN-004', 'MSN-009'],
  }
}
