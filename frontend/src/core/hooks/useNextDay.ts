import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pachaApi } from '@/core/api/endpoints'
import { queryKeys } from '@/core/api/queryKeys'

export function useNextDay() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: pachaApi.nextDay,
    retry: false,
    onSuccess: (response) => {
      client.setQueryData(queryKeys.playerState, response.new_state)
    },
    onError: () => {
      // Also recover after a response is lost or another tab advances the day.
      void client.invalidateQueries({ queryKey: queryKeys.playerState })
    },
  })
}
