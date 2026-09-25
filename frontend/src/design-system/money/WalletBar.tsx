import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Flame, PiggyBank, TriangleAlert, Wallet } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { formatPercent } from '@/core/utils/format'
import { stressLevel, type StressLevel, type Vitals } from '@/core/utils/vitals'
import { Skeleton } from '../Skeleton'
import { IntiAmount } from './IntiAmount'

/** Identificadores que usa IntiFly para volar monedas hacia cada sección. */
export type VitalKey = 'wallet' | 'savings' | 'debt' | 'stress'

const STRESS: Record<StressLevel, { label: string; bar: string; text: string }> = {
  ok: { label: 'Tranquilo', bar: 'bg-turquesa', text: 'text-turquesa-700' },
  alto: { label: 'Alto', bar: 'bg-dorado', text: 'text-dorado-700' },
  critico: { label: 'Muy alto', bar: 'bg-deuda', text: 'text-deuda-700' },
}

interface VitalProps {
  vital: VitalKey
  label: ReactNode
  icon: ReactNode
  children: ReactNode
  className?: string
}

function Vital({ vital, label, icon, children, className }: VitalProps) {
  return (
    <div
      data-vital={vital}
      className={cn(
        'flex min-w-0 flex-col items-center gap-0.5 rounded-control px-1 py-1.5',
        className,
      )}
    >
      <dt className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-tinta-suave">
        {icon}
        {label}
      </dt>
      <dd className="w-full text-center font-display text-base leading-tight">{children}</dd>
    </div>
  )
}

export interface WalletBarProps {
  /** null mientras carga el estado del alumno. */
  vitals: Vitals | null
  className?: string
}

/** La VitalBar: billetera · ahorros · deuda · estrés. Siempre visible arriba en GameLayout. */
export function WalletBar({ vitals, className }: WalletBarProps) {
  if (!vitals) {
    return (
      <div
        className={cn(
          'grid grid-cols-4 gap-1 rounded-card bg-superficie p-2 shadow-card',
          className,
        )}
        aria-busy="true"
        aria-label="Cargando tu estado financiero"
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 py-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-14" />
          </div>
        ))}
      </div>
    )
  }

  const level = stressLevel(vitals.stress)
  const stress = STRESS[level]
  const hasDebt = vitals.debt > 0

  return (
    <section aria-label="Tu estado financiero">
      <dl
        className={cn(
          'grid grid-cols-4 gap-1 rounded-card bg-superficie p-2 shadow-card',
          className,
        )}
      >
        <Vital vital="wallet" label="Billetera" icon={<Wallet aria-hidden className="size-3.5" />}>
          <IntiAmount value={vitals.wallet} tone="neutral" />
        </Vital>

        <Vital
          vital="savings"
          label="Ahorros"
          icon={<PiggyBank aria-hidden className="size-3.5" />}
        >
          <IntiAmount value={vitals.savings} tone="ahorro" />
        </Vital>

        <Vital
          vital="debt"
          label="Deuda"
          icon={hasDebt ? <TriangleAlert aria-hidden className="size-3.5 text-deuda-700" /> : null}
          className={hasDebt ? 'bg-deuda-50' : undefined}
        >
          <IntiAmount value={vitals.debt} tone={hasDebt ? 'deuda' : 'neutral'} />
          {hasDebt ? <span className="sr-only">Tienes deuda pendiente.</span> : null}
        </Vital>

        <Vital vital="stress" label="Estrés" icon={<Flame aria-hidden className="size-3.5" />}>
          <div
            role="meter"
            aria-label="Estrés"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(vitals.stress * 100)}
            aria-valuetext={`${formatPercent(vitals.stress)}, ${stress.label.toLowerCase()}`}
            className="flex flex-col items-center gap-1 pt-1"
          >
            <div className="h-2 w-full max-w-16 overflow-hidden rounded-full bg-crema-200">
              <motion.div
                className={cn('h-full rounded-full', stress.bar)}
                initial={false}
                animate={{ width: formatPercent(vitals.stress) }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span className={cn('text-xs font-semibold tabular-nums', stress.text)} aria-hidden>
              {formatPercent(vitals.stress)} · {stress.label}
            </span>
          </div>
        </Vital>
      </dl>
    </section>
  )
}
