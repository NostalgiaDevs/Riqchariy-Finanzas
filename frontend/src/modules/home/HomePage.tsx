import { usePlayerState } from '@/core/hooks/usePlayerState'
import { useAuthStore } from '@/core/store/authStore'
import { formatPercent } from '@/core/utils/format'
import { LEAGUES } from '@/core/utils/vitals'
import { IntiAmount } from '@/design-system/money/IntiAmount'
import { RBadge } from '@/design-system/RBadge'
import { RCard } from '@/design-system/RCard'
import { Skeleton } from '@/design-system/Skeleton'

/**
 * Home "Mi Vida" — versión Sprint 1: saludo, día y meta.
 * En Sprint 2 (S2.FE.01) se agregan las cards de acceso, "Avanzar día" y los eventos.
 */
export function HomePage() {
  const alias = useAuthStore((state) => state.user?.alias)
  const { data: state, isPending } = usePlayerState()

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h1 className="text-2xl">Hola, {alias ?? 'crack'} 👋</h1>
        {isPending || !state ? (
          <Skeleton className="mt-2 h-5 w-48" />
        ) : (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-tinta-suave">
            <span>Día {state.current_tick}</span>
            <span aria-hidden>·</span>
            <RBadge tone="morado" icon={<span aria-hidden>{LEAGUES[state.league].icon}</span>}>
              Liga {LEAGUES[state.league].name}
            </RBadge>
          </div>
        )}
      </section>

      {state ? <GoalCard state={state} /> : <Skeleton className="h-28 w-full rounded-card" />}

      <RCard tone="dorado" className="flex items-start gap-3">
        <span aria-hidden className="text-2xl">
          🚧
        </span>
        <p className="text-sm text-tinta">
          <strong className="font-semibold">Muy pronto:</strong> aquí vas a avanzar tus días,
          recibir eventos y decidir qué hacer con tus intis.
        </p>
      </RCard>
    </div>
  )
}

function GoalCard({ state }: { state: NonNullable<ReturnType<typeof usePlayerState>['data']> }) {
  const { balance, goal_item, goal_target } = state.savings.meta
  if (!goal_item || goal_target <= 0) {
    return (
      <RCard>
        <h2 className="text-lg">Tu meta</h2>
        <p className="mt-1 text-sm text-tinta-suave">Todavía no elegiste una meta de ahorro.</p>
      </RCard>
    )
  }

  const progress = Math.min(1, balance / goal_target)
  return (
    <RCard>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg">
          Tu meta: <span className="capitalize">{goal_item}</span>
        </h2>
        <span className="text-sm font-semibold tabular-nums text-ahorro-700">
          {formatPercent(progress)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`Progreso hacia tu meta: ${goal_item}`}
        aria-valuemin={0}
        aria-valuemax={goal_target}
        aria-valuenow={balance}
        className="mt-3 h-3 overflow-hidden rounded-full bg-crema-200"
      >
        <div className="h-full rounded-full bg-ahorro" style={{ width: formatPercent(progress) }} />
      </div>
      <p className="mt-2 text-sm text-tinta-suave">
        <IntiAmount value={balance} tone="ahorro" /> de{' '}
        <IntiAmount value={goal_target} tone="neutral" />
      </p>
    </RCard>
  )
}
