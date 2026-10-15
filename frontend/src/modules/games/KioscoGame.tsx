import { useEffect, useReducer, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gamesApi } from '@/core/api/endpoints'
import { queryKeys } from '@/core/api/queryKeys'
import { RButton } from '@/design-system/RButton'
import { RCard } from '@/design-system/RCard'
import {
  PRODUCTS,
  demandFor,
  initialKiosco,
  kioscoReducer,
  kioscoScore,
  pickCustomer,
} from './kiosco.reducer'

export function KioscoGame() {
  const [round, setRound] = useState(0)
  return <KioscoRound key={round} onReplay={() => setRound((value) => value + 1)} />
}

function KioscoRound({ onReplay }: { onReplay: () => void }) {
  const [game, dispatch] = useReducer(kioscoReducer, undefined, initialKiosco)
  const [feedback, setFeedback] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const client = useQueryClient()
  const submitted = useRef(false)
  const start = useRef<number>(0)
  const submit = useMutation({
    mutationFn: gamesApi.submitResult,
    onSuccess: (response) => {
      setResult(response.message)
      client.invalidateQueries({ queryKey: queryKeys.playerState })
    },
    onError: (reason: Error) => setError(reason.message),
  })
  const remainingStock = PRODUCTS.reduce((sum, item) => sum + game.stock[item.id], 0)
  useEffect(() => {
    if (game.phase === 'result') return
    if (!start.current) start.current = Date.now()
    const timer = setInterval(() => dispatch({ type: 'tick' }), 1000)
    return () => clearInterval(timer)
  }, [game.phase])
  useEffect(() => {
    if (game.phase !== 'serve' || game.customer) return
    const timer = setTimeout(
      () => {
        dispatch({ type: 'customer', id: pickCustomer(game.prices, Math.random()) })
      },
      Math.max(
        350,
        (1400 - game.served * 55) /
          (PRODUCTS.reduce((sum, item) => sum + demandFor(item.id, game.prices[item.id]), 0) /
            PRODUCTS.length),
      ),
    )
    return () => clearTimeout(timer)
  }, [game.phase, game.customer, game.served, game.prices])
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [game.phase])
  useEffect(() => {
    if (game.phase === 'serve' && remainingStock === 0) dispatch({ type: 'next' })
  }, [game.phase, remainingStock])
  useEffect(() => {
    if (game.phase !== 'serve' || !game.customer) return
    const timer = setTimeout(() => {
      dispatch({ type: 'miss' })
      setFeedback('El cliente se fue. ¡Atiende el siguiente pedido!')
    }, 3000)
    return () => clearTimeout(timer)
  }, [game.phase, game.customer])
  useEffect(() => {
    if (game.phase !== 'result' || submitted.current) return
    submitted.current = true
    submit.mutate({
      game_id: 'kiosco',
      data: {
        score: kioscoScore(game),
        items_sold: game.sold,
        time_seconds: Math.round((Date.now() - start.current) / 1000),
        perfect: game.missed === 0 && game.sold >= 6,
      },
    })
  }, [game, submit])
  const serve = () => {
    if (!game.customer) return
    const stocked = game.stock[game.customer.product] > 0
    setFeedback(stocked ? '¡Venta realizada!' : 'No quedaba stock para ese pedido.')
    dispatch({ type: 'serve' })
  }
  const phaseDuration =
    game.phase === 'buy' ? 30 : game.phase === 'price' ? 20 : game.phase === 'serve' ? 90 : 0
  const retry = () => {
    setError('')
    submit.mutate({
      game_id: 'kiosco',
      data: {
        score: kioscoScore(game),
        items_sold: game.sold,
        time_seconds: Math.round((Date.now() - start.current) / 1000),
        perfect: game.missed === 0 && game.sold >= 6,
      },
    })
  }
  return (
    <div className="space-y-4 pb-6">
      <div className="rounded-sheet bg-noche-alta p-4 text-white sm:p-5">
        <p className="text-sm text-inti-claro">JUEGO 1 · EL KIOSCO</p>
        <h1 className="text-2xl sm:text-3xl">Tu turno en el kiosco</h1>
        <p className="mt-1 text-sm text-white/75 sm:mt-2 sm:text-base">
          Compra con cuidado, ajusta precios y atiende a tus clientes.
        </p>
      </div>
      <div className="flex items-center justify-between rounded-card bg-dorado-50 p-3 font-semibold">
        <span>
          {game.phase === 'buy'
            ? '1 · Compra'
            : game.phase === 'price'
              ? '2 · Precios'
              : game.phase === 'serve'
                ? '3 · Hora punta'
                : 'Cierre de caja'}
        </span>
        <span aria-live="off" className="tabular-nums">
          {game.phase !== 'result' ? `${game.seconds} s` : 'Final'}
        </span>
      </div>
      {phaseDuration > 0 && (
        <div
          role="progressbar"
          aria-label="Tiempo restante de esta fase"
          aria-valuemin={0}
          aria-valuemax={phaseDuration}
          aria-valuenow={game.seconds}
          className="-mt-2 h-2 overflow-hidden rounded-full bg-crema-200"
        >
          <div
            className="h-full rounded-full bg-fucsia transition-[width] duration-1000 ease-linear"
            style={{ width: `${(game.seconds / phaseDuration) * 100}%` }}
          />
        </div>
      )}
      {game.phase === 'buy' && (
        <>
          <RCard padding="md">
            <p className="font-semibold">Presupuesto: ⵊ50 · Disponible: ⵊ{50 - game.spent}</p>
            <p className="mt-1 text-sm text-tinta-suave">
              Tienes 30 segundos. Compra unidades para tener qué vender.
            </p>
          </RCard>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PRODUCTS.map((item) => (
              <RCard key={item.id} padding="lg">
                <p className="text-2xl">{item.icon}</p>
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-sm text-tinta-suave">
                  Costo ⵊ{item.cost} · Tienes {game.stock[item.id]}
                </p>
                <div className="mt-3 flex gap-2">
                  <RButton
                    variant="secondary"
                    aria-label={`Quitar ${item.name}`}
                    disabled={!game.stock[item.id]}
                    onClick={() => dispatch({ type: 'remove', id: item.id })}
                  >
                    −
                  </RButton>
                  <RButton
                    aria-label={`Comprar ${item.name}`}
                    disabled={game.spent + item.cost > 50}
                    onClick={() => dispatch({ type: 'buy', id: item.id })}
                  >
                    +
                  </RButton>
                </div>
              </RCard>
            ))}
          </div>
          <div className="sticky bottom-2 z-10 rounded-card bg-crema/95 p-2 shadow-raised backdrop-blur-sm">
            <RButton fullWidth onClick={() => dispatch({ type: 'next' })}>
              {remainingStock > 0 ? 'Listo, poner precios' : 'Terminar sin mercadería'}
            </RButton>
          </div>
        </>
      )}
      {game.phase === 'price' && (
        <>
          <p className="text-tinta-suave">
            Precios altos dejan más margen, pero bajan la demanda. Ajusta con el control.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PRODUCTS.filter((item) => game.stock[item.id] > 0).map((item) => (
              <RCard key={item.id} padding="lg">
                <label className="font-semibold" htmlFor={`price-${item.id}`}>
                  {item.icon} {item.name} · ⵊ{game.prices[item.id]}
                </label>
                <input
                  id={`price-${item.id}`}
                  className="mt-3 w-full accent-fucsia"
                  type="range"
                  min={item.cost}
                  max="20"
                  value={game.prices[item.id]}
                  onChange={(e) =>
                    dispatch({ type: 'setPrice', id: item.id, price: Number(e.target.value) })
                  }
                />
                <p className="text-sm text-tinta-suave">
                  Demanda estimada: {Math.round(demandFor(item.id, game.prices[item.id]) * 100)}% ·
                  Margen: ⵊ{game.prices[item.id] - item.cost}
                </p>
              </RCard>
            ))}
          </div>
          <div className="sticky bottom-2 z-10 rounded-card bg-crema/95 p-2 shadow-raised backdrop-blur-sm">
            <RButton fullWidth onClick={() => dispatch({ type: 'next' })}>
              Abrir el kiosco
            </RButton>
          </div>
        </>
      )}
      {game.phase === 'serve' && (
        <>
          <RCard padding="lg">
            <p className="text-sm text-tinta-suave">
              Ventas {game.sold} · Clientes perdidos {game.missed} · Ingresos ⵊ{game.earned}
            </p>
          </RCard>
          <RCard
            padding="lg"
            className="flex min-h-48 flex-col items-center justify-center text-center"
          >
            {game.customer ? (
              <>
                <p className="text-4xl">
                  {PRODUCTS.find((item) => item.id === game.customer?.product)?.icon}
                </p>
                <h2 className="mt-2 text-xl">
                  ¡Quiero {PRODUCTS.find((item) => item.id === game.customer?.product)?.name}!
                </h2>
                <p className="mt-1 text-sm text-tinta-suave">
                  Se irá en 3 segundos.{' '}
                  {game.stock[game.customer.product] > 0
                    ? `Stock: ${game.stock[game.customer.product]}`
                    : 'Sin stock para este pedido.'}
                </p>
                <RButton className="mt-4" onClick={serve}>
                  Atender pedido
                </RButton>
              </>
            ) : (
              <>
                <span aria-hidden className="text-4xl">
                  🏪
                </span>
                <p className="mt-2 font-semibold">Esperando al siguiente cliente…</p>
                <p className="mt-1 text-sm text-tinta-suave">
                  Quedan {remainingStock} productos. Atiende el pedido antes de que pasen 3
                  segundos.
                </p>
              </>
            )}
          </RCard>
          <p role="status" className="text-center text-sm">
            {feedback}
          </p>
          <RButton variant="secondary" fullWidth onClick={() => dispatch({ type: 'next' })}>
            Cerrar caja ahora
          </RButton>
        </>
      )}
      {game.phase === 'result' && (
        <RCard padding="lg" className="animate-entrada">
          <h2 className="text-2xl">Cierre de caja</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <dt>Ingresos</dt>
              <dd className="font-display text-2xl text-ahorro-700">
                {game.earned > 0 ? '+' : ''}ⵊ{game.earned}
              </dd>
            </div>
            <div>
              <dt>Mercadería</dt>
              <dd className="font-display text-2xl text-deuda-700">
                {game.spent > 0 ? '−' : ''}ⵊ{game.spent}
              </dd>
            </div>
            <div>
              <dt>Utilidad</dt>
              <dd className="font-display text-2xl">
                {game.earned - game.spent < 0 ? '−' : ''}ⵊ{Math.abs(game.earned - game.spent)}
              </dd>
            </div>
            <div>
              <dt>Productos vendidos</dt>
              <dd className="font-display text-2xl">{game.sold}</dd>
            </div>
          </dl>
          <p className="mt-4">Puntuación: {kioscoScore(game)} de 1000</p>
          <p role="status" className="mt-3 font-semibold text-ahorro-700">
            {result || (submit.isPending ? 'Guardando resultado…' : '')}
          </p>
          {error && (
            <div role="alert" className="mt-2 rounded-control bg-deuda-50 p-3 text-deuda-700">
              <p>{error}</p>
              <p className="mt-1 text-sm">
                Tu partida sigue aquí. Si acabas de jugar, espera un minuto y vuelve a enviar el
                resultado.
              </p>
              <RButton
                variant="secondary"
                className="mt-2"
                loading={submit.isPending}
                onClick={retry}
              >
                Reintentar guardar
              </RButton>
            </div>
          )}
          <RButton className="mt-4" disabled={submit.isPending} onClick={onReplay}>
            Jugar otra vez
          </RButton>
        </RCard>
      )}
    </div>
  )
}
