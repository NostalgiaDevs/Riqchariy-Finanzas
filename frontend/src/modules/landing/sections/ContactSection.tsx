import { Link } from 'react-router'
import { Mail, MapPin } from 'lucide-react'
import { paths } from '@/app/paths'
import { useHasSession } from '@/core/store/authStore'
import { buttonClasses } from '@/design-system/buttonStyles'
import { CONTACT_EMAIL } from '../content'

export function ContactSection() {
  const hasSession = useHasSession()

  return (
    <section
      id="contacto"
      aria-label="Contacto"
      className="scroll-mt-16 bg-superficie py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-6 px-gutter sm:px-6 md:grid-cols-2">
        <div className="flex flex-col rounded-sheet bg-crema p-6 sm:p-10">
          <h2 className="text-3xl">¿Eres alumno?</h2>
          <p className="mt-4 text-lg leading-relaxed text-tinta-suave">
            {hasSession
              ? 'Tu vida en Pacha sigue donde la dejaste.'
              : 'Pídele el código de aula a tu profe y crea tu cuenta. Solo necesitas un alias y una contraseña.'}
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
                <Link
                  to={paths.login}
                  className={buttonClasses({ size: 'lg', variant: 'secondary' })}
                >
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col rounded-sheet bg-tinta p-6 text-white sm:p-10">
          <h2 className="text-3xl">¿Tu colegio quiere usar Riqchariy?</h2>
          <p className="mt-4 text-lg leading-relaxed text-white/75">
            Escríbenos y coordinamos una demostración con tu equipo docente.
          </p>
          <div className="mt-8">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Quiero conocer Riqchariy para mi colegio')}`}
              className={buttonClasses({ size: 'lg', variant: 'onDark' })}
            >
              <Mail aria-hidden className="size-5" />
              Escribir un correo
            </a>
          </div>
          <ul className="mt-6 flex flex-col gap-2 text-white/75">
            <li className="flex items-center gap-2 break-all">
              <Mail aria-hidden className="size-4 shrink-0" />
              {CONTACT_EMAIL}
            </li>
            <li className="flex items-center gap-2">
              <MapPin aria-hidden className="size-4 shrink-0" />
              Lima, Perú
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
