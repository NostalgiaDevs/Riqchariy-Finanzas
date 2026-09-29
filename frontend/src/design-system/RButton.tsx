import type { ComponentProps, ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles'

export type RButtonVariant = ButtonVariant
export type RButtonSize = ButtonSize

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
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : icon}
      {children}
    </button>
  )
}
