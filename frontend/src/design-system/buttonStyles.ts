import { cn } from '@/core/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'onDark'
export type ButtonSize = 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-fucsia text-white shadow-card hover:bg-fucsia-700 active:bg-fucsia-700',
  secondary:
    'border-2 border-crema-300 bg-superficie text-tinta hover:border-fucsia hover:text-fucsia-700',
  danger: 'bg-deuda text-white shadow-card hover:bg-deuda-700 active:bg-deuda-700',
  ghost: 'bg-transparent text-fucsia-700 hover:bg-fucsia-50',
  /** Botón secundario sobre fondos oscuros (portada, login). */
  onDark: 'border-2 border-white/35 bg-white/5 text-white hover:border-white/70 hover:bg-white/10',
}

const SIZES: Record<ButtonSize, string> = {
  md: 'min-h-touch px-4 text-base',
  lg: 'min-h-14 px-6 text-lg',
}

/** Clases de botón: las usa RButton y también los <Link> que deben verse como botón. */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
} = {}) {
  return cn(
    'inline-flex select-none items-center justify-center gap-2 rounded-control font-display font-semibold',
    'transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98]',
    'disabled:opacity-50 disabled:active:scale-100',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  )
}
