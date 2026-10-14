import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { useHasSession } from '@/core/store/authStore'
import { Logo } from '@/design-system/Logo'
import { CONTACT_EMAIL, NAV_LINKS } from '../content'

// inline-block + py-1.5: cada enlace mide ~29px de alto (antes 17px, difícil de tocar en celular).
const linkClass = 'inline-block py-1.5 hover:text-white hover:underline underline-offset-4'

export function LandingFooter() {
  const hasSession = useHasSession()

  return (
    <footer className="bg-tinta text-white/75">
      <div className="mx-auto grid max-w-6xl gap-10 px-gutter py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Riqchariy significa despertar en quechua. Es un juego de educación financiera para
            colegios del Perú.
          </p>
        </div>

        <nav aria-label="El juego">
          <h2 className="font-display text-base font-semibold text-white">El juego</h2>
          <ul className="mt-3 flex flex-col gap-0.5 text-sm">
            {NAV_LINKS.filter((link) => link.href !== '#contacto').map((link) => (
              <li key={link.href}>
                <a href={link.href} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#preguntas" className={linkClass}>
                Preguntas frecuentes
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Tu cuenta">
          <h2 className="font-display text-base font-semibold text-white">Tu cuenta</h2>
          <ul className="mt-3 flex flex-col gap-0.5 text-sm">
            {hasSession ? (
              <li>
                <Link to={paths.app} className={linkClass}>
                  Ir a mi vida
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to={paths.login} className={linkClass}>
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link to={paths.register} className={linkClass}>
                    Crear cuenta
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-base font-semibold text-white">Contacto</h2>
          <ul className="mt-3 flex flex-col gap-0.5 text-sm">
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className={`${linkClass} break-all`}>
                {CONTACT_EMAIL}
              </a>
            </li>
            <li className="py-1.5">Lima, Perú</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-gutter py-6 text-sm sm:flex-row sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Riqchariy. Todos los derechos reservados.</p>
          <p>Datos protegidos según la Ley 29733 de Protección de Datos Personales.</p>
        </div>
      </div>
    </footer>
  )
}
