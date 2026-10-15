import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Landmark, ShieldCheck, Target, Wallet } from 'lucide-react'
import { pachaApi } from '@/core/api/endpoints'
import { queryKeys } from '@/core/api/queryKeys'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { usePlayerState } from '@/core/hooks/usePlayerState'
import { RButton } from '@/design-system/RButton'
import { RCard } from '@/design-system/RCard'
import { RModal } from '@/design-system/RModal'
import { Skeleton } from '@/design-system/Skeleton'
import { CreditScoreGauge } from '@/modules/shared/CreditScoreGauge'
import type { JarId, PlayerState } from '@/types/economy'

const labels: Record<'wallet' | JarId, string> = {
  wallet: 'Billetera',
  meta: 'Meta',
  emergencias: 'Emergencias',
  libre: 'Libre',
}
const jars: { id: JarId; icon: typeof Wallet; description: string }[] = [
  { id: 'meta', icon: Target, description: 'Para aquello que quieres lograr.' },
  { id: 'emergencias', icon: ShieldCheck, description: 'Tu colchón para imprevistos.' },
  { id: 'libre', icon: Wallet, description: 'Ahorro sin una meta específica.' },
]

export function BankPage() {
  useDocumentTitle('Banco')
  const { data: state, isPending, refetch } = usePlayerState()
  if (isPending)
    return (
      <div className="space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    )
  if (!state)
    return (
      <RCard padding="lg">
        <p role="alert">No pudimos cargar tu banco.</p>
        <RButton className="mt-3" onClick={() => refetch()}>
          Reintentar
        </RButton>
      </RCard>
    )
  return <BankContent state={state} />
}

function BankContent({ state }: { state: PlayerState }) {
  const client = useQueryClient()
  const [from, setFrom] = useState<'wallet' | JarId>('wallet')
  const [to, setTo] = useState<'wallet' | JarId>('meta')
  const [amount, setAmount] = useState('')
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [holding, setHolding] = useState(false)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const total =
    state.savings.meta.balance + state.savings.emergencias.balance + state.savings.libre.balance
  const sourceBalance = from === 'wallet' ? state.wallet : state.savings[from].balance
  const validAmount =
    Number.isInteger(Number(amount)) &&
    Number(amount) > 0 &&
    Number(amount) <= sourceBalance &&
    from !== to
  const transfer = useMutation({
    mutationFn: pachaApi.transferSavings,
    onSuccess: (result, variables) => {
      if (!result.success) {
        setError('No se pudo completar el movimiento.')
        return
      }
      client.invalidateQueries({ queryKey: queryKeys.playerState })
      setMessage(
        `Moviste ⵊ${variables.amount} de ${labels[variables.from]} a ${labels[variables.to]}.`,
      )
      setError('')
      setAmount('')
      setOpen(false)
    },
    onError: (reason: Error) => setError(reason.message),
  })
  const send = () => {
    if (validAmount && !transfer.isPending) transfer.mutate({ from, to, amount: Number(amount) })
  }
  const stopHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    holdTimer.current = null
    setHolding(false)
  }
  useEffect(
    () => () => {
      if (holdTimer.current) clearTimeout(holdTimer.current)
    },
    [],
  )

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-fucsia-700">Tu dinero en Pacha</p>
        <h1 className="text-3xl">Banco</h1>
        <p className="mt-1 text-tinta-suave">
          Organiza tus intis, protege tus imprevistos y conoce tus deudas.
        </p>
      </div>
      <RCard padding="lg" className="bg-noche-alta text-white">
        <p className="text-white/75">En tus tres frascos</p>
        <p className="font-display text-4xl">ⵊ{total}</p>
        <p className="mt-2 text-sm text-white/75">Billetera disponible: ⵊ{state.wallet}</p>
      </RCard>
      <section aria-labelledby="savings-title">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="savings-title" className="text-xl">
            Tus frascos
          </h2>
          <RButton
            onClick={() => {
              setError('')
              setOpen(true)
            }}
          >
            Mover intis
          </RButton>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {jars.map(({ id, icon: Icon, description }) => {
            const balance = state.savings[id].balance
            const goal = id === 'meta' ? state.savings.meta.goal_target : 0
            const progress = goal > 0 ? Math.min(100, Math.round((balance / goal) * 100)) : 0
            return (
              <RCard key={id} padding="lg">
                <Icon aria-hidden className="size-6 text-ahorro-700" />
                <h3 className="mt-2 font-semibold">{labels[id]}</h3>
                <p className="font-display text-2xl">ⵊ{balance}</p>
                <p className="mt-1 text-sm text-tinta-suave">{description}</p>
                {id === 'meta' && goal > 0 && (
                  <>
                    <div
                      role="progressbar"
                      aria-label="Progreso de tu meta"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="mt-3 h-2 overflow-hidden rounded-full bg-crema-200"
                    >
                      <div className="h-full bg-ahorro" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-tinta-suave">
                      {progress}% de ⵊ{goal} para {state.savings.meta.goal_item}
                    </p>
                  </>
                )}
              </RCard>
            )
          })}
        </div>
      </section>
      <section aria-labelledby="debts-title">
        <h2 id="debts-title" className="mb-3 text-xl">
          Deudas y crédito
        </h2>
        <div className="grid gap-3 md:grid-cols-[1fr_18rem]">
          <RCard padding="lg">
            <h3 className="font-semibold">Tus deudas</h3>
            {state.loans.length === 0 ? (
              <p className="mt-2 text-tinta-suave">No tienes deudas activas.</p>
            ) : (
              <ul className="mt-3 space-y-5">
                {state.loans.map((loan) => {
                  const paid =
                    loan.principal > 0
                      ? Math.min(
                          100,
                          Math.max(
                            0,
                            Math.round(((loan.principal - loan.remaining) / loan.principal) * 100),
                          ),
                        )
                      : 0
                  return (
                    <li key={loan.id} className="border-t border-crema-200 pt-3">
                      <div className="flex justify-between gap-2">
                        <strong className="capitalize">{loan.product}</strong>
                        <span className="font-semibold text-deuda-700">
                          ⚠ Faltan ⵊ{loan.remaining}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`Pagado de ${loan.product}`}
                        aria-valuenow={paid}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="mt-2 h-2 rounded-full bg-deuda-50"
                      >
                        <div
                          className="h-full rounded-full bg-ahorro"
                          style={{ width: `${paid}%` }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-tinta-suave">
                        {paid}% pagado · Tasa mensual {Math.round(loan.monthly_rate * 100)}% · Cuota
                        ⵊ{loan.installment} el día {loan.next_due_tick}
                      </p>
                      <RButton
                        variant="secondary"
                        disabled
                        className="mt-3"
                        title="Disponible cuando el backend permita pagar cuotas"
                      >
                        Pagar cuota · próximamente
                      </RButton>
                    </li>
                  )
                })}
              </ul>
            )}
          </RCard>
          <RCard padding="lg">
            <h3 className="text-center font-semibold">Tu credit score</h3>
            <CreditScoreGauge score={state.credit_score} />
            <p className="mt-3 text-center text-sm text-tinta-suave">
              Pagar a tiempo ayuda a cuidar tu historial.
            </p>
          </RCard>
        </div>
      </section>
      <RCard padding="lg">
        <div className="flex items-center gap-2">
          <Landmark aria-hidden className="size-5 text-fucsia-700" />
          <h2 className="text-xl">Antes de pedir un préstamo</h2>
        </div>
        <p className="mt-2 text-tinta-suave">
          Ejemplo: recibes ⵊ200 y pagas seis cuotas de ⵊ36. En total devuelves ⵊ216: el costo del
          préstamo es ⵊ16.
        </p>
        <ol className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index} className="rounded-control bg-crema p-2 text-center text-sm">
              <span className="block text-tinta-suave">Mes {index + 1}</span>
              <strong>ⵊ36</strong>
            </li>
          ))}
        </ol>
        <RButton
          variant="secondary"
          disabled
          className="mt-4"
          title="Disponible cuando exista el endpoint de préstamos"
        >
          Pedir préstamo · próximamente
        </RButton>
      </RCard>
      {message && (
        <p role="status" className="rounded-control bg-ahorro-50 p-3 text-ahorro-700">
          {message}
        </p>
      )}
      <RModal
        open={open}
        onClose={() => {
          stopHold()
          setOpen(false)
        }}
        title="Mover intis"
        description="Elige desde dónde y hacia dónde moverlos."
      >
        <div className="space-y-3">
          <label className="block text-sm font-semibold">
            Desde
            <select
              value={from}
              disabled={transfer.isPending}
              onChange={(e) => {
                stopHold()
                setFrom(e.target.value as typeof from)
              }}
              className="mt-1 w-full min-h-touch rounded-control border border-crema-300 bg-white p-2"
            >
              {Object.entries(labels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Hacia
            <select
              value={to}
              disabled={transfer.isPending}
              onChange={(e) => {
                stopHold()
                setTo(e.target.value as typeof to)
              }}
              className="mt-1 w-full min-h-touch rounded-control border border-crema-300 bg-white p-2"
            >
              {Object.entries(labels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Monto en intis
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max={sourceBalance}
              step="1"
              value={amount}
              disabled={transfer.isPending}
              onChange={(e) => {
                stopHold()
                setAmount(e.target.value)
              }}
              className="mt-1 w-full min-h-touch rounded-control border border-crema-300 p-2"
            />
          </label>
          <p className="text-sm text-tinta-suave">
            Disponible en {labels[from]}: ⵊ{sourceBalance}
          </p>
          {from === to && (
            <p role="alert" className="text-sm text-deuda-700">
              Elige dos lugares distintos.
            </p>
          )}
          {Number(amount) > sourceBalance && (
            <p role="alert" className="text-sm text-deuda-700">
              No tienes suficientes intis ahí.
            </p>
          )}
          {from === 'emergencias' && (
            <div className="rounded-control bg-dorado-50 p-3">
              <p className="font-semibold">⚠ Este frasco te protege</p>
              <p className="text-sm">
                Usa estos intis solo si de verdad los necesitas. Mantén el botón durante 2 segundos
                para confirmar.
              </p>
            </div>
          )}
          {from === 'emergencias' ? (
            <button
              type="button"
              disabled={!validAmount || transfer.isPending}
              onPointerDown={(e) => {
                if (!validAmount || holdTimer.current) return
                e.currentTarget.setPointerCapture(e.pointerId)
                setHolding(true)
                holdTimer.current = setTimeout(() => {
                  holdTimer.current = null
                  setHolding(false)
                  send()
                }, 2000)
              }}
              onPointerMove={(e) => {
                if (!holdTimer.current) return
                const rect = e.currentTarget.getBoundingClientRect()
                if (
                  e.clientX < rect.left ||
                  e.clientX > rect.right ||
                  e.clientY < rect.top ||
                  e.clientY > rect.bottom
                )
                  stopHold()
              }}
              onPointerUp={stopHold}
              onPointerCancel={stopHold}
              onBlur={stopHold}
              onKeyDown={(e) => {
                if (e.repeat || holdTimer.current || (e.key !== ' ' && e.key !== 'Enter')) return
                setHolding(true)
                holdTimer.current = setTimeout(() => {
                  holdTimer.current = null
                  setHolding(false)
                  send()
                }, 2000)
              }}
              onKeyUp={stopHold}
              className="relative min-h-touch w-full touch-none select-none overflow-hidden rounded-control bg-deuda px-4 font-semibold text-white disabled:opacity-50"
            >
              {holding && (
                <span
                  aria-hidden
                  className="absolute inset-0 origin-left bg-deuda-700 motion-safe:animate-[hold-fill_2s_linear_forwards]"
                />
              )}
              <span className="relative">
                {holding ? 'Mantén presionado…' : 'Mantén 2 s para mover intis'}
              </span>
            </button>
          ) : (
            <RButton fullWidth disabled={!validAmount} loading={transfer.isPending} onClick={send}>
              Confirmar movimiento
            </RButton>
          )}
          {error && (
            <p role="alert" className="text-sm text-deuda-700">
              {error}
            </p>
          )}
        </div>
      </RModal>
    </div>
  )
}
