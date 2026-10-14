import { useCallback, useSyncExternalStore } from 'react'

/** Mismos cortes que Tailwind: md = tablet, lg = laptop/PC. */
export const BREAKPOINTS = {
  tablet: '(min-width: 768px)',
  desktop: '(min-width: 1024px)',
} as const

/**
 * true si la media query se cumple. Se lee de forma síncrona en el primer render,
 * así el layout correcto aparece sin parpadeo. Sin matchMedia (jsdom en tests) devuelve false:
 * se usa el layout de celular.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window.matchMedia !== 'function') return () => {}
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => typeof window.matchMedia === 'function' && window.matchMedia(query).matches,
    () => false,
  )
}

/** Laptop y PC: menú lateral en vez de barra inferior. */
export function useIsDesktop() {
  return useMediaQuery(BREAKPOINTS.desktop)
}
