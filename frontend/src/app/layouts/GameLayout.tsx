import { Link, Outlet, useLocation } from 'react-router'
import { motion } from 'framer-motion'
import { UserRound } from 'lucide-react'
import { usePlayerState } from '@/core/hooks/usePlayerState'
import { useAuthStore } from '@/core/store/authStore'
import { selectVitals } from '@/core/utils/vitals'
import { Logo } from '@/design-system/Logo'
import { WalletBar } from '@/design-system/money/WalletBar'
import { RButton } from '@/design-system/RButton'
import { BottomNav } from './BottomNav'

/** Layout del juego: VitalBar arriba, pantalla al centro, navegación abajo. */
export function GameLayout() {
  const alias = useAuthStore((state) => state.user?.alias)
  const location = useLocation()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="sticky top-0 z-30 bg-crema/95 px-gutter pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            aria-label="Riqchariy, ir al inicio"
            className="flex min-h-touch items-center"
          >
            <Logo />
          </Link>
          <Link
            to="/profile"
            className="flex min-h-touch items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-tinta-suave hover:bg-crema-200"
          >
            <UserRound aria-hidden className="size-4" />
            <span className="max-w-32 truncate">{alias ?? 'Mi perfil'}</span>
          </Link>
        </div>
        <VitalBar />
      </header>

      <main className="flex-1 px-gutter pb-[calc(var(--spacing-nav)+env(safe-area-inset-bottom)+1.5rem)] pt-3">
        {/* Solo animación de entrada: sin salida no hay cuadro vacío (ni parpadeo) entre pantallas. */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}

function VitalBar() {
  const { data, isError, refetch, isRefetching } = usePlayerState()

  if (isError && !data) {
    return (
      <div
        role="alert"
        className="flex items-center justify-between gap-3 rounded-card bg-deuda-50 p-3 text-sm text-deuda-700"
      >
        <span>🦊 No pudimos cargar tu estado.</span>
        <RButton variant="secondary" loading={isRefetching} onClick={() => refetch()}>
          Reintentar
        </RButton>
      </div>
    )
  }

  return <WalletBar vitals={data ? selectVitals(data) : null} />
}
