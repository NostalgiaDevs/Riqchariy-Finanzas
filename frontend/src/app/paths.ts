/**
 * Rutas de la app. La landing (/) y el login/registro son públicos;
 * todo lo del juego vive bajo /app y exige sesión.
 */
export const paths = {
  landing: '/',
  login: '/login',
  register: '/register',
  app: '/app',
  bank: '/app/bank',
  shop: '/app/shop',
  games: '/app/games',
  game: (gameId: string) => `/app/games/${gameId}`,
  ranking: '/app/ranking',
  chatbot: '/app/chatbot',
  missions: '/app/missions',
  profile: '/app/profile',
  onboarding: '/app/onboarding',
  components: '/dev/componentes',
} as const
