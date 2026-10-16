import { http, HttpResponse } from 'msw'
import { API_BASE } from '@/core/api/client'
import type { ShopBuyRequest, ShopBuyResponse, ShopItemsResponse } from '@/types/api'
import type { GameResultRequest, GameResultResponse } from '@/types/game'
import { mockDb } from '../db'
import { SHOP_ITEMS } from '../fixtures'
import { apiError, clamp01, round2, withAuth } from './helpers'

const GAME_COOLDOWN_MS = 60_000 // S2.BE.04: máx. 1 resultado por juego cada 60 s

export const shopHandlers = [
  http.get(
    `${API_BASE}/shop/items`,
    withAuth(({ state }) =>
      HttpResponse.json<ShopItemsResponse>({
        rotation_week: Math.floor(state.current_tick / 7) + 1,
        items: SHOP_ITEMS.map((item) => ({ ...item, can_afford: state.wallet >= item.price })),
      }),
    ),
  ),

  http.post(
    `${API_BASE}/shop/buy`,
    withAuth(async ({ request, state: current }) => {
      const body = (await request.json()) as ShopBuyRequest
      const item = SHOP_ITEMS.find((candidate) => candidate.id === body.item_id)
      if (!item) return apiError(404, 'Ese producto no está en la tienda esta semana.')

      const state = structuredClone(current)
      let cost = item.price
      if (body.payment_method === 'cuotas') {
        if (!item.installment_detail) return apiError(400, 'Este producto no se vende en cuotas.')
        cost = item.installment_detail.per_month
        state.loans.push({
          id: `loan-${crypto.randomUUID()}`,
          product: 'tienda',
          principal: item.price,
          remaining: item.installment_detail.total - item.installment_detail.per_month,
          monthly_rate: 0.08,
          installment: item.installment_detail.per_month,
          next_due_tick: state.current_tick + 28,
        })
      }
      if (state.wallet < cost) return apiError(400, `No tienes ⵊ${cost} en tu billetera.`)

      state.wallet -= cost
      state.inventory.push(item.id)
      state.stress = round2(clamp01(state.stress - 0.05))
      mockDb.states.set(state.player_id, state)
      return HttpResponse.json<ShopBuyResponse>({
        success: true,
        item: item.id,
        cost,
        payment_method: body.payment_method,
        new_wallet: state.wallet,
        stress_change: -0.05,
      })
    }),
  ),
]

export const gamesHandlers = [
  http.post(
    `${API_BASE}/games/results`,
    withAuth(async ({ request, user, state: current }) => {
      const body = (await request.json()) as GameResultRequest
      if (!body?.game_id || !body.data) return apiError(422, 'Falta el resultado del juego.')
      if (
        body.game_id === 'invierte_o_pierde' &&
        (!Number.isFinite(body.data.final_value) ||
          body.data.final_value < 0 ||
          body.data.diversification_score < 0 ||
          body.data.diversification_score > 100)
      )
        return apiError(422, 'Resultado de inversión inválido.')
      if (
        body.game_id === 'mercado_rapido' &&
        (!Number.isFinite(body.data.profit) ||
          body.data.accuracy_pct < 0 ||
          body.data.accuracy_pct > 100 ||
          body.data.investigated_before_buying_pct < 0 ||
          body.data.investigated_before_buying_pct > 100)
      )
        return apiError(422, 'Resultado de mercado inválido.')
      if (
        body.game_id === 'qori_quiz' &&
        (body.data.correct_count < 0 ||
          body.data.correct_count > 10 ||
          body.data.score !== body.data.correct_count * 10)
      )
        return apiError(422, 'Resultado del quiz inválido.')
      const key = `${user.player_id}:${body.game_id}`
      const last = mockDb.lastGameAt.get(key) ?? 0
      if (import.meta.env.MODE !== 'test' && Date.now() - last < GAME_COOLDOWN_MS) {
        return apiError(429, 'Espera un minuto antes de enviar otra partida de este juego.')
      }
      mockDb.lastGameAt.set(key, Date.now())

      // Recompensa genérica: el backend real traduce cada juego a efectos distintos.
      const rawScore =
        'score' in body.data
          ? body.data.score
          : body.game_id === 'invierte_o_pierde'
            ? Math.min(1000, Math.max(0, Math.round(body.data.final_value * 5)))
            : body.data.profit > 0
              ? Math.min(1000, Math.max(0, Math.round(body.data.accuracy_pct * 10)))
              : 0
      const performance = round2(Math.min(1, Math.max(0, rawScore / 1000)))
      const reward = rawScore > 0 ? Math.round(10 + performance * 25) : 0

      const state = structuredClone(current)
      state.wallet += reward
      if (body.game_id === 'kiosco' && body.data.items_sold > 0) state.job.performance = performance
      mockDb.states.set(state.player_id, state)

      return HttpResponse.json<GameResultResponse>({
        reward,
        performance_update: state.job.performance,
        missions_progress: {},
        message:
          rawScore <= 0
            ? body.game_id === 'kiosco'
              ? 'No hubo ventas. Compra mercadería antes de abrir y vuelve a intentarlo.'
              : body.game_id === 'mercado_rapido'
                ? 'El margen no fue positivo. Investiga precios y compra solo cuando encuentres una buena oferta.'
                : 'Aún no acertaste. Revisa las pistas y vuelve a intentarlo.'
            : `¡Buena partida! Ganaste ⵊ${reward}.`,
      })
    }),
  ),
]
