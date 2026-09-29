import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/core/utils/cn'

export type RBadgeTone =
  'neutral' | 'fucsia' | 'dorado' | 'ahorro' | 'deuda' | 'turquesa' | 'morado'

const TONES: Record<RBadgeTone, string> = {
  neutral: 'bg-crema-200 text-tinta',
  fucsia: 'bg-fucsia-50 text-fucsia-700',
  dorado: 'bg-dorado-50 text-dorado-700',
  ahorro: 'bg-ahorro-50 text-ahorro-700',
  deuda: 'bg-deuda-50 text-deuda-700',
  turquesa: 'bg-turquesa-50 text-turquesa-700',
  morado: 'bg-morado-50 text-morado',
}

export interface RBadgeProps extends ComponentProps<'span'> {
  tone?: RBadgeTone
  icon?: ReactNode
}

export function RBadge({ tone = 'neutral', icon, className, children, ...props }: RBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}
