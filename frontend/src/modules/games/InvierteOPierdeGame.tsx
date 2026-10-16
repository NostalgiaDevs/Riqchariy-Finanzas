import { useEffect, useReducer, useRef, useState } from 'react'
import { RButton } from '@/design-system/RButton'
import { RCard } from '@/design-system/RCard'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import {
  BUCKETS,
  INITIAL_CAPITAL,
  ROUND_FACTORS,
  resolveInvestment,
  singleBucketReturn,
  validAllocation,
} from './investment.logic'
import { initialInvestment, investmentReducer, type InvestmentPoint } from './investment.reducer'
import { useGameResult } from './useGameResult'

const ROUND_NOTES = [
  'Comienza el mercado',
  'Hay altibajos',
  'Crisis: el riesgo alto cae fuerte',
  'El mercado se recupera',
  'Tu primo promete mucho, pero desaparece la mitad',
  'Última ronda: compara tu resultado',
]
function sound(gain: boolean) {
  try {
    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const volume = context.createGain()
    oscillator.frequency.value = gain ? 660 : 260
    volume.gain.value = 0.025
    oscillator.connect(volume)
    volume.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.12)
    oscillator.onended = () => void context.close()
  } catch {
    /* audio is optional */
  }
}
function Trend({ history }: { history: InvestmentPoint[] }) {
  const values = [INITIAL_CAPITAL, ...history.map((item) => item.total)]
  const colors = ['#1F7A51', '#1B7A74', '#A93A25', '#7B3FA0']
  const baselines = BUCKETS.map(({ id }) => [
    INITIAL_CAPITAL,
    ...history.map((_, index) =>
      singleBucketReturn(
        id,
        history.slice(0, index + 1).map((point) => point.factors),
      ),
    ),
  ])
  const max = Math.max(120, ...values, ...baselines.flat())
  const points = (series: number[]) =>
    series.map((value, index) => `${index * 50 + 8},${112 - (value / max) * 95}`).join(' ')
  return (
    <div>
      <svg
        role="img"
        aria-label="Evolución de tu portafolio frente a cada opción individual"
        viewBox="0 0 320 120"
        className="w-full rounded-control bg-crema"
      >
        {baselines.map((series, index) => (
          <polyline
            key={BUCKETS[index]?.id ?? index}
            points={points(series)}
            fill="none"
            stroke={colors[index]}
            strokeWidth="1.8"
            strokeDasharray="4 3"
          />
        ))}
        <polyline
          points={points(values)}
          fill="none"
          stroke="#D62E6C"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((value, index) => (
          <circle
            key={index}
            cx={index * 50 + 8}
            cy={112 - (value / max) * 95}
            r="3"
            fill="#D62E6C"
          />
        ))}
      </svg>
      <p className="mt-1 text-xs text-tinta-suave">
        Tu capital: {values.map((value) => `ⵊ${value}`).join(' → ')}
      </p>
      <p className="mt-1 text-xs text-tinta-suave">
        Línea fucsia: tu portafolio · Líneas punteadas: cada opción por separado.
      </p>
    </div>
  )
}
function InvestmentRun({ replay }: { replay: () => void }) {
  const [game, dispatch] = useReducer(investmentReducer, initialInvestment)
  const { round, capital, allocation, history, reveal, scam } = game
  const resolving = useRef(false)
  const advancing = useRef(false)
  const result = useGameResult()
  const assigned = Object.values(allocation).reduce((a, b) => a + b, 0)
  const hasDistribution = validAllocation(allocation, capital)
  useEffect(() => {
    advancing.current = false
  }, [round])
  const diversify = history.filter(
    (point) => Object.values(point.buckets).filter((value) => value > 0).length >= 2,
  ).length
  const finish = () => {
    const data = {
      final_value: capital,
      diversification_score: Math.round((diversify / 6) * 100),
      fell_for_scam: scam,
    }
    result.mutate({ game_id: 'invierte_o_pierde', data })
  }
  const playRound = () => {
    if (!hasDistribution || resolving.current) return
    resolving.current = true
    const rolls = {
      conservador: Math.random(),
      balanceado: Math.random(),
      arriesgado: Math.random(),
      primo: Math.random(),
    }
    const next = resolveInvestment(allocation, round, capital, rolls)
    dispatch({ type: 'resolve', rolls })
    sound(next.total >= capital)
  }
  return (
    <div className="space-y-4 pb-6">
      <header className="rounded-sheet bg-noche-alta p-5 text-white">
        <p className="text-sm text-inti-claro">JUEGO 3 · INVIERTE O PIERDE</p>
        <h1 className="text-3xl">Reparte el riesgo</h1>
        <p className="mt-1 text-white/75">
          Empiezas con ⵊ100. Reparte todo tu capital cada ronda y observa qué sucede.
        </p>
      </header>
      {round < ROUND_FACTORS.length ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
            <span>Ronda {round + 1} de 6</span>
            <span>Capital: ⵊ{reveal?.total ?? capital}</span>
          </div>
          <RCard padding="lg">
            <h2 className="text-xl">{ROUND_NOTES[round]}</h2>
            <p className="mt-1 text-sm text-tinta-suave">
              El resultado de cada frasco cambia de ronda en ronda. El primo promete rendimientos
              altos, pero no es confiable.
            </p>
          </RCard>
          {!reveal ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {BUCKETS.map((bucket) => (
                  <label
                    key={bucket.id}
                    className="rounded-card border border-crema-300 bg-white p-4"
                  >
                    <span className="block font-semibold">
                      {bucket.icon} {bucket.label}
                    </span>
                    <span className="mt-1 block text-xs text-tinta-suave">Intis que asignas</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max={capital}
                      step="1"
                      value={allocation[bucket.id]}
                      onChange={(event) =>
                        dispatch({
                          type: 'allocate',
                          bucket: bucket.id,
                          amount: event.target.value === '' ? 0 : Number(event.target.value),
                        })
                      }
                      className="mt-2 min-h-touch w-full rounded-control border border-crema-300 px-3 text-lg"
                    />
                  </label>
                ))}
              </div>
              <p role="status" className={hasDistribution ? 'text-ahorro-700' : 'text-deuda-700'}>
                Asignaste ⵊ{assigned} de ⵊ{capital}.{' '}
                {hasDistribution
                  ? 'Listo para invertir.'
                  : 'Reparte exactamente todo tu capital en números enteros.'}
              </p>
              <RButton disabled={!hasDistribution} onClick={playRound}>
                Ver resultado de la ronda
              </RButton>
            </>
          ) : (
            <RCard padding="lg" className="border border-fucsia/20">
              <h2 className="text-xl">Resultado de la ronda</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {BUCKETS.map(({ id, icon, label }) => (
                  <p key={id} className="rounded-control bg-crema p-3">
                    {icon} {label}: <strong>ⵊ{reveal.buckets[id]}</strong>
                  </p>
                ))}
              </div>
              <p className="mt-3 font-semibold">Capital total: ⵊ{reveal.total}</p>
              {round === 2 && (
                <p className="mt-2 text-deuda-700">
                  ⚠ Crisis: el frasco arriesgado perdió mucho; el conservador se mantuvo.
                </p>
              )}
              {round === 4 && allocation.primo > 0 && (
                <p className="mt-2 text-deuda-700">
                  💨 La mitad del dinero puesto en el negocio del primo desapareció. Una promesa de
                  ganancia no garantiza seguridad.
                </p>
              )}
              <RButton
                className="mt-4"
                onClick={() => {
                  if (advancing.current) return
                  advancing.current = true
                  if (round === 5) finish()
                  dispatch({ type: 'next' })
                  resolving.current = false
                }}
              >
                {round === 5 ? 'Ver resultado final' : 'Continuar'}
              </RButton>
            </RCard>
          )}
          <Trend history={history} />
        </>
      ) : (
        <RCard padding="lg">
          <h2 className="text-2xl">Así terminó tu portafolio</h2>
          <p className="mt-2 text-lg">
            De ⵊ100 a <strong>ⵊ{capital}</strong>.
          </p>
          <p className="mt-2 text-tinta-suave">
            Diversificaste en {diversify} de 6 rondas. Repartir el riesgo reduce la dependencia de
            una sola opción.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {BUCKETS.map(({ id, icon, label }) => (
              <p key={id} className="rounded-control bg-crema p-3">
                {icon} Solo {label}: ⵊ
                {singleBucketReturn(
                  id,
                  history.map((point) => point.factors),
                )}
              </p>
            ))}
          </div>
          <div className="mt-4">
            <Trend history={history} />
          </div>
          <p role="status" className="mt-3 text-ahorro-700">
            {result.isPending ? 'Guardando resultado…' : result.data?.message}
          </p>
          {result.isError && (
            <div role="alert" className="mt-2 text-deuda-700">
              <p>{result.error.message}</p>
              <RButton
                variant="secondary"
                className="mt-2"
                onClick={() =>
                  result.mutate({
                    game_id: 'invierte_o_pierde',
                    data: {
                      final_value: capital,
                      diversification_score: Math.round((diversify / 6) * 100),
                      fell_for_scam: scam,
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
export function InvierteOPierdeGame() {
  useDocumentTitle('Invierte o Pierde')
  const [run, setRun] = useState(0)
  return <InvestmentRun key={run} replay={() => setRun((value) => value + 1)} />
}
