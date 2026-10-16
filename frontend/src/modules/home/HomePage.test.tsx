import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { delay, http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { AppProviders } from '@/app/providers'
import { createQueryClient } from '@/app/queryClient'
import { API_BASE } from '@/core/api/client'
import { queryKeys } from '@/core/api/queryKeys'
import { useAuthStore } from '@/core/store/authStore'
import { examplePlayerState } from '@/test/mocks/fixtures'
import { server } from '@/test/server'
import { HomePage } from './HomePage'

function setup() {
  sessionStorage.clear()
  server.use(
    http.get(`${API_BASE}/pacha/state`, () =>
      HttpResponse.json({ ...examplePlayerState('mock-player-1'), pending_events: [] }),
    ),
  )
  useAuthStore.getState().setSession({
    token: 'mock-token.mock-player-1',
    user: { player_id: 'mock-player-1', alias: 'alumno1' },
    expiresIn: 86400,
  })
  const queryClient = createQueryClient()
  render(
    <MemoryRouter>
      <AppProviders queryClient={queryClient}>
        <HomePage />
      </AppProviders>
    </MemoryRouter>,
  )
  return queryClient
}

it('advances with expected_tick, disables duplicate clicks and uses the server state', async () => {
  const updated = {
    ...examplePlayerState('mock-player-1'),
    pending_events: [],
    current_tick: 15,
    wallet: 123.45,
  }
  let requestBody: unknown
  server.use(
    http.post(`${API_BASE}/pacha/next-day`, async ({ request }) => {
      requestBody = await request.json()
      await delay(100)
      return HttpResponse.json({
        tick: 15,
        new_state: updated,
        summary: {
          income: 0,
          expenses: 11.55,
          interest_earned: 0,
          loan_payments: 0,
          events_triggered: [],
          missions_progress: {},
          score_change: 0,
          stress_change: 0,
        },
      })
    }),
  )
  const client = setup()
  const user = userEvent.setup()
  const button = await screen.findByRole('button', { name: 'Avanzar día' })
  await user.click(button)
  expect(button).toBeDisabled()
  expect(await screen.findByRole('status')).toHaveTextContent('Día 15')
  expect(requestBody).toEqual({ expected_tick: 14 })
  expect(client.getQueryData(queryKeys.playerState)).toEqual(updated)
  expect(button).toBeEnabled()
})

it('shows a failed advance and refreshes the server state without advancing locally', async () => {
  server.use(
    http.post(`${API_BASE}/pacha/next-day`, () =>
      HttpResponse.json({ detail: 'El día ya cambió.' }, { status: 409 }),
    ),
  )
  const client = setup()
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: 'Avanzar día' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('El día ya cambió.')
  await waitFor(() =>
    expect(client.getQueryData(queryKeys.playerState)).toMatchObject({ current_tick: 14 }),
  )
})
