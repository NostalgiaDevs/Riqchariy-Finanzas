import { GAMES } from '../content'

export function GamesSection() {
  return (
    <section
      id="juegos"
      aria-labelledby="juegos-title"
      className="scroll-mt-16 bg-superficie py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-gutter sm:px-6 lg:grid-cols-[1fr_1.45fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="juegos-title" className="text-3xl sm:text-4xl">
            Cinco minijuegos que mueven tu economía
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-tinta-suave">
            No son juegos aparte. Lo que haces en cada uno cambia tu sueldo, tu score o los eventos
            que te llegan en Pacha.
          </p>
          <figure className="mt-8 flex items-end gap-3">
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center rounded-full bg-dorado-50 text-2xl"
            >
              🦊
            </span>
            <blockquote className="rounded-2xl rounded-bl-sm bg-crema px-4 py-3 leading-relaxed">
              Si atiendes rápido en El Kiosco, tu sueldo de esa semana sube. Si se te van los
              clientes, baja.
            </blockquote>
            <figcaption className="sr-only">Qori, tu guía en Pacha</figcaption>
          </figure>
        </div>

        <ul className="divide-y divide-crema-200 border-y border-crema-200">
          {GAMES.map((game) => (
            <li key={game.name} className="flex gap-4 py-6 sm:gap-5">
              <span
                aria-hidden
                className="grid size-14 shrink-0 place-items-center rounded-2xl bg-crema text-3xl"
              >
                {game.icon}
              </span>
              <div>
                <h3 className="text-xl">{game.name}</h3>
                <p className="mt-1 leading-relaxed text-tinta-suave">{game.does}</p>
                <p className="mt-2 text-sm text-tinta-suave">
                  <span className="font-semibold text-tinta">Aprendes:</span> {game.learns}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
