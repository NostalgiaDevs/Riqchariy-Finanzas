import type { ReactNode } from 'react'
import { SunMark } from '@/design-system/Logo'
import { RCard } from '@/design-system/RCard'

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-gutter py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <SunMark className="mb-3 size-14" />
        <p className="font-display text-lg font-semibold text-fucsia-700">Riqchariy</p>
        <h1 className="mt-1 text-3xl">{title}</h1>
        <p className="mt-2 text-tinta-suave">{subtitle}</p>
      </div>
      <RCard padding="lg">{children}</RCard>
      {footer ? <div className="mt-6 text-center text-sm text-tinta-suave">{footer}</div> : null}
    </div>
  )
}
