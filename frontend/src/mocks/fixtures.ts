// Datos de ejemplo copiados de docs/api/endpoints-piloto.md (rama develop).
// Si el contrato cambia, se actualiza aquí y en src/types/.

import type { LeaderboardEntry, Mission, ShopItem } from '@/types/api'
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

/** PROVISIONAL: efectos de los eventos del mock. El contrato aún no define la carta del evento. */
export const MOCK_EVENT_CHOICES: Record<
  string,
  Record<
    string,
    { wallet: number; stress: number; score: number; outcome: string; teaches: string[] }
  >
> = {
  'EMR-001': {
    farmacia: {
      wallet: -40,
      stress: -0.03,
      score: 5,
      outcome: 'Te recuperas rápido. Dinero bien gastado en tu salud.',
      teaches: ['fondo_de_emergencia', 'prevencion'],
    },
    aguantar: {
      wallet: 0,
      stress: 0.15,
      score: -3,
      outcome: 'Aguantaste, pero pasaste dos días muy incómodo.',
      teaches: ['fondo_de_emergencia'],
    },
  },
  'TMP-001': {
    contado: {
      wallet: -126,
      stress: -0.05,
      score: -2,
      outcome: 'Estrenas zapatillas… y tu billetera quedó casi vacía.',
      teaches: ['urgencia_artificial'],
    },
    pasar: {
      wallet: 0,
      stress: 0.02,
      score: 4,
      outcome: 'Dejaste pasar la oferta "solo hoy". Tu meta sigue en pie.',
      teaches: ['urgencia_artificial'],
    },
  },
  'OPP-001': {
    aceptar: {
      wallet: 25,
      stress: 0.05,
      score: 3,
      outcome: 'Hiciste horas extra en el kiosco: +ⵊ25.',
      teaches: ['capital_humano'],
    },
    descansar: {
      wallet: 0,
      stress: -0.05,
      score: 1,
      outcome: 'Descansar también es una decisión válida.',
      teaches: ['equilibrio'],
    },
  },
}

export const MOCK_EVENT_ROTATION = ['EMR-001', 'TMP-001', 'OPP-001']

export const SHOP_ITEMS: Omit<ShopItem, 'can_afford'>[] = [
  {
    id: 'zapatillas',
    name: 'Zapatillas nuevas',
    price: 180,
    icon: '👟',
    description: 'Las que todos quieren.',
    installment_available: true,
    installment_detail: { per_month: 65, months: 3, total: 195 },
  },
  {
    id: 'audifonos',
    name: 'Audífonos',
    price: 90,
    icon: '🎧',
    description: 'Para escuchar tu música en el micro.',
    installment_available: true,
    installment_detail: { per_month: 33, months: 3, total: 98 },
  },
  {
    id: 'salida_amigos',
    name: 'Salida con amigos',
    price: 25,
    icon: '🍕',
    description: 'Un rato bueno con tu gente.',
    installment_available: false,
    installment_detail: null,
  },
  {
    id: 'libro',
    name: 'Libro',
    price: 20,
    icon: '📚',
    description: 'Invertir en ti también cuenta.',
    installment_available: false,
    installment_detail: null,
  },
]

export const MISSIONS: Mission[] = [
  {
    id: 'MSN-001',
    name: 'Hormiguita',
    description: 'Ahorra al menos ⵊ20 esta semana.',
    icon: '🐜',
    progress: { current: 15, target: 20 },
    reward: 15,
    expires_tick: 21,
  },
  {
    id: 'MSN-004',
    name: 'Jugador curioso',
    description: 'Juega 2 minijuegos.',
    icon: '🎮',
    progress: { current: 2, target: 2 },
    reward: 10,
    expires_tick: 21,
  },
  {
    id: 'MSN-009',
    name: 'Cabeza fría',
    description: 'Mantén tu estrés bajo 50%.',
    icon: '🧊',
    progress: { current: 5, target: 7 },
    reward: 12,
    expires_tick: 21,
  },
]

/** Compañeros de aula ficticios para el ranking. */
export const CLASSMATES: Omit<LeaderboardEntry, 'rank'>[] = [
  { alias: 'andres_15', score: 780, league: 'amauta', league_icon: '📜' },
  { alias: 'kusi_13', score: 705, league: 'amauta', league_icon: '📜' },
  { alias: 'mayta_14', score: 590, league: 'amauta', league_icon: '📜' },
  { alias: 'sofia_12', score: 512, league: 'qollqa', league_icon: '🏛️' },
  { alias: 'thiago_16', score: 430, league: 'qollqa', league_icon: '🏛️' },
  { alias: 'luz_15', score: 310, league: 'qollqa', league_icon: '🏛️' },
  { alias: 'diego_13', score: 240, league: 'chaski', league_icon: '🏃' },
]
