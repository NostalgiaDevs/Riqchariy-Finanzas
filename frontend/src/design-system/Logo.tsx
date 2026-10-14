import { cn } from '@/core/utils/cn'

/** Sol naciente (Riqchariy = despertar). Mismo dibujo que public/favicon.svg. */
export function SunMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn('size-7', className)}>
      <rect width="32" height="32" rx="9" fill="var(--color-fucsia)" />
      <g stroke="var(--color-dorado)" strokeWidth="2.4" strokeLinecap="round">
        <path d="M16 6.5v3" />
        <path d="M8.2 10.2l2.1 2.1" />
        <path d="M23.8 10.2l-2.1 2.1" />
        <path d="M5 18.5h3" />
        <path d="M24 18.5h3" />
      </g>
      <path d="M9.5 21.5a6.5 6.5 0 0 1 13 0z" fill="var(--color-dorado)" />
      <path d="M6 24.5h20" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

/** tone="light" para fondos oscuros (portada, login). */
export function Logo({
  className,
  tone = 'dark',
}: {
  className?: string
  tone?: 'dark' | 'light'
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <SunMark />
      <span
        className={cn(
          'font-display text-xl font-semibold',
          tone === 'light' ? 'text-white' : 'text-fucsia-700',
        )}
      >
        Riqchariy
      </span>
    </span>
  )
}
