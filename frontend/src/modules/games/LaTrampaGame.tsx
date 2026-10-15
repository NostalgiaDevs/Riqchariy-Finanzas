import { useEffect, useReducer, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gamesApi } from '@/core/api/endpoints'
import { queryKeys } from '@/core/api/queryKeys'
import { RButton } from '@/design-system/RButton'
import { RCard } from '@/design-system/RCard'
import { CASES, initialTrap, trapReducer } from './la-trampa.reducer'

export function LaTrampaGame() {
  const [round, setRound] = useState(0)
  return <LaTrampaRound key={round} onReplay={() => setRound((value) => value + 1)} />
}

function LaTrampaRound({ onReplay }: { onReplay: () => void }) {
  const [game, dispatch] = useReducer(trapReducer, initialTrap)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const submitted = useRef(false)
  const caseCard = useRef<HTMLDivElement>(null)
  const client = useQueryClient()
  useEffect(() => {
    if (game.index === 0) return
    if (game.index === CASES.length) window.scrollTo({ top: 0, behavior: 'instant' })
    else caseCard.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [game.index])
  const submit = useMutation({
    mutationFn: gamesApi.submitResult,
    onSuccess: (response) => {
      setMessage(response.message)
      client.invalidateQueries({ queryKey: queryKeys.playerState })
    },
    onError: (reason: Error) => setError(reason.message),
  })
  useEffect(() => {
    if (game.index !== CASES.length || submitted.current) return
    submitted.current = true
    submit.mutate({
      game_id: 'la_trampa',
      data: { score: game.correct * 200, correct_count: game.correct, total_cases: CASES.length },
    })
  }, [game, submit])
  const retry = () => {
    setError('')
    submit.mutate({
      game_id: 'la_trampa',
      data: { score: game.correct * 200, correct_count: game.correct, total_cases: CASES.length },
    })
  }
  const current = CASES[game.index]
  return (
    <div className="space-y-4 pb-6">
      <div className="rounded-sheet bg-noche-alta p-4 text-white sm:p-5">
        <p className="text-sm text-inti-claro">JUEGO 2 · LA TRAMPA</p>
        <h1 className="text-2xl sm:text-3xl">¿Oferta o trampa?</h1>
        <p className="mt-1 text-sm text-white/75 sm:mt-2 sm:text-base">
          Lee con calma. Busca costos ocultos, promesas imposibles y presión para actuar.
        </p>
      </div>
      {current ? (
        <>
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>
              Caso {game.index + 1} de {CASES.length}
            </span>
            <span>{game.correct} aciertos</span>
          </div>
          <div
            role="progressbar"
            aria-label="Progreso del juego"
            aria-valuenow={game.index}
            aria-valuemin={0}
            aria-valuemax={CASES.length}
            className="h-2 rounded-full bg-crema-200"
          >
            <div
              className="h-full rounded-full bg-fucsia"
              style={{ width: `${(game.index / CASES.length) * 100}%` }}
            />
          </div>
          <RCard ref={caseCard} padding="lg" className="min-h-44 scroll-mt-3">
            <p className="text-sm font-semibold text-fucsia-700">SITUACIÓN</p>
            <h2 className="mt-2 text-xl">{current.title}</h2>
            <p className="mt-3 text-lg leading-relaxed">{current.text}</p>
          </RCard>
          <div className="grid gap-2 sm:grid-cols-2">
            <RButton
              fullWidth
              disabled={game.answered}
              onClick={() => dispatch({ type: 'answer', trap: true })}
            >
              ⚠ Hay una trampa
            </RButton>
            <RButton
              fullWidth
              variant="secondary"
              disabled={game.answered}
              onClick={() => dispatch({ type: 'answer', trap: false })}
            >
              ✓ Parece seguro
            </RButton>
          </div>
          {game.answered && (
            <RCard
              padding="lg"
              className={game.lastCorrect ? 'border border-ahorro/30' : 'border border-deuda/30'}
            >
              <p role="status" className="font-semibold">
                {game.lastCorrect ? '¡Bien visto!' : 'Ojo, revisa la pista.'}
              </p>
              <p className="mt-1">{current.clue}</p>
              <RButton className="mt-4" onClick={() => dispatch({ type: 'next' })}>
                {game.index === CASES.length - 1 ? 'Ver resultado' : 'Siguiente caso'}
              </RButton>
            </RCard>
          )}
        </>
      ) : (
        <RCard padding="lg">
          <h2 className="text-2xl">¡Terminaste!</h2>
          <p className="mt-2 text-lg">
            Identificaste {game.correct} de {CASES.length} situaciones.
          </p>
          <p className="mt-2 text-tinta-suave">
            Antes de aceptar una oferta, compara el costo total y nunca compartas códigos de
            seguridad.
          </p>
          <p role="status" className="mt-4 font-semibold text-ahorro-700">
            {message || (submit.isPending ? 'Guardando resultado…' : '')}
          </p>
          {error && (
            <div role="alert" className="mt-3 rounded-control bg-deuda-50 p-3 text-deuda-700">
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
            Volver a jugar
          </RButton>
        </RCard>
      )}
    </div>
  )
}
