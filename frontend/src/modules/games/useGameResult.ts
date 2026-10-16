import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gamesApi } from '@/core/api/endpoints'
import { queryKeys } from '@/core/api/queryKeys'
import type { GameResultRequest } from '@/types/game'

export function useGameResult() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (result: GameResultRequest) => gamesApi.submitResult(result),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.playerState }),
  })
}
