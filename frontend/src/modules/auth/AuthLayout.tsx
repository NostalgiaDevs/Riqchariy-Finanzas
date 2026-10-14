import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { paths } from '@/app/paths'
import { AndeanDawn, NightStars } from '@/design-system/AndeanDawn'
import { Logo } from '@/design-system/Logo'
import { RCard } from '@/design-system/RCard'

/**
 * Login y registro: el mismo amanecer de la portada a la izquierda (arriba en celular)
 * y el formulario a la derecha.
 */
export function AuthLayout({
  title,
  subtitle,
  aside,
  children,
  footer,
}: {
  title: string
  subtitle: string
  /** Mensaje del panel del amanecer (solo se ve en pantallas grandes). */
  aside: { title: string; text: string }
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="min-h-dvh bg-crema lg:grid lg:grid-cols-[1fr_1.05fr]">
      <div className="relative overflow-hidden bg-noche text-white lg:flex lg:min-h-dvh lg:flex-col">
        <NightStars className="hidden h-3/5 [mask-image:linear-gradient(to_right,transparent_38%,black_62%)] lg:block" />

        <header className="relative flex items-center justify-between gap-4 px-gutter pt-4 sm:px-8 lg:pt-8">
          <Link
            to={paths.landing}
            aria-label="Riqchariy, ir a la portada"
            className="flex min-h-touch items-center"
          >
            <Logo tone="light" />
          </Link>
          <Link
            to={paths.landing}
            className="flex min-h-touch items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Portada
          </Link>
        </header>

        <div className="relative hidden max-w-md px-8 pt-20 lg:block xl:px-14">
          <p className="font-display text-4xl font-semibold leading-tight">{aside.title}</p>
          <p className="mt-4 text-lg leading-relaxed text-white/75">{aside.text}</p>
        </div>

        {/* El SVG recorta por arriba cuanto más ancha es la pantalla: estas alturas mantienen
            el Inti entero de 320px a 1023px (en tablet con 130px se cortaba). */}
        <AndeanDawn className="relative mt-2 h-[96px] sm:h-[150px] md:h-[210px] lg:mt-auto lg:h-[340px]" />
      </div>

      <main className="px-gutter pb-12 pt-4 sm:px-8 lg:flex lg:items-center lg:justify-center lg:py-12">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl sm:text-4xl">{title}</h1>
          <p className="mt-2 text-tinta-suave">{subtitle}</p>
          <RCard padding="lg" className="mt-6">
            {children}
          </RCard>
          {footer ? (
            <div className="mt-6 text-center text-sm text-tinta-suave">{footer}</div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
