import type { ComponentProps } from 'react'
import { cn } from '@/core/utils/cn'

/** Bloque de carga con brillo animado. Dale tamaño con className (ej. "h-5 w-16"). */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-shimmer rounded-md bg-[linear-gradient(90deg,var(--color-crema-200)_25%,var(--color-crema)_50%,var(--color-crema-200)_75%)] bg-size-[200%_100%]',
        className,
      )}
      {...props}
    />
  )
}
