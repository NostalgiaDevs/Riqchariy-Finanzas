import type { ComponentType, SVGProps } from 'react'
import { Link } from 'react-router'
import { CircleCheck, ChevronRight, ShoppingBag, Store, Target, TriangleAlert } from 'lucide-react'
import { paths } from '@/app/paths'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { useIsDesktop } from '@/core/hooks/useMediaQuery'
import { usePlayerState } from '@/core/hooks/usePlayerState'
import { useAuthStore } from '@/core/store/authStore'
import { cn } from '@/core/utils/cn'
import { formatPercent } from '@/core/utils/format'
import { LEAGUES } from '@/core/utils/vitals'
import { IntiAmount } from '@/design-system/money/IntiAmount'
import { RBadge } from '@/design-system/RBadge'
import { RCard } from '@/design-system/RCard'
import { Skeleton } from '@/design-system/Skeleton'
import { buttonClasses } from '@/design-system/buttonStyles'
import { ScoreCard } from '@/modules/shared/ScoreCard'
import type { JarId, LoanProduct, PlayerState } from '@/types/economy'

/** Metas del onboarding (PLAN-FRONTEND S4.FE.01). Cualquier otra usa el ícono genérico. */
const GOAL_ICONS: Record<string, string> = {
  laptop: '💻',
  celular: '📱',
  bici: '🚲',
  bicicleta: '🚲',
  curso: '📚',
  zapatillas: '👟',
}

/** Los 3 frascos del contrato. Juntos son el "Ahorros" de la VitalBar. */
const JARS: { id: JarId; label: string; dot: string }[] = [
  { id: 'meta', label: 'Meta', dot: 'bg-ahorro' },
  { id: 'emergencias', label: 'Emergencias', dot: 'bg-turquesa' },
  { id: 'libre', label: 'Libre', dot: 'bg-dorado' },
]

const LOAN_LABELS: Record<LoanProduct, string> = {
  banco: 'Préstamo del banco',
  tienda: 'Cuotas de la tienda',
  prestamista: 'Prestamista',
}

/** Enlace de texto al pie de una tarjeta, con área táctil de 44px. */
const cardLinkClass =
  'inline-flex min-h-touch items-center gap-1 self-start font-semibold text-fucsia-700 hover:underline'

/**
 * Home "Mi Vida" — versión Sprint 1: saludo, el próximo día, tu plata (meta, frascos, deudas),
 * tu score y accesos. Todo es lectura de GET /pacha/state: no se calcula economía aquí.
 * En Sprint 2 (S2.FE.01) la tarjeta del próximo día recibe "Avanzar día" y los eventos.
 */
export function HomePage() {
  const alias = useAuthStore((state) => state.user?.alias)
  const { data: state, isPending } = usePlayerState()
  const isDesktop = useIsDesktop()
  useDocumentTitle('Inicio')

  // Celular: una columna. Tablet en adelante: el próximo día y la meta lado a lado.
  return (
    <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-6">
      <section className="md:col-span-2">
        <h1 className="text-[1.75rem] lg:text-4xl">Hola, {alias ?? 'crack'}</h1>
        {isPending || !state ? (
          <Skeleton className="mt-2 h-6 w-52" />
        ) : (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-tinta-suave">
            <span>Día {state.current_tick} en Pacha</span>
            <RBadge tone="morado" icon={<span aria-hidden>{LEAGUES[state.league].icon}</span>}>
              Liga {LEAGUES[state.league].name}
            </RBadge>
          </div>
        )}
      </section>

      {state ? <NextDayCard state={state} /> : <Skeleton className="h-52 w-full rounded-sheet" />}
      {state ? <GoalCard state={state} /> : <Skeleton className="h-52 w-full rounded-card" />}
      {state ? <DebtCard state={state} /> : <Skeleton className="h-52 w-full rounded-card" />}
      {state ? (
        <ScoreCard score={state.score}>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 border-t border-crema-200 pt-3 text-sm">
            <p className="text-tinta-suave">
              Credit score{' '}
              <strong className="font-semibold tabular-nums text-tinta">
                {state.credit_score}
              </strong>{' '}
              de 850
            </p>
            <Link to={paths.profile} className={cardLinkClass}>
              Ver mi perfil <ChevronRight aria-hidden className="size-4" />
            </Link>
          </div>
        </ScoreCard>
      ) : (
        <Skeleton className="h-52 w-full rounded-card" />
      )}
      {/* En laptop/PC, Tienda y Misiones ya están en el menú lateral. */}
      {isDesktop ? null : <MoreLinks missions={state?.active_missions.length} />}
    </div>
  )
}

