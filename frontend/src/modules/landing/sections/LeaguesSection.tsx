import { cn } from '@/core/utils/cn'
import { LEAGUE_STEPS, SCORE_PARTS } from '../content'

// Cada liga es un escalón más alto y más oscuro: la subida de Chaski al Apu,
// con los mismos tonos de los cerros de la portada.
const STEP_STYLES = [
  'bg-crema-200 text-tinta sm:min-h-[15rem]',
  'bg-morado-50 text-tinta sm:min-h-[18rem]',
  'bg-[#3b2c63] text-white sm:min-h-[21rem]',
  'bg-tinta text-white sm:min-h-[24rem]',
]

const MUTED = ['text-tinta-suave', 'text-tinta-suave', 'text-white/75', 'text-white/75']

export function LeaguesSection() {
  return (
    <section
      id="ligas"
      aria-labelledby="ligas-title"
      className="scroll-mt-16 bg-superficie py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-gutter sm:px-6">
        <div className="max-w-2xl">
          <h2 id="ligas-title" className="text-3xl sm:text-4xl">
            Cuatro ligas, de Chaski a Apu
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-tinta-suave">
            Tu score financiero va de 0 a 1000. No sube por tener más plata: sube por cómo la
            manejas. Según tu score, compites en una de estas ligas con tu aula.
          </p>
        </div>

        <ol className="mt-12 grid gap-3 sm:grid-cols-4 sm:items-end">
          {LEAGUE_STEPS.map((league, index) => (
            <li
              key={league.id}
              className={cn(
                'flex flex-col rounded-2xl px-5 pb-6 pt-6 sm:rounded-b-md',
                STEP_STYLES[index],
              )}
            >
              <span aria-hidden className="text-3xl">
                {league.icon}
              </span>
              <h3 className="mt-2 text-2xl">{league.name}</h3>
              <p className={cn('text-sm font-semibold tabular-nums', index >= 2 && 'text-dorado')}>
                {league.range} puntos
              </p>
              <p className={cn('mt-4 text-sm leading-relaxed', MUTED[index])}>{league.origin}</p>
              <p className="mt-1 text-sm font-medium leading-relaxed">{league.meaning}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.45fr] lg:gap-16">
          <div>
            <h3 className="text-2xl">Qué mide tu score</h3>
            <p className="mt-3 leading-relaxed text-tinta-suave">
              Cinco hábitos, cada uno con su peso. Por eso el que más gasta no es el que gana: gana
              el que decide mejor.
            </p>
          </div>

          <div>
            <div
              role="img"
              aria-label="Composición del score: ahorro constante 250 puntos, manejo de deudas 250, aguantar crisis 200, decidir con información 150 y darte gustos sin romper tus metas 100."
              className="flex h-5 gap-1 overflow-hidden rounded-full"
            >
              {SCORE_PARTS.map((part) => (
                <span
                  key={part.label}
                  className={cn('h-full', part.color)}
                  style={{ flexGrow: part.points }}
                />
              ))}
            </div>
            <ul className="mt-5 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {SCORE_PARTS.map((part) => (
                <li key={part.label} className="flex items-center gap-2.5">
                  <span aria-hidden className={cn('size-3 shrink-0 rounded-full', part.color)} />
                  <span>{part.label}</span>
                  <span className="ml-auto font-semibold tabular-nums">{part.points}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
