import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { useHasSession } from '@/core/store/authStore'
import { AndeanDawn, NightStars } from '@/design-system/AndeanDawn'
import { buttonClasses } from '@/design-system/buttonStyles'
import { PhonePreview } from '../PhonePreview'

export function Hero() {
  const hasSession = useHasSession()

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-noche text-white"
    >
      <NightStars className="hidden h-3/5 [mask-image:linear-gradient(to_right,transparent_38%,black_62%)] lg:block" />
      {/* Los cerros van al fondo; el celular baja hasta pisarlos y el texto queda por encima. */}
      <AndeanDawn className="absolute inset-x-0 bottom-0 h-[220px] sm:h-[280px] lg:h-[360px]" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-gutter pb-[185px] pt-14 sm:px-6 sm:pb-[150px] sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-8 lg:pb-[170px] lg:pt-20">
        <div className="max-w-xl">
          <h1
            id="hero-title"
            className="text-[2.5rem] leading-[1.05] sm:text-6xl sm:leading-[1.02]"
          >
            Equivócate con la plata aquí, no en la vida real.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
            Riqchariy es un juego para colegios del Perú. Tienes un trabajo, un sueldo en intis y
            cuentas que pagar. Cada decisión cuesta algo, y ves cuánto antes de tomarla.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {hasSession ? (
              <Link to={paths.app} className={buttonClasses({ size: 'lg' })}>
                Seguir jugando
              </Link>
            ) : (
              <>
                <Link to={paths.register} className={buttonClasses({ size: 'lg' })}>
                  Crear mi cuenta
                </Link>
                <Link to={paths.login} className={buttonClasses({ size: 'lg', variant: 'onDark' })}>
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
          {hasSession ? null : (
            <p className="mt-4 text-sm text-white/70">
              Para crear tu cuenta necesitas el código de aula que te da tu profe.
            </p>
          )}
          <p className="mt-8 text-sm text-white/70">
            ¿Eres docente o director?{' '}
            <a
              href="#colegios"
              className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              Mira qué recibe tu colegio
            </a>
          </p>
        </div>

        <div className="relative z-10 flex justify-center lg:justify-end">
          <PhonePreview />
        </div>
      </div>
    </section>
  )
}
