import { useEffect, useRef, useState } from 'react'
import { RButton } from '@/design-system/RButton'
import { RCard } from '@/design-system/RCard'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { useGameResult } from './useGameResult'

const BASE = [
  { name: 'Cuaderno', icon: '📒', real: 18 },
  { name: 'Audífonos', icon: '🎧', real: 90 },
  { name: 'Mochila', icon: '🎒', real: 70 },
  { name: 'Balón', icon: '⚽', real: 45 },
  { name: 'Zapatillas', icon: '👟', real: 180 },
  { name: 'Libro', icon: '📚', real: 20 },
]
function marketItems(round: number) {
  return BASE.map((item, index) => {
    const trap = index === (round + 2) % BASE.length
    const cheap = !trap && (index + round) % 2 === 0
    const listed = Math.round(item.real * (trap ? 1.7 : cheap ? 0.7 : 1.18))
    return { ...item, listed, trap, worthBuying: cheap }
  })
}
type Decision = {
  correct: number
  total: number
  profit: number
  investigatedBuys: number
  buys: number
}
const empty: Decision = { correct: 0, total: 0, profit: 0, investigatedBuys: 0, buys: 0 }
function MarketRun({ replay }: { replay: () => void }) {
  const [round, setRound] = useState(0)
  const [seconds, setSeconds] = useState(30)
  const [done, setDone] = useState<number[]>([])
  const [revealed, setRevealed] = useState<number[]>([])
  const [stats, setStats] = useState<Decision>(empty)
  const [feedback, setFeedback] = useState('')
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null)
  const decidedRef = useRef(new Set<number>())
  const submittedRef = useRef(false)
  const advancing = useRef(false)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const result = useGameResult()
  const items = marketItems(Math.min(round, 4))
  const next = () => {
    if (advancing.current) return
    advancing.current = true
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    if (hold.current) clearTimeout(hold.current)
    hold.current = null
    setRound((value) => value + 1)
    setSeconds(30)
    setDone([])
    decidedRef.current.clear()
    setRevealed([])
    setFeedback('')
    window.setTimeout(() => {
      advancing.current = false
    }, 0)
  }
  useEffect(() => {
    if (round >= 5) return
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [round])
  useEffect(
    () => () => {
      if (hold.current) clearTimeout(hold.current)
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    },
    [],
  )
  useEffect(() => {
    if (seconds === 0 && round < 5) next()
  }, [seconds, round])
  useEffect(() => {
    if (round !== 5 || submittedRef.current) return
    submittedRef.current = true
    result.mutate({
      game_id: 'mercado_rapido',
      data: {
        profit: stats.profit,
        accuracy_pct: Math.round((stats.correct / Math.max(1, stats.total)) * 100),
        investigated_before_buying_pct: Math.round(
          (stats.investigatedBuys / Math.max(1, stats.buys)) * 100,
        ),
      },
    })
    // Exactly once: round changes to 5 only after the last card or timeout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])
  const reveal = (index: number) => {
    if (!done.includes(index))
      setRevealed((items) => (items.includes(index) ? items : [...items, index]))
  }
  const startHold = (index: number) => {
    if (seconds === 0 || decidedRef.current.has(index)) return
    if (hold.current) clearTimeout(hold.current)
    hold.current = setTimeout(() => {
      hold.current = null
      reveal(index)
    }, 550)
  }
  const stopHold = () => {
    if (hold.current) clearTimeout(hold.current)
    hold.current = null
  }
  const decide = (index: number, buy: boolean) => {
    if (decidedRef.current.has(index) || round >= 5 || seconds === 0 || advancing.current) return
    stopHold()
    const item = items[index]
    if (!item) return
    decidedRef.current.add(index)
    const correct = buy === item.worthBuying
    setStats((current) => ({
      correct: current.correct + Number(correct),
      total: current.total + 1,
      profit: current.profit + (buy ? item.real - item.listed : 0),
      investigatedBuys: current.investigatedBuys + Number(buy && revealed.includes(index)),
      buys: current.buys + Number(buy),
    }))
    setDone((current) => [...current, index])
    setFeedback(
      `${correct ? 'Bien visto.' : 'Ojo.'} ${item.name}: precio real ⵊ${item.real}, oferta ⵊ${item.listed}.${item.trap ? ' Era el producto trampa.' : ''}`,
    )
    if (done.length === 5) advanceTimer.current = window.setTimeout(next, 700)
  }
  return (
    <div className="space-y-4 pb-6">
      <header className="rounded-sheet bg-noche-alta p-5 text-white">
        <p className="text-sm text-inti-claro">JUEGO 4 · MERCADO RÁPIDO</p>
        <h1 className="text-3xl">Compara antes de comprar</h1>
        <p className="mt-1 text-white/75">
          Mantén presionado cada producto para investigar su valor real. Compra solo si está barato.
        </p>
      </header>
      {round < 5 ? (
        <>
          <div className="sticky top-0 z-10 rounded-control bg-crema/95 p-2 shadow-card backdrop-blur-sm">
            <div className="flex items-center justify-between font-semibold">
              <span>Ronda {round + 1} de 5</span>
              <span role="timer" className={seconds < 10 ? 'text-deuda-700' : ''}>
                {seconds} s
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Tiempo restante"
              aria-valuenow={seconds}
              aria-valuemin={0}
              aria-valuemax={30}
              className="mt-2 h-2 rounded-full bg-crema-200"
            >
              <div
                className="h-2 rounded-full bg-fucsia"
                style={{ width: `${(seconds / 30) * 100}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {items.map((item, index) => (
              <RCard key={item.name} padding="sm" className="min-w-0 space-y-2 sm:p-5">
                <p className="text-3xl" aria-hidden>
                  {item.icon}
                </p>
                <h2 className="text-base sm:text-lg">{item.name}</h2>
                <p className="text-sm">
                  Precio anunciado: <strong>ⵊ{item.listed}</strong>
                </p>
                <button
                  type="button"
                  disabled={done.includes(index) || seconds === 0}
                  aria-label={`Investigar ${item.name}: mantener presionado para ver el valor real`}
                  onPointerDown={() => startHold(index)}
                  onPointerUp={stopHold}
                  onPointerLeave={stopHold}
                  onPointerCancel={stopHold}
                  onContextMenu={(event) => event.preventDefault()}
                  onKeyDown={(event) => {
                    if (event.key === ' ' || event.key === 'Enter') startHold(index)
                  }}
                  onKeyUp={stopHold}
                  onBlur={stopHold}
                  className="min-h-touch w-full touch-none rounded-control border border-crema-300 px-2 text-xs font-semibold hover:border-fucsia sm:text-sm"
                >
                  {revealed.includes(index)
                    ? `Valor real: ⵊ${item.real}`
                    : 'Mantén presionado para investigar'}
                </button>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <RButton
                    fullWidth
                    className="px-2 text-sm"
                    disabled={done.includes(index) || seconds === 0}
                    onClick={() => decide(index, true)}
                  >
                    Comprar
                  </RButton>
                  <RButton
                    variant="secondary"
                    fullWidth
                    className="px-2 text-sm"
                    disabled={done.includes(index) || seconds === 0}
                    onClick={() => decide(index, false)}
                  >
                    Dejar pasar
                  </RButton>
                </div>
                {done.includes(index) && (
                  <p className="text-xs text-tinta-suave">Decisión registrada</p>
                )}
              </RCard>
            ))}
          </div>
          <p role="status" className="rounded-control bg-crema p-3 text-sm">
            {feedback || 'Hay un producto trampa en cada ronda. Investiga antes de decidir.'}
          </p>
          <RButton variant="secondary" disabled={done.length === 0} onClick={next}>
            Terminar ronda
          </RButton>
        </>
      ) : (
        <RCard padding="lg">
          <h2 className="text-2xl">Cierre del mercado</h2>
          <p className="mt-2">
            Acertaste {stats.correct} de {stats.total} decisiones.
          </p>
          <p className="mt-2 font-display text-2xl">
            Margen total: {stats.profit < 0 ? '−' : ''}ⵊ{Math.abs(stats.profit)}
          </p>
          <p className="mt-2 text-tinta-suave">
            Investigar antes de comprar te ayuda a detectar sobreprecios y ofertas engañosas.
          </p>
          <p role="status" className="mt-3 text-ahorro-700">
            {result.isPending ? 'Guardando resultado…' : result.data?.message}
          </p>
          {result.isError && (
            <div role="alert" className="mt-2 text-deuda-700">
              <p>{result.error.message}</p>
              <RButton
                variant="secondary"
                onClick={() =>
                  result.mutate({
                    game_id: 'mercado_rapido',
                    data: {
                      profit: stats.profit,
                      accuracy_pct: Math.round((stats.correct / Math.max(1, stats.total)) * 100),
                      investigated_before_buying_pct: Math.round(
                        (stats.investigatedBuys / Math.max(1, stats.buys)) * 100,
                      ),
                    },
                  })
                }
              >
                Reintentar guardar
              </RButton>
            </div>
          )}
          <RButton className="mt-4" onClick={replay}>
            Jugar otra vez
          </RButton>
        </RCard>
      )}
    </div>
  )
}
export function MercadoRapidoGame() {
  useDocumentTitle('Mercado Rápido')
  const [run, setRun] = useState(0)
  return <MarketRun key={run} replay={() => setRun((value) => value + 1)} />
}
