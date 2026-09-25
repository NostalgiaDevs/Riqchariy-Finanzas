// Una función por endpoint de docs/api/endpoints-piloto.md.
// Los componentes no llaman a fetch directamente: usan estas funciones (vía hooks de TanStack Query).

import { apiRequest, HEALTH_URL } from './client'
import type {
  ChatRequest,
  ChatResponse,
  DecisionPreviewResponse,
  DecisionRequest,
  DecisionResponse,
  HealthResponse,
  LeaderboardResponse,
  MissionClaimResponse,
  MissionsResponse,
  SavingsTransferRequest,
  SavingsTransferResponse,
  ShopBuyRequest,
  ShopBuyResponse,
  ShopItemsResponse,
} from '@/types/api'
import type { NextDayResponse, PlayerState } from '@/types/economy'
import type { GameResultRequest, GameResultResponse } from '@/types/game'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/types/user'

export const authApi = {
  login: (body: LoginRequest) =>
    apiRequest<LoginResponse>('/auth/login', { method: 'POST', body, auth: false }),
  register: (body: RegisterRequest) =>
    apiRequest<RegisterResponse>('/auth/register', { method: 'POST', body, auth: false }),
}

export const pachaApi = {
  getState: (signal?: AbortSignal) => apiRequest<PlayerState>('/pacha/state', { signal }),
  nextDay: () => apiRequest<NextDayResponse>('/pacha/next-day', { method: 'POST' }),
  decide: (body: DecisionRequest) =>
    apiRequest<DecisionResponse>('/pacha/decisions', { method: 'POST', body }),
  preview: (body: DecisionRequest) =>
    apiRequest<DecisionPreviewResponse>('/pacha/decisions/preview', { method: 'POST', body }),
  transferSavings: (body: SavingsTransferRequest) =>
    apiRequest<SavingsTransferResponse>('/pacha/savings/transfer', { method: 'POST', body }),
}

export const shopApi = {
  getItems: () => apiRequest<ShopItemsResponse>('/shop/items'),
  buy: (body: ShopBuyRequest) => apiRequest<ShopBuyResponse>('/shop/buy', { method: 'POST', body }),
}

export const gamesApi = {
  submitResult: (body: GameResultRequest) =>
    apiRequest<GameResultResponse>('/games/results', { method: 'POST', body }),
}

export const leaderboardApi = {
  get: (params: { limit?: number; sort?: 'score' } = {}) => {
    const query = new URLSearchParams({
      limit: String(params.limit ?? 20),
      sort: params.sort ?? 'score',
    })
    return apiRequest<LeaderboardResponse>(`/leaderboard?${query}`)
  },
}

export const chatbotApi = {
  send: (body: ChatRequest) =>
    apiRequest<ChatResponse>('/chatbot/message', { method: 'POST', body }),
}

export const missionsApi = {
  list: () => apiRequest<MissionsResponse>('/missions'),
  claim: (missionId: string) =>
    apiRequest<MissionClaimResponse>(`/missions/${encodeURIComponent(missionId)}/claim`, {
      method: 'POST',
    }),
}

/** /health está fuera de /api/v1 y no requiere token. */
export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(HEALTH_URL)
  return response.json() as Promise<HealthResponse>
}
