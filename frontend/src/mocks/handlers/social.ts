import { http, HttpResponse } from 'msw'
import { API_BASE, HEALTH_URL } from '@/core/api/client'
import type {
  ChatRequest,
  ChatResponse,
  HealthResponse,
  LeaderboardEntry,
  LeaderboardResponse,
  MissionClaimResponse,
  MissionsResponse,
} from '@/types/api'
import { mockDb } from '../db'
import { CLASSMATES, DEMO_CLASSROOM, MISSIONS } from '../fixtures'
import { apiError, latency, withAuth } from './helpers'
import { LEAGUES } from '@/core/utils/vitals'

const claimedFor = (playerId: string) => {
  let claimed = mockDb.claimedMissions.get(playerId)
  if (!claimed) {
    claimed = new Set()
    mockDb.claimedMissions.set(playerId, claimed)
  }
  return claimed
}

export const socialHandlers = [
  http.get(
    `${API_BASE}/leaderboard`,
    withAuth(({ user, state }) => {
      const me: Omit<LeaderboardEntry, 'rank'> = {
        alias: user.alias,
        score: state.score,
        league: state.league,
        league_icon: LEAGUES[state.league].icon,
      }
      const rankings = [...CLASSMATES, me]
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))
      return HttpResponse.json<LeaderboardResponse>({
        classroom: DEMO_CLASSROOM,
        rankings,
        my_rank: rankings.find((entry) => entry.alias === user.alias)?.rank ?? rankings.length,
        total_players: rankings.length,
      })
    }),
  ),

  http.post(
    `${API_BASE}/chatbot/message`,
    withAuth(async ({ request, state }) => {
      const { message } = (await request.json()) as ChatRequest
      if (!message?.trim()) return apiError(422, 'Escribe tu pregunta.')
      return HttpResponse.json<ChatResponse>({
        response: `🦊 (modo demo) Tienes ⵊ${state.wallet} en tu billetera. Cuando Qori esté conectado, te responderé sobre: "${message.trim()}".`,
        concepts_referenced: [],
        sources: [],
      })
    }),
  ),

  http.get(
    `${API_BASE}/missions`,
    withAuth(({ user }) => {
      const claimed = claimedFor(user.player_id)
      const active = MISSIONS.filter((mission) => !claimed.has(mission.id))
      return HttpResponse.json<MissionsResponse>({
        active,
        completed_this_week: [...claimed],
        claimable: active
          .filter((mission) => mission.progress.current >= mission.progress.target)
          .map((mission) => mission.id),
      })
    }),
  ),

  http.post(
    `${API_BASE}/missions/:id/claim`,
    withAuth(({ params, user, state: current }) => {
      const mission = MISSIONS.find((candidate) => candidate.id === params.id)
      if (!mission) return apiError(404, 'Esa misión no existe.')
      const claimed = claimedFor(user.player_id)
      if (claimed.has(mission.id)) return apiError(409, 'Ya reclamaste esta misión.')
      if (mission.progress.current < mission.progress.target) {
        return apiError(400, 'Todavía no completas esta misión.')
      }
      claimed.add(mission.id)
      const state = structuredClone(current)
      state.wallet += mission.reward
      mockDb.states.set(state.player_id, state)
      return HttpResponse.json<MissionClaimResponse>({
        mission_id: mission.id,
        reward: mission.reward,
        new_wallet: state.wallet,
        message: `${mission.icon} ¡Misión cumplida! +ⵊ${mission.reward}`,
      })
    }),
  ),

  http.get(HEALTH_URL, async () => {
    await latency()
    return HttpResponse.json<HealthResponse>({ status: 'ok', version: '0.1.0-piloto (mock)' })
  }),
]
