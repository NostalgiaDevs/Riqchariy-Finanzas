import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import {
  ArrowRight,
  BriefcaseBusiness,
  Landmark,
  MessageCircle,
  ShoppingBag,
  Trophy,
  Wallet,
} from 'lucide-react'
import { pachaApi } from '@/core/api/endpoints'
import { queryKeys } from '@/core/api/queryKeys'
import { useNextDay } from '@/core/hooks/useNextDay'
import { paths } from '@/app/paths'
import { RButton } from '@/design-system/RButton'
import { RCard } from '@/design-system/RCard'
import type { DecisionPreviewResponse } from '@/types/api'
import type { DaySummary, PlayerState } from '@/types/economy'
import { eventCatalog } from './eventCatalog'

const MAX_DAYS = 4
const sessionKey = (playerId: string) => `riqchariy-days-${playerId}`
function daysUsed(playerId: string) {
  try {
    return Number(sessionStorage.getItem(sessionKey(playerId))) || 0
  } catch {
    return 0
  }
}

export function Sprint2Home({ state }: { state: PlayerState }) {
  const client = useQueryClient()
  const [used, setUsed] = useState(() => daysUsed(state.player_id))
  const [summary, setSummary] = useState<DaySummary | null>(null)
  const [preview, setPreview] = useState<DecisionPreviewResponse['preview'] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const eventId = state.pending_events[0]
  const event = eventId ? eventCatalog[eventId] : undefined

  const advance = useNextDay()
  const advanceDay = () =>
    advance.mutate(state.current_tick, {
      onSuccess: (result) => {
        const next = daysUsed(state.player_id) + 1
        setUsed(next)
        try {
          sessionStorage.setItem(sessionKey(state.player_id), String(next))
        } catch {
          /* storage disabled */
        }
        setSummary(result.summary)
        setOutcome(null)
        setError(null)
      },
      onError: (reason: Error) => setError(reason.message),
    })
  const inspect = useMutation({
    mutationFn: pachaApi.preview,
    onSuccess: (result) => {
      setPreview(result.preview)
      setError(null)
    },
    onError: (reason: Error) => {
      setPreview(null)
      setError(reason.message)
    },
  })
  const decide = useMutation({
    mutationFn: pachaApi.decide,
    onSuccess: (result) => {
      client.setQueryData(queryKeys.playerState, result.new_state)
      client.invalidateQueries({ queryKey: queryKeys.playerState })
      setOutcome(result.outcome)
      setSelected(null)
      setPreview(null)
      setError(null)
    },
    onError: (reason: Error) => setError(reason.message),
  })

  const tiles = [
    { label: 'Billetera', value: `ⵊ${state.wallet}`, to: paths.bank, icon: Wallet },
    {
      label: 'Banco',
      value: `${state.savings.meta.balance + state.savings.emergencias.balance + state.savings.libre.balance} intis ahorrados`,
      to: paths.bank,
      icon: Landmark,
    },
    {
      label: 'Trabajo',
      value: `${state.job.name} · ⵊ${state.job.wage_per_week}/semana`,
      to: paths.games,
      icon: BriefcaseBusiness,
    },
    { label: 'Tienda', value: 'Compra con criterio', to: paths.shop, icon: ShoppingBag },
    { label: 'Ranking', value: 'Próximamente', to: paths.ranking, icon: Trophy },
    { label: 'Qori', value: 'Pregúntale a Qori', to: paths.chatbot, icon: MessageCircle },
  ]

  return (
    <section className="space-y-5" aria-label="Tu día en Pacha">
      <div className="rounded-card bg-anil px-5 py-4 text-white shadow-card">
        <p className="text-sm text-white/75">Tu mundo ahora</p>
        <p className="font-display text-xl">
          Día {state.current_tick} · ⵊ{state.wallet} en billetera
        </p>
      </div>
      {eventId && (
        <RCard padding="lg" className="animate-entrada border border-fucsia/30">
          {event ? (
            <>
              <p className="text-sm font-semibold text-fucsia-700">Algo pasó en Pacha</p>
              <h2 className="mt-1 text-xl">
                {event.icon} {event.name}
              </h2>
              <p className="mt-2 text-tinta-suave">{event.description}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {event.choices.map((choice) => (
                  <RButton
                    key={choice.id}
                    variant={selected === choice.id ? 'primary' : 'secondary'}
                    onClick={() => {
                      setSelected(choice.id)
                      setPreview(null)
                      inspect.mutate({ event_id: event.id, choice_id: choice.id })
                    }}
                    disabled={decide.isPending || inspect.isPending}
                  >
                    {choice.text} · {choice.preview_label}
                  </RButton>
                ))}
              </div>
              {inspect.isPending && (
                <p className="mt-3" role="status">
                  Calculando impacto…
                </p>
              )}
              {preview && selected && (
                <div className="mt-4 rounded-control bg-crema p-4" aria-live="polite">
                  <p className="font-semibold">Antes de decidir</p>
                  <p>
                    Te quedarían ⵊ{preview.wallet_after} · Estrés{' '}
                    {Math.round(preview.stress_after * 100)}% · Riesgo{' '}
                    {preview.risk_level === 'high'
                      ? 'alto'
                      : preview.risk_level === 'medium'
                        ? 'medio'
                        : 'bajo'}
                  </p>
                  {preview.warning && <p className="mt-1 text-deuda-700">⚠ {preview.warning}</p>}
                  <RButton
                    className="mt-3"
                    loading={decide.isPending}
                    onClick={() => decide.mutate({ event_id: event.id, choice_id: selected })}
                  >
                    Confirmar decisión
                  </RButton>
                </div>
              )}
            </>
          ) : (
            <p>
              Hay un evento pendiente ({eventId}). Su contenido estará disponible al conectar el
              catálogo de eventos del backend.
            </p>
          )}
        </RCard>
      )}
      {outcome && (
        <RCard padding="lg" className="border border-ahorro/30">
          <p className="font-semibold">🦊 Qori dice</p>
          <p className="mt-1">{outcome}</p>
        </RCard>
      )}
      <RCard
        padding="lg"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-xl">Avanzar en Pacha</h2>
          <p className="text-sm text-tinta-suave">
            {MAX_DAYS - used > 0
              ? `Te quedan ${MAX_DAYS - used} avances en esta sesión.`
              : 'Ya avanzaste cuatro días en esta sesión.'}
          </p>
        </div>
        <RButton
          icon={<ArrowRight aria-hidden className="size-5" />}
          loading={advance.isPending}
          disabled={used >= MAX_DAYS || Boolean(eventId)}
          onClick={advanceDay}
        >
          Avanzar día
        </RButton>
      </RCard>
      {eventId && (
        <p className="text-sm text-tinta-suave">
          Resuelve el evento pendiente para continuar al día siguiente.
        </p>
      )}
      {summary && (
        <RCard padding="lg">
          <p role="status">Día {advance.data?.tick}</p>
          <h2 className="text-xl">Así fue tu día</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {(
              [
                ['Ingresos', `${summary.income > 0 ? '+' : ''}ⵊ${summary.income}`],
                ['Gastos', `${summary.expenses > 0 ? '−' : ''}ⵊ${summary.expenses}`],
                [
                  'Intereses ganados',
                  `${summary.interest_earned > 0 ? '+' : ''}ⵊ${summary.interest_earned}`,
                ],
                ['Cuotas', `${summary.loan_payments > 0 ? '−' : ''}ⵊ${summary.loan_payments}`],
                ['Score', `${summary.score_change > 0 ? '+' : ''}${summary.score_change}`],
                ['Estrés', `${Math.round(summary.stress_change * 100)} puntos`],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-control bg-crema px-3 py-2">
                <dt className="text-tinta-suave">{label}</dt>
                <dd className="font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          {summary.events_triggered.length > 0 && eventId && (
            <p className="mt-3 text-sm">Tienes una nueva decisión pendiente.</p>
          )}
        </RCard>
      )}
      {error && (
        <p role="alert" className="rounded-control bg-deuda-50 p-3 text-deuda-700">
          {error}
        </p>
      )}
      <div>
        <h2 className="mb-3 text-xl">Explora Pacha</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tiles.map(({ label, value, to, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="flex min-h-24 flex-col rounded-card bg-superficie p-3 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised focus-visible:outline-2 focus-visible:outline-fucsia sm:p-4"
            >
              <Icon aria-hidden className="size-5 text-fucsia-700" />
              <span className="mt-2 font-semibold">{label}</span>
              <span className="mt-1 text-sm text-tinta-suave">{value}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
