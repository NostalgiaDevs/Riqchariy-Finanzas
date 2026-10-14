import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { ChevronRight, LogOut, Store } from 'lucide-react'
import { paths } from '@/app/paths'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { usePlayerState } from '@/core/hooks/usePlayerState'
import { useAuthStore } from '@/core/store/authStore'
import { formatPercent } from '@/core/utils/format'
import { LEAGUES } from '@/core/utils/vitals'
import { AliasAvatar } from '@/design-system/AliasAvatar'
import { IntiAmount } from '@/design-system/money/IntiAmount'
import { RButton } from '@/design-system/RButton'
import { RCard } from '@/design-system/RCard'
import { Skeleton } from '@/design-system/Skeleton'
import { CreditScoreGauge } from '@/modules/shared/CreditScoreGauge'
import { ScoreCard } from '@/modules/shared/ScoreCard'
import type { PlayerState } from '@/types/economy'

/** Ítems de la tienda (balance.yaml → shop.items). Un id desconocido se muestra con ícono genérico. */
const ITEMS: Record<string, { name: string; icon: string }> = {
  zapatillas: { name: 'Zapatillas', icon: '👟' },
  audifonos: { name: 'Audífonos', icon: '🎧' },
  salida_amigos: { name: 'Salida con amigos', icon: '🍕' },
  mochila: { name: 'Mochila', icon: '🎒' },
  celular_nuevo: { name: 'Celular nuevo', icon: '📱' },
  bicicleta: { name: 'Bicicleta', icon: '🚲' },
  juego_video: { name: 'Videojuego', icon: '🎮' },
  ropa: { name: 'Ropa', icon: '👕' },
  libro: { name: 'Libro', icon: '📚' },
  candado: { name: 'Candado', icon: '🔒' },
  candado_bici: { name: 'Candado de bici', icon: '🔒' },
  botiquin: { name: 'Botiquín', icon: '🩹' },
  curso_online: { name: 'Curso online', icon: '💻' },
}

/**
 * Flags que se muestran como logro. Solo los positivos: "tuvo_mora" y parecidos no se exhiben.
 * Los demás flags del backend se ignoran hasta que se les dé un nombre aquí.
 */
const ACHIEVEMENTS: Record<string, { name: string; icon: string; text: string }> = {
  decision_informada: {
    name: 'Decides con información',
    icon: '🔍',
    text: 'Miraste el costo real antes de decidir.',
  },
  primera_inversion: {
    name: 'Primera inversión',
    icon: '🌱',
    text: 'Pusiste tu plata a trabajar por primera vez.',
  },
}

/**
 * Perfil — "quién soy en Pacha": identidad, score, credit score, trabajo, cosas y logros.
 * Todo sale de GET /pacha/state. La versión completa (gráfica de score) es S4.FE.03.
 */
export function ProfilePage() {
  const alias = useAuthStore((state) => state.user?.alias)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const { data: state } = usePlayerState()
  useDocumentTitle('Mi perfil')

  const onLogout = async () => {
    // Primero salir de /app: si se borra la sesión antes, RequireAuth mandaría al login.
    await navigate(paths.landing, { replace: true })
    logout()
  }

  return (
    // Celular: una columna. Tablet en adelante: tarjetas en pares.
    <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-6">
      <ProfileBanner alias={alias} state={state} onLogout={onLogout} />

      {state ? (
        <>
          <ScoreCard score={state.score} />
          <CreditCard score={state.credit_score} />
          <JobCard job={state.job} />
          <ThingsCard inventory={state.inventory} flags={state.flags} />
        </>
      ) : (
        Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-60 w-full rounded-card" />
        ))
      )}
    </div>
  )
}

