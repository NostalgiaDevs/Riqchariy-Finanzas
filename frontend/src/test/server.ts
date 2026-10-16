import { setupServer } from 'msw/node'
import { handlers } from '@/test/mocks/handlers'

/** HTTP doubles exclusively for automated tests, never imported by the app. */
export const server = setupServer(...handlers)
