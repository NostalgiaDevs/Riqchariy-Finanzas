import type { ComponentType, SVGProps } from 'react'
import { Coins, PiggyBank, Receipt, Scale } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { IntiAmount, type IntiTone } from '@/design-system/money/IntiAmount'
import { WEEK, type WeekEntry } from '../content'

const KIND: Record<
  WeekEntry['kind'],
  { icon: ComponentType<SVGProps<SVGSVGElement>>; iconClass: string; tone: IntiTone; label: string }
> = {
  ingreso: {
    icon: Coins,
    iconClass: 'bg-ahorro-50 text-ahorro-700',
    tone: 'ahorro',
    label: 'Ingreso',
  },
  gasto: { icon: Receipt, iconClass: 'bg-deuda-50 text-deuda-700', tone: 'deuda', label: 'Gasto' },
  decision: {
    icon: Scale,
    iconClass: 'bg-fucsia-50 text-fucsia-700',
    tone: 'neutral',
    label: 'Decisión',
  },
  ahorro: {
    icon: PiggyBank,
    iconClass: 'bg-dorado-50 text-dorado-700',
    tone: 'dorado',
    label: 'Ahorro',
  },
}

/** Resumen de la semana de ejemplo. Se calcula de WEEK para que nunca contradiga el detalle. */
function WeekTotals() {
  const sumOf = (kind: WeekEntry['kind']) =>
    WEEK.filter((entry) => entry.kind === kind).reduce((sum, entry) => sum + entry.change, 0)
  const totals = [
    { label: 'Cobraste', value: sumOf('ingreso'), tone: 'ahorro' as const, signed: true },
    { label: 'Gastaste', value: sumOf('gasto'), tone: 'deuda' as const, signed: true },
    {
      label: 'Guardaste para tu meta',
      value: -sumOf('ahorro'),
      tone: 'dorado' as const,
      signed: false,
    },
    {
      label: 'Te queda en la billetera',
      value: WEEK.at(-1)?.balance ?? 0,
      tone: 'neutral' as const,
      signed: false,
    },
  ]

  return (
    <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-crema-200 shadow-card">
      {totals.map(({ label, value, tone, signed }) => (
        <div key={label} className="bg-superficie px-4 py-3.5">
          <dt className="text-sm text-tinta-suave">{label}</dt>
          <dd className="mt-0.5 font-display text-2xl">
            <IntiAmount value={value} tone={tone} signed={signed} animated={false} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function WeekSection() {
  return (
    <section
      id="como-se-juega"
      aria-labelledby="semana-title"
      className="scroll-mt-16 bg-crema py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-gutter sm:px-6 lg:grid-cols-[1fr_1.45fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="semana-title" className="text-3xl sm:text-4xl">
            Una semana en Pacha
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-tinta-suave">
            Pacha es la economía del juego. Tu sueldo alcanza para lo fijo y te sobra entre 15 y
            20%. Alcanza, pero no para todo.
          </p>
          <p className="mt-4 leading-relaxed text-tinta-suave">
            Cada vez que entras avanzas hasta cuatro días. En cualquiera de ellos puede aparecer una
            emergencia, una tentación o una oportunidad, y tú decides qué hacer.
          </p>
          <WeekTotals />
        </div>

        <div className="overflow-hidden rounded-sheet bg-superficie shadow-card">
          <div className="flex items-baseline justify-between gap-4 border-b border-crema-200 bg-crema/60 px-5 py-4 sm:px-6">
            <p className="font-display text-lg font-semibold">Estado de cuenta</p>
            <p className="text-sm text-tinta-suave">valeria_14, semana 1</p>
          </div>

          <ol className="divide-y divide-crema-200">
            {WEEK.map((entry) => {
              const kind = KIND[entry.kind]
              const Icon = kind.icon
              return (
                <li
                  key={entry.day}
                  className="grid grid-cols-[3rem_1fr] gap-x-4 gap-y-3 px-5 py-5 sm:grid-cols-[3.5rem_1fr_7.5rem] sm:px-6"
                >
                  <p className="flex flex-col leading-none">
                    <span className="text-xs text-tinta-suave">Día</span>
                    <span className="font-display text-3xl font-semibold tabular-nums">
                      {entry.day}
                    </span>
                  </p>

                  <div>
                    <h3 className="flex items-start gap-2 font-sans text-base font-semibold leading-snug">
                      <span
                        className={cn(
                          'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full',
                          kind.iconClass,
                        )}
                      >
                        <Icon aria-hidden className="size-3.5" />
                        <span className="sr-only">{kind.label}:</span>
                      </span>
                      {entry.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-tinta-suave">{entry.detail}</p>
                  </div>

                  <div className="col-start-2 flex items-baseline justify-between gap-3 sm:col-start-auto sm:flex-col sm:items-end sm:justify-start sm:gap-1">
                    {entry.change === 0 ? (
                      <span className="text-sm font-medium text-tinta-suave">Sin gasto</span>
                    ) : entry.kind === 'ahorro' ? (
                      // Ahorrar saca plata de la billetera, pero no es una pérdida: va a tu frasco.
                      <span className="text-sm font-medium text-dorado-700">
                        <IntiAmount
                          value={-entry.change}
                          tone="dorado"
                          animated={false}
                          className="text-lg"
                        />{' '}
                        a tu meta
                      </span>
                    ) : (
                      <IntiAmount
                        value={entry.change}
                        signed
                        tone={kind.tone}
                        animated={false}
                        className="text-lg"
                      />
                    )}
                    <span className="text-sm text-tinta-suave">
                      Billetera <IntiAmount value={entry.balance} tone="neutral" animated={false} />
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
