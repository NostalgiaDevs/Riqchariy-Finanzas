import { LogOut } from 'lucide-react'
import { usePlayerState } from '@/core/hooks/usePlayerState'
import { useAuthStore } from '@/core/store/authStore'
import { LEAGUES } from '@/core/utils/vitals'
import { RButton } from '@/design-system/RButton'
import { RCard } from '@/design-system/RCard'
import { Skeleton } from '@/design-system/Skeleton'

/** Perfil — versión Sprint 1: datos básicos y cerrar sesión. La versión completa es S4.FE.03. */
export function ProfilePage() {
  const alias = useAuthStore((state) => state.user?.alias)
  const logout = useAuthStore((state) => state.logout)
  const { data: state } = usePlayerState()

  const stats = state
    ? [
        { label: 'Score financiero', value: `${state.score} / 1000` },
        { label: 'Credit score', value: `${state.credit_score}` },
        { label: 'Liga', value: `${LEAGUES[state.league].icon} ${LEAGUES[state.league].name}` },
        { label: 'Días jugados', value: `${state.current_tick}` },
      ]
    : null

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl">{alias ?? 'Mi perfil'}</h1>

      <RCard padding="none">
        <dl className="divide-y divide-crema-200">
          {stats
            ? stats.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3">
                  <dt className="text-tinta-suave">{label}</dt>
                  <dd className="font-semibold tabular-nums">{value}</dd>
                </div>
              ))
            : Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex justify-between px-4 py-3.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
        </dl>
      </RCard>

      <RButton
        variant="secondary"
        fullWidth
        icon={<LogOut aria-hidden className="size-5" />}
        onClick={logout}
      >
        Cerrar sesión
      </RButton>
    </div>
  )
}
