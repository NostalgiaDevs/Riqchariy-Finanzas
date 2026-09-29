/** Claves de TanStack Query. Tras cualquier mutación económica se invalida playerState. */
export const queryKeys = {
  playerState: ['playerState'] as const,
  shopItems: ['shopItems'] as const,
  leaderboard: ['leaderboard'] as const,
  missions: ['missions'] as const,
}
