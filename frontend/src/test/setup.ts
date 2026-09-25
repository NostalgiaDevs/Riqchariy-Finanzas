import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetMockDb } from '@/mocks/db'
import { useAuthStore } from '@/core/store/authStore'
import { server } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetMockDb()
  useAuthStore.getState().logout()
  localStorage.clear()
})

afterAll(() => server.close())
