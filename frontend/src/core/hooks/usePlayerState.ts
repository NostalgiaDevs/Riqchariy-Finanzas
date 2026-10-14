import { useQuery } from '@tanstack/react-query'
import { pachaApi } from '@/core/api/endpoints'
import { queryKeys } from '@/core/api/queryKeys'

/** Estado económico del alumno (GET /pacha/state). Fuente única para la VitalBar y las pantallas. */
export function usePlayerState() {
  return useQuery({
    queryKey: queryKeys.playerState,
    queryFn: ({ signal }) => pachaApi.getState(signal),
  })
}
