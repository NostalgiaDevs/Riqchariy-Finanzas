import { useEffect, useState, type ReactNode } from 'react'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { useAuthStore } from '@/core/store/authStore'
import { IntiFlyProvider } from '@/design-system/money/IntiFly'
import { createQueryClient } from './queryClient'

export function AppProviders({
  children,
  queryClient: providedClient,
}: {
  children: ReactNode
  queryClient?: QueryClient
}) {
  const [queryClient] = useState(() => providedClient ?? createQueryClient())

  // Al cerrar sesión se borra la caché: el siguiente alumno no ve datos del anterior.
  useEffect(
    () =>
      useAuthStore.subscribe((state, previous) => {
        if (previous.token && !state.token) queryClient.clear()
      }),
    [queryClient],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <IntiFlyProvider>{children}</IntiFlyProvider>
      </MotionConfig>
    </QueryClientProvider>
  )
}
