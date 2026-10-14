import type { ComponentProps } from 'react'
import { cn } from '@/core/utils/cn'

export type RCardTone = 'default' | 'fucsia' | 'dorado' | 'ahorro' | 'deuda' | 'turquesa'

const TONES: Record<RCardTone, string> = {
  default: 'bg-superficie',
  fucsia: 'bg-fucsia-50',
  dorado: 'bg-dorado-50',
  ahorro: 'bg-ahorro-50',
  deuda: 'bg-deuda-50',
  turquesa: 'bg-turquesa-50',
}

const PADDINGS = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const

export interface RCardProps extends ComponentProps<'div'> {
  tone?: RCardTone
  padding?: keyof typeof PADDINGS
}

export function RCard({ tone = 'default', padding = 'md', className, ...props }: RCardProps) {
  return (
    <div
      className={cn('rounded-card shadow-card', TONES[tone], PADDINGS[padding], className)}
      {...props}
    />
  )
}
