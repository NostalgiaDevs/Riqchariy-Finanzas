import { http, HttpResponse } from 'msw'
import { API_BASE } from '@/core/api/client'
import { authHandlers } from './auth'
import { withAuth } from './helpers'

// Test-only transport fixtures. Economic transitions are tested in the Python domain.
export const handlers = [
  ...authHandlers,
  http.get(
    `${API_BASE}/pacha/state`,
    withAuth(({ state }) => HttpResponse.json(state)),
  ),
]
