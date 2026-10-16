import { useRef, useState } from 'react'
import { RButton } from '@/design-system/RButton'
import { RCard } from '@/design-system/RCard'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { useGameResult } from './useGameResult'

type Question = {
  topic: string
  situation: string
  options: [string, string, string]
  correct: number
  why: string
}
const QUESTIONS: Question[] = [
  {
    topic: 'ahorro',
    situation: 'Cobras tu sueldo y quieres una bicicleta en dos meses. ¿Qué haces primero?',
    options: [
      'Separo una parte para la meta',
      'Gasto todo y espero al siguiente sueldo',
      'Pido un préstamo sin comparar',
    ],
    correct: 0,
    why: 'Separar dinero al cobrar vuelve la meta más alcanzable.',
  },
  {
    topic: 'cuotas',
    situation: 'Unos audífonos cuestan ⵊ90 o 3 cuotas de ⵊ33. ¿Qué comparas?',
    options: ['Solo la primera cuota', 'El total de ⵊ99 frente a ⵊ90', 'El color de la caja'],
    correct: 1,
    why: 'Tres cuotas suman ⵊ99: son ⵊ9 adicionales.',
  },
  {
    topic: 'emergencias',
    situation: 'Se rompe tu celular y guardaste un fondo de emergencia. ¿Para qué sirve?',
    options: [
      'Para una oferta cualquiera',
      'Para cubrir un imprevisto necesario',
      'Para comprar sin mirar precios',
    ],
    correct: 1,
    why: 'El fondo ayuda a resolver gastos imprevistos sin endeudarte.',
  },
  {
    topic: 'estafas',
    situation: 'Te prometen duplicar tus intis si envías tu clave. ¿Qué decides?',
    options: ['Envío la clave', 'Pregunto a un amigo si ganó', 'No comparto mi clave y rechazo'],
    correct: 2,
    why: 'Una promesa extraordinaria que pide claves es una señal de estafa.',
  },
  {
    topic: 'deudas',
    situation: 'Se acerca la fecha de pago de una cuota y tienes dinero justo. ¿Qué priorizas?',
    options: ['Reviso y pago la cuota a tiempo', 'Compro un gusto primero', 'Ignoro el aviso'],
    correct: 0,
    why: 'Pagar a tiempo evita cargos y protege tu presupuesto.',
  },
  {
    topic: 'compras',
    situation: 'Ves un cartel «solo hoy». No necesitas el producto. ¿Qué haces?',
    options: ['Compro sin pensar', 'Comparo precio y necesidad', 'Pido prestado para no perderlo'],
    correct: 1,
    why: 'La urgencia de una oferta no convierte una compra en necesaria.',
  },
  {
    topic: 'ingresos',
    situation: 'Recibes un ingreso extra en el Kiosco. ¿Cuál es un buen primer paso?',
    options: [
      'Repartirlo entre obligaciones y meta',
      'Gastarlo todo enseguida',
      'Dejar de revisar gastos',
    ],
    correct: 0,
    why: 'Planificar el ingreso extra te ayuda a sostener tus metas.',
  },
  {
    topic: 'inversion',
    situation: 'Un compañero dice que una inversión nunca pierde. ¿Qué preguntas?',
    options: [
      'Cuánto puedo poner sin investigar',
      'Qué riesgos tiene y cómo funciona',
      'Si puedo convencer a otros',
    ],
    correct: 1,
    why: 'Toda inversión tiene riesgos; hay que entenderlos antes de decidir.',
  },
  {
    topic: 'diversificacion',
    situation:
      'Tienes ⵊ100 para cuatro opciones con distinto riesgo. ¿Qué reduce una pérdida grande?',
    options: [
      'Poner todo en una sola opción',
      'Repartir entre opciones distintas',
      'Elegir la que promete más',
    ],
    correct: 1,
    why: 'Diversificar evita depender de un solo resultado.',
  },
  {
    topic: 'presupuesto',
    situation: 'Después de pagar comida y pasajes te quedan ⵊ20. ¿Qué haces?',
    options: [
      'Reviso mi meta antes de comprar',
      'Compro algo de ⵊ30',
      'Ignoro los próximos gastos',
    ],
    correct: 0,
    why: 'Conocer lo que queda permite decidir sin comprometer gastos necesarios.',
  },
]

