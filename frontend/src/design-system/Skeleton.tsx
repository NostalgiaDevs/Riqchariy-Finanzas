import type { ComponentProps } from 'react'
import { cn } from '@/core/utils/cn'

const TONES = {
  light:
    'bg-[linear-gradient(90deg,var(--color-crema-200)_25%,var(--color-crema)_50%,var(--color-crema-200)_75%)]',
  /** Sobre la cabecera nocturna. */
  night:
    'bg-[linear-gradient(90deg,rgb(255_255_255/0.08)_25%,rgb(255_255_255/0.18)_50%,rgb(255_255_255/0.08)_75%)]',
} as const

/** Bloque de carga con brillo animado. Dale tamaño con className (ej. "h-5 w-16"). */
export function Skeleton({
  className,
  tone = 'light',
  ...props
}: ComponentProps<'div'> & { tone?: keyof typeof TONES }) {
  return (
    <div
      aria-hidden
      className={cn('animate-shimmer rounded-md bg-size-[200%_100%]', TONES[tone], className)}
      {...props}
    />
  )
}