/**
 * El lugar de "Avanzar día". Es la única tarjeta nocturna del Home: lo que pasa mañana
 * es lo más importante de la pantalla, y usa el mismo cielo que la cabecera.
 */
function NextDayCard({ state }: { state: PlayerState }) {
  const { job } = state
  return (
    <section
      aria-labelledby="next-day-title"
      className="relative flex flex-col overflow-hidden rounded-sheet bg-noche-alta text-white shadow-raised"
    >
      <DawnGlow className="absolute -right-16 -top-20 size-56" />

      <div className="relative flex-1 p-5 lg:p-6">
        <h2 id="next-day-title" className="text-xl">
          Mañana es el día {state.current_tick + 1}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          Muy pronto vas a avanzar tus días desde aquí: cobrar tu sueldo, pagar tus gastos y decidir
          qué hacer cuando algo pase.
        </p>
      </div>

      <div className="relative flex items-center gap-3 border-t border-white/10 bg-white/[0.04] px-5 py-3.5 lg:px-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-dorado/15 text-dorado">
          <Store aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-snug">{job.name}</p>
          <p className="whitespace-nowrap text-sm text-white/70">
            Desempeño {formatPercent(job.performance)}
          </p>
        </div>
        <p className="shrink-0 text-right text-sm leading-tight text-white/70">
          <IntiAmount
            value={job.wage_per_week}
            tone="neutral"
            animated={false}
            className="block font-display text-lg text-inti-claro"
          />
          por semana
        </p>
      </div>
    </section>
  )
}

/**
 * Luz de alba en la esquina: el sol ya está en la cabecera, aquí solo se nota que viene.
 * (Dos soles en la misma pantalla competían entre sí.)
 */
function DawnGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none rounded-full bg-[radial-gradient(circle,rgb(246_180_74/0.4)_0%,rgb(214_46_108/0.18)_45%,transparent_70%)]',
        className,
      )}
    />
  )
}

