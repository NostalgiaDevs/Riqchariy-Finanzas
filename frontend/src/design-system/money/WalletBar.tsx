import type { ReactNode } from 'react'
import { Flame, PiggyBank, TriangleAlert, Wallet } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { formatPercent } from '@/core/utils/format'
import { stressLevel, type StressLevel, type Vitals } from '@/core/utils/vitals'
import { Skeleton } from '../Skeleton'
import { IntiAmount } from './IntiAmount'

/** Identificadores que usa IntiFly para volar monedas hacia cada sección. */
export type VitalKey = 'wallet' | 'savings' | 'debt' | 'stress'

/**
 * light: tarjeta blanca sobre crema (portada, catálogo).
 * night: dentro de la cabecera nocturna de la app. La billetera brilla en dorado: es el Inti.
 */
export type WalletBarTone = 'light' | 'night'

const THEME = {
  light: {
    panel: 'bg-superficie shadow-card',
    divider: 'divide-crema-200',
    label: 'text-tinta-suave',
    wallet: 'text-tinta',
    walletIcon: '',
    savings: 'text-ahorro-700',
    savingsIcon: '',
    debt: 'text-deuda-700',
    debtCell: 'bg-deuda-50',
    track: 'bg-crema-200',
    skeleton: 'light',
  },
  night: {
    panel: 'bg-white/[0.07] ring-1 ring-inset ring-white/12',
    divider: 'divide-white/10',
    label: 'text-white/70',
    wallet: 'text-inti-claro',
    walletIcon: 'text-dorado',
    savings: 'text-ahorro-300',
    savingsIcon: 'text-ahorro-300',
    debt: 'text-deuda-300',
    debtCell: 'bg-deuda/20',
    track: 'bg-white/15',
    skeleton: 'night',
  },
} as const

const STRESS: Record<
  StressLevel,
  { label: string; bar: string; text: Record<WalletBarTone, string> }
> = {
  ok: {
    label: 'Tranquilo',
    bar: 'bg-turquesa',
    text: { light: 'text-turquesa-700', night: 'text-turquesa-300' },
  },
  alto: {
    label: 'Alto',
    bar: 'bg-dorado',
    text: { light: 'text-dorado-700', night: 'text-dorado' },
  },
  critico: {
    label: 'Muy alto',
    bar: 'bg-deuda',
    text: { light: 'text-deuda-700', night: 'text-deuda-300' },
  },
}

interface VitalProps {
  vital: VitalKey
  label: ReactNode
  icon: ReactNode
  labelClass: string
  children: ReactNode
  className?: string
}

function Vital({ vital, label, icon, labelClass, children, className }: VitalProps) {
  return (
    <div
      data-vital={vital}
      className={cn('flex min-w-0 flex-col items-center gap-0.5 px-1 py-1.5', className)}
    >
      <dt className={cn('flex items-center gap-1 text-xs font-medium', labelClass)}>
        {icon}
        {label}
      </dt>
      <dd className="w-full text-center font-display text-lg leading-tight">{children}</dd>
    </div>
  )
}

export interface WalletBarProps {
  /** null mientras carga el estado del alumno. */
  vitals: Vitals | null
  tone?: WalletBarTone
  className?: string
}

/** La VitalBar: billetera · ahorros · deuda · estrés. Siempre visible arriba en GameLayout. */
export function WalletBar({ vitals, tone = 'light', className }: WalletBarProps) {
  const theme = THEME[tone]

  if (!vitals) {
    return (
      <div
        className={cn('grid grid-cols-4 gap-1 rounded-card p-2', theme.panel, className)}
        aria-busy="true"
        aria-label="Cargando tu estado financiero"
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 py-1.5">
            <Skeleton tone={theme.skeleton} className="h-3 w-12" />
            <Skeleton tone={theme.skeleton} className="h-5 w-14" />
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
          'grid grid-cols-4 divide-x rounded-card p-1.5',
          theme.panel,
          theme.divider,
          className,
        )}
      >
        <Vital
          vital="wallet"
          label="Billetera"
          labelClass={theme.label}
          icon={<Wallet aria-hidden className={cn('size-3.5', theme.walletIcon)} />}
        >
          <IntiAmount value={vitals.wallet} tone="neutral" className={theme.wallet} />
        </Vital>

        <Vital
          vital="savings"
          label="Ahorros"
          labelClass={theme.label}
          icon={<PiggyBank aria-hidden className={cn('size-3.5', theme.savingsIcon)} />}
        >
          <IntiAmount value={vitals.savings} tone="neutral" className={theme.savings} />
        </Vital>

        <Vital
          vital="debt"
          label="Deuda"
          labelClass={theme.label}
          icon={
            hasDebt ? <TriangleAlert aria-hidden className={cn('size-3.5', theme.debt)} /> : null
          }
          className={hasDebt ? cn('rounded-control', theme.debtCell) : undefined}
        >
          <IntiAmount
            value={vitals.debt}
            tone="neutral"
            className={hasDebt ? theme.debt : theme.wallet}
          />
          {hasDebt ? <span className="sr-only">Tienes deuda pendiente.</span> : null}
        </Vital>

        <Vital
          vital="stress"
          label="Estrés"
          labelClass={theme.label}
          icon={<Flame aria-hidden className={cn('size-3.5', stress.text[tone])} />}
        >
          <div
            role="meter"
            aria-label="Estrés"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(vitals.stress * 100)}
            aria-valuetext={`${formatPercent(vitals.stress)}, ${stress.label.toLowerCase()}`}
            className="flex flex-col items-center gap-1"
          >
            <span aria-hidden className={cn('font-semibold tabular-nums', stress.text[tone])}>
              {formatPercent(vitals.stress)}
            </span>
            <div className={cn('h-1.5 w-full max-w-14 overflow-hidden rounded-full', theme.track)}>
              {/* Transición CSS: no anima al montar (igual que initial={false}), sí cuando cambia. */}
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-500 ease-out',
                  stress.bar,
                )}
                style={{ width: formatPercent(vitals.stress) }}
              />
            </div>
            {/* El nivel solo se escribe cuando preocupa: así no depende del color y llama la atención. */}
            {level === 'ok' ? null : (
              <span
                aria-hidden
                className={cn('font-sans text-[11px] font-semibold', stress.text[tone])}
              >
                {stress.label}
              </span>
            )}
          </div>
        </Vital>
      </dl>
    </section>
  )
}
