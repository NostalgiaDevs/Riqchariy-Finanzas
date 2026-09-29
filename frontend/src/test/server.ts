import { setupServer } from 'msw/node'
import { handlers } from '@/mocks/handlers'

/** Servidor MSW para tests: los mismos handlers que usa el navegador en modo mock. */
export const server = setupServer(...handlers)
