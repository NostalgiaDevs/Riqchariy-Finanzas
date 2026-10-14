import { Check } from 'lucide-react'

const RULES = [
  'Solo habla de finanzas y del juego.',
  'No te juzga: te muestra qué pasaría con cada opción.',
  'Nunca da consejos de inversión reales.',
]

export function QoriSection() {
  return (
    <section
      id="qori"
      aria-labelledby="qori-title"
      className="scroll-mt-16 bg-crema py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-gutter sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div className="lg:order-2">
          <h2 id="qori-title" className="text-3xl sm:text-4xl">
            Qori te explica tu plata con tus números
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-tinta-suave">
            Qori es un zorro andino que ve tu situación en el juego: tu billetera, tus deudas y lo
            que decidiste ayer. Le preguntas lo que no entiendes y te responde en dos líneas.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-ahorro-50 text-ahorro-700">
                  <Check aria-hidden className="size-4" strokeWidth={2.5} />
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <figure className="mx-auto w-full max-w-md lg:order-1">
          <div className="rounded-sheet bg-superficie p-5 shadow-raised sm:p-6">
            <div className="flex items-center gap-3 border-b border-crema-200 pb-4">
              <span
                aria-hidden
                className="grid size-11 place-items-center rounded-full bg-dorado-50 text-2xl"
              >
                🦊
              </span>
              <div>
                <p className="font-display text-lg font-semibold leading-tight">Qori</p>
                <p className="text-sm text-tinta-suave">Tu guía en Pacha</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-5">
              <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-fucsia px-4 py-2.5 text-white">
                ¿Me conviene pagar mi deuda o ahorrar?
              </p>
              <p className="max-w-[90%] rounded-2xl rounded-bl-sm bg-crema px-4 py-2.5 leading-relaxed">
                Tu préstamo del banco te cobra 5% al mes y tu frasco de ahorro gana 4%. Si pagas
                primero la deuda, te quedas con más intis.
              </p>
              <div aria-hidden className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-full border-2 border-crema-300 px-3 py-1 text-sm font-medium">
                  ¿Cómo funciona el interés?
                </span>
                <span className="rounded-full border-2 border-crema-300 px-3 py-1 text-sm font-medium">
                  Volver al juego
                </span>
              </div>
            </div>
          </div>
          <figcaption className="mt-3 text-center text-sm text-tinta-suave">
            Una conversación de ejemplo con Qori.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
