import type { ComponentProps, ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/core/utils/cn'

export type RButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type RButtonSize = 'md' | 'lg'

const VARIANTS: Record<RButtonVariant, string> = {
  primary: 'bg-fucsia text-white shadow-card hover:bg-fucsia-700 active:bg-fucsia-700',
  secondary:
    'border-2 border-crema-300 bg-superficie text-tinta hover:border-fucsia hover:text-fucsia-700',
  danger: 'bg-deuda text-white shadow-card hover:bg-deuda-700 active:bg-deuda-700',
  ghost: 'bg-transparent text-fucsia-700 hover:bg-fucsia-50',
}

const SIZES: Record<RButtonSize, string> = {
  md: 'min-h-touch px-4 text-base',
  lg: 'min-h-14 px-6 text-lg',
}

export interface RButtonProps extends ComponentProps<'button'> {
  variant?: RButtonVariant
  size?: RButtonSize
  loading?: boolean
  fullWidth?: boolean
  icon?: ReactNode
}

export function RButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: RButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-control font-display font-semibold',
        'transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98]',
        'disabled:opacity-50 disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : icon}
      {children}
    </button>
  )
}
