import type { League, PlayerState } from '@/types/economy'

/** Los 4 números que muestra la VitalBar. */
export interface Vitals {
  wallet: number
  savings: number
  debt: number
  /** 0–1 */
  stress: number
}

export function selectVitals(state: PlayerState): Vitals {
  const { meta, emergencias, libre } = state.savings
  return {
    wallet: state.wallet,
    savings: meta.balance + emergencias.balance + libre.balance,
    debt: state.loans.reduce((total, loan) => total + loan.remaining, 0),
    stress: Math.min(1, Math.max(0, state.stress)),
  }
}

export type StressLevel = 'ok' | 'alto' | 'critico'

/** Umbrales de S1.FE.03: > 60% ámbar, > 80% rojo. */
export function stressLevel(stress: number): StressLevel {
  if (stress > 0.8) return 'critico'
  if (stress > 0.6) return 'alto'
  return 'ok'
}

/**
 * Ligas y sus rangos de score (balance.yaml → leagues). Única fuente para la portada, el Perfil
 * y, más adelante, el Ranking: si el backend cambia un umbral, se cambia solo aquí.
 */
export const LEAGUES: Record<League, { name: string; icon: string; min: number; max: number }> = {
  chaski: { name: 'Chaski', icon: '🏃', min: 0, max: 300 },
  qollqa: { name: 'Qollqa', icon: '🏛️', min: 301, max: 550 },
  amauta: { name: 'Amauta', icon: '📜', min: 551, max: 750 },
  apu: { name: 'Apu', icon: '🏔️', min: 751, max: 1000 },
}

/** Orden de ascenso, de Chaski a Apu. */
export const LEAGUE_ORDER: League[] = ['chaski', 'qollqa', 'amauta', 'apu']
