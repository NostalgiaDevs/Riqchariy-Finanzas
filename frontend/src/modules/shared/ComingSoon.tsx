import { Check } from 'lucide-react'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { HorizonEdge } from '@/design-system/AndeanDawn'
import { RBadge } from '@/design-system/RBadge'

/**
 * Placeholder de las pantallas que llegan en sprints posteriores.
 * El ícono de la sección espera en el cielo de antes del amanecer: esta pantalla todavía no "despierta".
 * La lista de lo que traerá la pantalla le da contenido real y, en pantallas anchas, ocupa la otra columna.
 */
export function ComingSoon({
  title,
  icon,
  text,
  sprint,
  features = [],
}: {
  title: string
  icon: string
  text: string
  sprint: number
  /** Qué podrá hacer el alumno aquí (sale de SPRINTS-PILOTO). */
  features?: string[]
}) {
  useDocumentTitle(title)
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[1.75rem] lg:text-4xl">{title}</h1>
      <div className="grid gap-4 md:grid-cols-2 md:items-stretch md:gap-6">
        <section className="flex flex-col overflow-hidden rounded-sheet bg-superficie shadow-card">
          <div className="flex justify-center bg-noche-alta pb-1 pt-7">
            <span
              aria-hidden
              className="grid size-16 place-items-center rounded-full bg-white/10 text-4xl ring-1 ring-inset ring-white/15"
            >
              {icon}
            </span>
          </div>
          {/* Fuera del bloque oscuro: así su borde inferior se funde con el blanco y no deja una línea. */}
          <HorizonEdge
            inti={false}
            animated={false}
            ground="var(--color-superficie)"
            className="-mt-px"
          />
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-7 pt-3 text-center">
            <p className="max-w-xs text-tinta-suave">{text}</p>
            <RBadge tone="fucsia">Llega en el Sprint {sprint}</RBadge>
          </div>
        </section>

        {features.length > 0 ? (
          <section
            aria-labelledby="coming-features"
            className="rounded-sheet border-2 border-dashed border-crema-300 p-6"
          >
            <h2 id="coming-features" className="text-lg">
              Lo que vas a poder hacer aquí
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-ahorro-50 text-ahorro-700">
                    <Check aria-hidden className="size-4" strokeWidth={2.5} />
                  </span>
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  )
}
