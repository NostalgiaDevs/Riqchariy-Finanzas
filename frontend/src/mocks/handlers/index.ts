import { authHandlers } from './auth'
import { pachaHandlers } from './pacha'
import { gamesHandlers, shopHandlers } from './shop-games'
import { socialHandlers } from './social'

/** Un handler por endpoint de docs/api/endpoints-piloto.md. */
export const handlers = [
  ...authHandlers,
  ...pachaHandlers,
  ...shopHandlers,
  ...gamesHandlers,
  ...socialHandlers,
]
