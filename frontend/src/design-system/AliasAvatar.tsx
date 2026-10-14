import { cn } from '@/core/utils/cn'

const SIZES = {
  sm: 'size-8 text-sm ring-2',
  lg: 'size-16 text-3xl ring-4',
} as const

/** Inicial del alias en un círculo: el alumno no sube foto (no hay datos personales). */
export function AliasAvatar({
  alias,
  size = 'sm',
  className,
}: {
  alias?: string
  size?: keyof typeof SIZES
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-fucsia font-display font-semibold uppercase text-white ring-white/20',
        SIZES[size],
        className,
      )}
    >
      {alias?.[0] ?? '?'}
    </span>
  )
}