function GoalCard({ state }: { state: PlayerState }) {
  const { balance, goal_item, goal_target } = state.savings.meta

  if (!goal_item || goal_target <= 0) {
    return (
      <RCard padding="lg" className="flex flex-col items-start gap-3">
        <div>
          <h2 className="text-lg">¿Para qué vas a ahorrar?</h2>
          <p className="mt-1 text-sm text-tinta-suave">
            Elige una meta y cada inti que guardes en tu frasco te acercará a ella.
          </p>
        </div>
        <Link to={paths.onboarding} className={buttonClasses({ variant: 'secondary' })}>
          Elegir mi meta
        </Link>
      </RCard>
    )
  }

  const progress = Math.min(1, balance / goal_target)
  const missing = Math.max(0, goal_target - balance)
  return (
    <RCard padding="lg" className="flex flex-col">
      <div className="mb-4 flex items-center gap-3">
        <span
          aria-hidden
          className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ahorro-50 text-2xl"
        >
          {GOAL_ICONS[goal_item.toLowerCase()] ?? '🎯'}
        </span>
        {/* Un solo título "Tu meta: laptop": antes el lector de pantalla anunciaba solo "laptop". */}
        <h2 className="min-w-0 flex-1 text-xl">
          <span className="block font-sans text-sm font-normal text-tinta-suave">
            Tu meta<span className="sr-only">:</span>
          </span>{' '}
          <span className="capitalize">{goal_item}</span>
        </h2>
        <span className="font-display text-2xl font-semibold tabular-nums text-ahorro-700">
          {formatPercent(progress)}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={`Progreso hacia tu meta: ${goal_item}`}
        aria-valuemin={0}
        aria-valuemax={goal_target}
        aria-valuenow={Math.min(balance, goal_target)}
        className="h-3 overflow-hidden rounded-full bg-crema-200"
      >
        <div
          className="h-full rounded-full bg-ahorro transition-[width] duration-500"
          style={{ width: formatPercent(progress) }}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm text-tinta-suave">
        <span>
          <IntiAmount value={balance} tone="ahorro" /> de{' '}
          <IntiAmount value={goal_target} tone="neutral" />
        </span>
        {missing > 0 ? (
          <span>
            Te faltan <IntiAmount value={missing} tone="neutral" />
          </span>
        ) : (
          <span className="font-semibold text-ahorro-700">¡Lo lograste!</span>
        )}
      </div>

      {/* Explica el "Ahorros" de la VitalBar: la meta es solo uno de los 3 frascos. */}
      <div className="mt-auto pt-5">
        <div className="@container border-t border-crema-200 pt-4">
          <h3 className="font-sans text-sm font-semibold">Tus ahorros, en 3 frascos</h3>
          {/* Según el ancho de la tarjeta (no de la pantalla): filas si es angosta, 3 columnas desde 352px.
              En 3 columnas angostas "Emergencias" no cabía. */}
          <dl className="mt-3 grid gap-2 @min-[22rem]:grid-cols-3">
            {JARS.map(({ id, label, dot }) => (
              <div
                key={id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-control bg-crema/70 px-3 py-2 @min-[22rem]:block"
              >
                <dt className="flex items-center gap-1.5 text-sm text-tinta-suave @min-[22rem]:text-xs">
                  <span aria-hidden className={cn('size-2 shrink-0 rounded-full', dot)} />
                  {label}
                </dt>
                <dd className="font-display text-lg leading-tight">
                  <IntiAmount value={state.savings[id].balance} tone="neutral" />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </RCard>
  )
}

/** Deudas activas: cuánto falta, la tasa y la próxima cuota. Siempre con ícono y texto, no solo rojo. */
function DebtCard({ state }: { state: PlayerState }) {
  const { loans } = state
  const total = loans.reduce((sum, loan) => sum + loan.remaining, 0)

  return (
    <RCard padding="lg" className="flex flex-col">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-lg">Tus deudas</h2>
        {loans.length > 0 ? (
          <p className="flex items-center gap-1 text-sm font-semibold text-deuda-700">
            <TriangleAlert aria-hidden className="size-4" />
            Debes <IntiAmount value={total} tone="deuda" />
          </p>
        ) : null}
      </div>

      {loans.length === 0 ? (
        <p className="mt-3 flex items-start gap-2 text-sm text-tinta-suave">
          <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-ahorro-700" />
          No tienes deudas. Si pides un préstamo o compras en cuotas, aquí verás cuánto te falta
          pagar y cuándo vence cada cuota.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-5">
          {loans.map((loan) => {
            const paid = loan.principal > 0 ? 1 - loan.remaining / loan.principal : 0
            return (
              <li key={loan.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-semibold">{LOAN_LABELS[loan.product] ?? 'Préstamo'}</p>
                  <p className="text-sm text-tinta-suave">
                    {formatPercent(loan.monthly_rate)} de interés al mes
                  </p>
                </div>
                <div
                  role="progressbar"
                  aria-label={`Lo que ya pagaste de: ${LOAN_LABELS[loan.product] ?? 'préstamo'}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(paid * 100)}
                  className="mt-2 h-2.5 overflow-hidden rounded-full bg-deuda-50"
                >
                  <div
                    className="h-full rounded-full bg-ahorro"
                    style={{ width: formatPercent(paid) }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm text-tinta-suave">
                  <span>
                    Te falta <IntiAmount value={loan.remaining} tone="deuda" /> de{' '}
                    <IntiAmount value={loan.principal} tone="neutral" />
                  </span>
                  <span>
                    Próxima cuota: <IntiAmount value={loan.installment} tone="neutral" />, día{' '}
                    {loan.next_due_tick}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Link to={paths.bank} className={cn(cardLinkClass, 'mt-auto pt-3 text-sm')}>
        Ver en el banco <ChevronRight aria-hidden className="size-4" />
      </Link>
    </RCard>
  )
}

interface MoreLink {
  to: string
  title: string
  text: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  iconClass: string
}

/** Tienda y Misiones no están en la barra de abajo: este es su acceso. */
function MoreLinks({ missions }: { missions?: number }) {
  const links: MoreLink[] = [
    {
      to: paths.shop,
      title: 'Tienda',
      text: 'Compra al contado o en cuotas',
      icon: ShoppingBag,
      iconClass: 'bg-fucsia-50 text-fucsia-700',
    },
    {
      to: paths.missions,
      title: 'Misiones',
      text:
        missions === undefined
          ? 'Retos de la semana'
          : `${missions} ${missions === 1 ? 'misión activa' : 'misiones activas'} esta semana`,
      icon: Target,
      iconClass: 'bg-turquesa-50 text-turquesa-700',
    },
  ]

  return (
    <nav aria-labelledby="more-title" className="md:col-span-2">
      <h2 id="more-title" className="mb-2 text-lg">
        Más en Pacha
      </h2>
      <ul className="divide-y divide-crema-200 overflow-hidden rounded-card bg-superficie shadow-card md:grid md:grid-cols-2 md:divide-x md:divide-y-0">
        {links.map(({ to, title, text, icon: Icon, iconClass }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex min-h-touch items-center gap-3 px-4 py-3 hover:bg-crema/60"
            >
              <span
                className={cn('grid size-10 shrink-0 place-items-center rounded-xl', iconClass)}
              >
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-tinta-suave">{text}</span>
              </span>
              <ChevronRight aria-hidden className="size-5 shrink-0 text-tinta-suave" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
