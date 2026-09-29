import { useEffect, useState, type ReactNode } from 'react'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { LazyMotion, MotionConfig } from 'framer-motion'
import { useAuthStore } from '@/core/store/authStore'
import { IntiFlyProvider } from '@/design-system/money/IntiFly'
import { createQueryClient } from './queryClient'

/**
 * Las animaciones de framer-motion se cargan aparte (import dinámico): la primera pantalla
 * no espera ~15 kB gzip que solo se usan cuando vuelan monedas. `strict` obliga a usar `m.*`
 * en vez de `motion.*`, que volvería a meter todo el motor en el bundle principal.
 */
const loadMotionFeatures = () => import('@/core/motion/features').then((module) => module.default)

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
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion="user">
          <IntiFlyProvider>{children}</IntiFlyProvider>
        </MotionConfig>
      </LazyMotion>
    </QueryClientProvider>
  )
}
