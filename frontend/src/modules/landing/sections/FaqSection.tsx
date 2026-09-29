import { Mail, Plus } from 'lucide-react'
import { buttonClasses } from '@/design-system/buttonStyles'
import { CONTACT_EMAIL, FAQS } from '../content'

export function FaqSection() {
  return (
    <section
      id="preguntas"
      aria-labelledby="preguntas-title"
      className="scroll-mt-16 bg-crema py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-gutter sm:px-6 lg:grid-cols-[1fr_1.45fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="preguntas-title" className="text-3xl sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-tinta-suave">
            Lo que más nos preguntan alumnos, familias y docentes.
          </p>
          <div className="mt-8 rounded-card bg-superficie p-5 shadow-card">
            <p className="font-display text-lg font-semibold">¿No encuentras tu pregunta?</p>
            <p className="mt-1 text-sm leading-relaxed text-tinta-suave">
              Escríbenos y te respondemos por correo.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Tengo una pregunta sobre Riqchariy')}`}
              className={buttonClasses({ variant: 'secondary', className: 'mt-4' })}
            >
              <Mail aria-hidden className="size-5" />
              Hacer una pregunta
            </a>
          </div>
        </div>

        <div className="divide-y divide-crema-300 border-y border-crema-300">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group">
              <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {faq.q}
                <Plus
                  aria-hidden
                  className="size-5 shrink-0 text-fucsia-700 transition-transform duration-200 group-open:rotate-45"
                />
              </summary>
              <p className="max-w-prose pb-6 leading-relaxed text-tinta-suave">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