/** Cabecera nocturna del perfil: el mismo cielo que la app, con la identidad del alumno. */
function ProfileBanner({
  alias,
  state,
  onLogout,
}: {
  alias?: string
  state?: PlayerState
  onLogout: () => void
}) {
  const league = state ? LEAGUES[state.league] : null
  const facts = state
    ? [
        { label: 'Días jugados', value: state.current_tick },
        { label: 'Cosas compradas', value: state.inventory.length },
        { label: 'Misiones activas', value: state.active_missions.length },
      ]
    : null

  return (
    <section
      aria-labelledby="profile-title"
      className="relative overflow-hidden rounded-sheet bg-noche-alta text-white shadow-raised md:col-span-2"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(246_180_74/0.35)_0%,rgb(214_46_108/0.15)_45%,transparent_70%)]"
      />
      <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-7">
        <div className="flex min-w-0 items-center gap-4">
          <AliasAvatar alias={alias} size="lg" className="ring-white/20" />
          <div className="min-w-0">
            <h1 id="profile-title" className="truncate text-[1.75rem] lg:text-4xl">
              {alias ?? 'Mi perfil'}
            </h1>
            {state && league ? (
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/75">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-0.5 font-semibold text-white">
                  <span aria-hidden>{league.icon}</span> Liga {league.name}
                </span>
                <span>Día {state.current_tick} en Pacha</span>
              </p>
            ) : (
              <Skeleton tone="night" className="mt-1.5 h-5 w-40 rounded-full" />
            )}
          </div>
        </div>
        <RButton
          variant="onDark"
          icon={<LogOut aria-hidden className="size-5" />}
          onClick={onLogout}
          className="sm:shrink-0"
        >
          Cerrar sesión
        </RButton>
      </div>

      {facts ? (
        <dl className="relative grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 bg-white/[0.04]">
          {facts.map(({ label, value }) => (
            <div key={label} className="px-2 py-3 text-center lg:py-4">
              <dt className="text-xs text-white/70 sm:text-sm">{label}</dt>
              <dd className="font-display text-2xl tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}

function CardFooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="mt-auto inline-flex min-h-touch items-center gap-1 self-start pt-3 text-sm font-semibold text-fucsia-700 hover:underline"
    >
      {children} <ChevronRight aria-hidden className="size-4" />
    </Link>
  )
}

/** Credit score con medidor y qué significa para pedir prestado (balance.yaml → credit). */
function CreditCard({ score }: { score: number }) {
  return (
    <RCard padding="lg" className="flex flex-col">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg">Credit score</h2>
        <span className="text-sm text-tinta-suave">de 300 a 850</span>
      </div>
      <CreditScoreGauge score={score} className="mt-4" />
      <p className="mt-4 text-sm leading-relaxed text-tinta-suave">
        {score >= 500
          ? 'Con 500 o más, el banco te puede prestar. Pagar tus cuotas a tiempo lo sube; atrasarte lo baja mucho.'
          : 'Con menos de 500, el banco no te presta y solo queda el prestamista, que cobra mucho más. Paga a tiempo para subirlo.'}
      </p>
    </RCard>
  )
}

/** Trabajo: el desempeño sale de El Kiosco y define el sueldo (balance.yaml → performance_range). */
function JobCard({ job }: { job: PlayerState['job'] }) {
  return (
    <RCard padding="lg" className="flex flex-col">
      <h2 className="text-lg">Tu trabajo</h2>
      <div className="mt-4 flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-dorado-50 text-dorado-700">
          <Store aria-hidden className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-snug">{job.name}</p>
          <p className="text-sm text-tinta-suave">
            <IntiAmount value={job.wage_per_week} tone="dorado" animated={false} /> por semana
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-baseline justify-between text-sm">
        <span className="text-tinta-suave">Desempeño</span>
        <span className="font-semibold tabular-nums">{formatPercent(job.performance)}</span>
      </div>
      <div
        role="progressbar"
        aria-label="Desempeño en tu trabajo"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(job.performance * 100)}
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-crema-200"
      >
        <div
          className="h-full rounded-full bg-dorado"
          style={{ width: formatPercent(job.performance) }}
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-tinta-suave">
        Tu desempeño sale de cómo te va en El Kiosco: si atiendes mejor, cobras más.
      </p>
      <CardFooterLink to={paths.games}>Ir a los juegos</CardFooterLink>
    </RCard>
  )
}

/** Lo que compraste y los logros que desbloqueaste. */
function ThingsCard({ inventory, flags }: { inventory: string[]; flags: string[] }) {
  const achievements = flags.flatMap((flag) => {
    const achievement = ACHIEVEMENTS[flag]
    return achievement ? [{ id: flag, ...achievement }] : []
  })

  return (
    <RCard padding="lg" className="flex flex-col">
      <h2 className="text-lg">Tus cosas</h2>
      {inventory.length === 0 ? (
        <p className="mt-2 text-sm text-tinta-suave">
          Todavía no compraste nada. Lo que compres en la tienda aparecerá aquí.
        </p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {inventory.map((id, index) => {
            const item = ITEMS[id] ?? { name: id.replaceAll('_', ' '), icon: '📦' }
            return (
              <li
                key={`${id}-${index}`}
                className="inline-flex items-center gap-2 rounded-full bg-crema px-3 py-1.5 text-sm font-medium"
              >
                <span aria-hidden>{item.icon}</span>
                {item.name}
              </li>
            )
          })}
        </ul>
      )}

      <h2 className="mt-6 border-t border-crema-200 pt-5 text-lg">Logros</h2>
      {achievements.length === 0 ? (
        <p className="mt-2 text-sm text-tinta-suave">
          Tus logros aparecerán aquí cuando tomes buenas decisiones.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {achievements.map(({ id, name, icon, text }) => (
            <li key={id} className="flex items-start gap-3">
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-morado-50 text-xl"
              >
                {icon}
              </span>
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-tinta-suave">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <CardFooterLink to={paths.shop}>Ir a la tienda</CardFooterLink>
    </RCard>
  )
}
