import { http, HttpResponse } from 'msw'
import { API_BASE } from '@/core/api/client'
import type {
  DecisionPreviewResponse,
  DecisionRequest,
  DecisionResponse,
  SavingsTransferRequest,
  SavingsTransferResponse,
} from '@/types/api'
import type { JarId, NextDayResponse, PlayerState } from '@/types/economy'
import { mockDb } from '../db'
import { MOCK_EVENT_CHOICES, MOCK_EVENT_ROTATION } from '../fixtures'
import { apiError, clamp01, round2, withAuth } from './helpers'

// Simplificación del pipeline Pacha, solo para que la UI tenga algo creíble que mostrar.
// La lógica real vive en el backend: no copiar estos números al producto.
const DAILY_EXPENSES = 6 // ≈ ⵊ165/28 días
const PAY_PERIOD = 7
const INTEREST_PERIOD = 28
const SAVINGS_RATE = 0.04
const EVENT_EVERY = 3

function save(state: PlayerState) {
  mockDb.states.set(state.player_id, state)
  return state
}

export const pachaHandlers = [
  http.get(
    `${API_BASE}/pacha/state`,
    withAuth(({ state }) => HttpResponse.json<PlayerState>(state)),
  ),

  http.post(
    `${API_BASE}/pacha/next-day`,
    withAuth(({ state: current }) => {
      const state = structuredClone(current)
      const tick = state.current_tick + 1
      state.current_tick = tick

      const income =
        tick % PAY_PERIOD === 0 ? Math.round(state.job.wage_per_week * state.job.performance) : 0
      const expenses = Math.min(DAILY_EXPENSES, state.wallet + income)
      state.wallet = state.wallet + income - expenses

      let interest = 0
      if (tick % INTEREST_PERIOD === 0) {
        for (const jar of ['meta', 'emergencias', 'libre'] as const) {
          const gained = round2(state.savings[jar].balance * SAVINGS_RATE)
          state.savings[jar].balance = round2(state.savings[jar].balance + gained)
          interest += gained
        }
      }

      const events: string[] = []
      if (tick % EVENT_EVERY === 0 && state.pending_events.length === 0) {
        const eventId = MOCK_EVENT_ROTATION[(tick / EVENT_EVERY) % MOCK_EVENT_ROTATION.length]!
        state.pending_events.push(eventId)
        events.push(eventId)
      }

      const stressChange = round2(state.wallet < 20 ? 0.03 : -0.01)
      state.stress = round2(clamp01(state.stress + stressChange))
      const scoreChange = state.wallet > 0 ? 2 : -2
      state.score = Math.max(0, Math.min(1000, state.score + scoreChange))

      save(state)
      return HttpResponse.json<NextDayResponse>({
        tick,
        summary: {
          income,
          expenses,
          interest_earned: round2(interest),
          loan_payments: 0,
          events_triggered: events,
          missions_progress: {},
          score_change: scoreChange,
          stress_change: stressChange,
        },
        new_state: state,
      })
    }),
  ),

  http.post(
    `${API_BASE}/pacha/decisions/preview`,
    withAuth(async ({ request, state }) => {
      const body = (await request.json()) as DecisionRequest
      const effect = MOCK_EVENT_CHOICES[body.event_id]?.[body.choice_id]
      if (!effect) return apiError(404, 'Esa opción no existe.')
      const walletAfter = state.wallet + effect.wallet
      if (walletAfter < 0) return apiError(400, `No tienes ⵊ${-effect.wallet} en tu billetera.`)
      const risk = walletAfter < 20 ? 'high' : walletAfter < 60 ? 'medium' : 'low'
      return HttpResponse.json<DecisionPreviewResponse>({
        preview: {
          wallet_after: walletAfter,
          stress_after: round2(clamp01(state.stress + effect.stress)),
          warning:
            risk === 'low' ? null : `Te quedarías con ⵊ${walletAfter}. Poco colchón si pasa algo.`,
          risk_level: risk,
        },
      })
    }),
  ),

  http.post(
    `${API_BASE}/pacha/decisions`,
    withAuth(async ({ request, state: current }) => {
      const body = (await request.json()) as DecisionRequest
      if (!current.pending_events.includes(body.event_id)) {
        return apiError(404, 'Ese evento ya no está pendiente.')
      }
      const effect = MOCK_EVENT_CHOICES[body.event_id]?.[body.choice_id]
      if (!effect) return apiError(404, 'Esa opción no existe.')
      if (current.wallet + effect.wallet < 0) {
        return apiError(400, `No tienes ⵊ${-effect.wallet} en tu billetera.`)
      }
      const state = structuredClone(current)
      state.wallet += effect.wallet
      state.stress = round2(clamp01(state.stress + effect.stress))
      state.score = Math.max(0, Math.min(1000, state.score + effect.score))
      state.pending_events = state.pending_events.filter((id) => id !== body.event_id)
      save(state)
      return HttpResponse.json<DecisionResponse>({
        outcome: effect.outcome,
        effects: {
          wallet_change: effect.wallet,
          stress_change: effect.stress,
          score_change: effect.score,
          flags_added: [],
          teaches: effect.teaches,
        },
        new_state: state,
      })
    }),
  ),

  http.post(
    `${API_BASE}/pacha/savings/transfer`,
    withAuth(async ({ request, state: current }) => {
      const body = (await request.json()) as SavingsTransferRequest
      if (!(body.amount > 0)) return apiError(400, 'El monto debe ser mayor a 0.')
      if (body.from === body.to) return apiError(400, 'Elige dos lugares distintos.')

      const state = structuredClone(current)
      const balanceOf = (place: 'wallet' | JarId) =>
        place === 'wallet' ? state.wallet : state.savings[place].balance
      const setBalance = (place: 'wallet' | JarId, value: number) => {
        if (place === 'wallet') state.wallet = value
        else state.savings[place].balance = value
      }

      if (balanceOf(body.from) < body.amount) {
        return apiError(409, 'No tienes tantos intis ahí.')
      }
      setBalance(body.from, balanceOf(body.from) - body.amount)
      setBalance(body.to, balanceOf(body.to) + body.amount)
      save(state)

      const jar = body.to === 'wallet' ? body.from : body.to
      return HttpResponse.json<SavingsTransferResponse>({
        success: true,
        wallet: state.wallet,
        jar_balance: jar === 'wallet' ? state.wallet : state.savings[jar].balance,
        friction_warning: body.from === 'emergencias' ? '¿Seguro? Este frasco te protege.' : null,
      })
    }),
  ),
]