function QuizRound({ onReplay }: { onReplay: () => void }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [misses, setMisses] = useState<Record<string, number>>({})
  const advancing = useRef(false)
  const result = useGameResult()
  const question = QUESTIONS[index]
  const score = correct * 10
  const weakest = Object.entries(misses).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'ninguno'
  const payload = {
    game_id: 'qori_quiz' as const,
    data: { score, correct_count: correct, weakest_topic: weakest },
  }
  const choose = (option: number) => {
    if (selected !== null || !question) return
    setSelected(option)
    if (option === question.correct) setCorrect((value) => value + 1)
    else setMisses((items) => ({ ...items, [question.topic]: (items[question.topic] ?? 0) + 1 }))
  }
  const next = () => {
    if (advancing.current || selected === null) return
    advancing.current = true
    if (index === QUESTIONS.length - 1) {
      const finalCorrect = correct
      const finalWeakest = Object.entries(misses).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'ninguno'
      result.mutate({
        game_id: 'qori_quiz',
        data: {
          score: finalCorrect * 10,
          correct_count: finalCorrect,
          weakest_topic: finalWeakest,
        },
      })
    }
    setIndex((value) => value + 1)
    setSelected(null)
    window.setTimeout(() => {
      advancing.current = false
    }, 0)
  }
  return (
    <div className="space-y-4 pb-6">
      <header className="rounded-sheet bg-noche-alta p-5 text-white">
        <p className="text-sm text-inti-claro">JUEGO 5 · QORI QUIZ</p>
        <h1 className="text-3xl">Decide con cabeza</h1>
        <p className="mt-1 text-white/75">
          Diez situaciones de tu vida en Pacha. Aprende con cada respuesta.
        </p>
      </header>
      {question ? (
        <>
          <div className="flex justify-between text-sm font-semibold">
            <span>
              Pregunta {index + 1} de {QUESTIONS.length}
            </span>
            <span>{correct} aciertos</span>
          </div>
          <div
            role="progressbar"
            aria-label="Progreso del quiz"
            aria-valuenow={index}
            aria-valuemin={0}
            aria-valuemax={QUESTIONS.length}
            className="h-2 rounded-full bg-crema-200"
          >
            <div className="h-2 rounded-full bg-fucsia" style={{ width: `${index * 10}%` }} />
          </div>
          <RCard padding="lg">
            <p className="text-sm font-semibold text-fucsia-700">SITUACIÓN</p>
            <h2 className="mt-2 text-xl">{question.situation}</h2>
          </RCard>
          <div className="space-y-2">
            {question.options.map((option, value) => (
              <button
                key={option}
                type="button"
                disabled={selected !== null}
                onClick={() => choose(value)}
                className={`min-h-touch w-full rounded-control border p-4 text-left font-semibold transition-colors ${selected === null ? 'border-crema-300 bg-white hover:border-fucsia' : value === question.correct ? 'border-ahorro bg-ahorro-50 text-ahorro-700' : value === selected ? 'border-deuda bg-deuda-50 text-deuda-700' : 'border-crema-200 bg-white opacity-70'}`}
              >
                {option}
              </button>
            ))}
          </div>
          {selected !== null && (
            <RCard padding="lg" className="border border-ahorro/30">
              <p role="status" className="font-semibold">
                {selected === question.correct
                  ? '✅ ¡Correcto!'
                  : '❌ Casi. La mejor opción está marcada en verde.'}
              </p>
              <p className="mt-1">{question.why}</p>
              <RButton className="mt-4" onClick={next}>
                {index === QUESTIONS.length - 1 ? 'Ver resultado' : 'Siguiente pregunta'}
              </RButton>
            </RCard>
          )}
        </>
      ) : (
        <RCard padding="lg">
          <h2 className="text-2xl">¡Terminaste!</h2>
          <p className="mt-2 text-lg">
            Acertaste {correct} de 10 · {score} de 100 puntos.
          </p>
          <p className="mt-2 text-tinta-suave">
            La mejor decisión empieza por comparar y preguntar.
          </p>
          <p role="status" className="mt-3 text-ahorro-700">
            {result.isPending ? 'Guardando resultado…' : result.data?.message}
          </p>
          {result.isError && (
            <div role="alert" className="mt-3 text-deuda-700">
              <p>{result.error.message}</p>
              <RButton variant="secondary" className="mt-2" onClick={() => result.mutate(payload)}>
                Reintentar guardar
              </RButton>
            </div>
          )}
          <RButton className="mt-4" onClick={onReplay}>
            Volver a jugar
          </RButton>
        </RCard>
      )}
    </div>
  )
}
export function QoriQuizGame() {
  useDocumentTitle('Qori Quiz')
  const [run, setRun] = useState(0)
  return <QuizRound key={run} onReplay={() => setRun((value) => value + 1)} />
}
