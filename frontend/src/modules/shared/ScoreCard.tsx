import type { ReactNode } from 'react'
import { cn } from '@/core/utils/cn'
import { LEAGUE_ORDER, LEAGUES } from '@/core/utils/vitals'
import { RCard } from '@/design-system/RCard'
import type { League } from '@/types/economy'

/**
 * Tramos de la escalera: los rangos salen de LEAGUES. Mismos tonos que los escalones de la portada:
 * cada liga es más alta y más oscura, como subir de Chaski al Apu.
 */
const LADDER_TONE: Record<League, string> = {
  chaski: 'bg-crema-300',
  qollqa: 'bg-morado/35',
  amauta: 'bg-cerro',
  apu: 'bg-tinta',
}

/** Ancho de cada tramo, proporcional a los puntos que abarca (Chaski 300, Qollqa 250…). */
const ladderSpan = (id: League) => LEAGUES[id].max - Math.max(0, LEAGUES[id].min - 1)

/** Score financiero sobre la escalera de ligas: se ve cuánto falta para subir. */
export function ScoreCard({ score, children }: { score: number; children?: ReactNode }) {
  const clamped = Math.min(1000, Math.max(0, score))

  return (
    <RCard padding="lg">
      {/* flex-wrap + nowrap: en 320px "642 / 1000" se partía en dos líneas. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="text-lg">Score financiero</h2>
        <p className="whitespace-nowrap font-display text-3xl font-semibold tabular-nums">
          {clamped}
          <span className="text-base font-medium text-tinta-suave"> / 1000</span>
        </p>
      </div>

      <div role="img" aria-label={`Tu score es ${clamped} de 1000.`} className="relative mt-5">
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
          {LEAGUE_ORDER.map((id) => (
            <span
              key={id}
              className={cn('h-full', LADDER_TONE[id])}
              style={{ flexGrow: ladderSpan(id) }}
            />
          ))}
        </div>
        {/* El Inti marca dónde estás. */}
        <span
          aria-hidden
          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-superficie bg-dorado shadow-card"
          style={{ left: `${clamped / 10}%` }}
        />
      </div>
      <div aria-hidden className="mt-2 flex text-[11px] font-semibold text-tinta-suave">
        {LEAGUE_ORDER.map((id) => (
          <span key={id} style={{ flexGrow: ladderSpan(id), flexBasis: 0 }}>
            {LEAGUES[id].name}
          </span>
        ))}
      </div>

      {/* La liga la calcula el backend con el score sostenido, no con el de hoy: aquí no se promete un número. */}
      <p className="mt-4 text-sm text-tinta-suave">
        Tu liga sube cuando mantienes un buen score varios días: ahorra con constancia y paga a
        tiempo.
      </p>
      {children}
    </RCard>
  )
}
