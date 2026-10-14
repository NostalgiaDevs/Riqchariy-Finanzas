import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router'
import { Menu, X } from 'lucide-react'
import { paths } from '@/app/paths'
import { useHasSession } from '@/core/store/authStore'
import { buttonClasses } from '@/design-system/buttonStyles'
import { Logo } from '@/design-system/Logo'
import { NAV_LINKS } from './content'

export function LandingHeader() {
  const hasSession = useHasSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const accountLinks = hasSession ? (
    <Link to={paths.app} className={buttonClasses({ className: 'min-h-11 px-4 text-sm' })}>
      Ir a mi vida
    </Link>
  ) : (
    <>
      <Link
        to={paths.login}
        className="flex min-h-11 items-center rounded-control px-3 font-display text-sm font-semibold text-white hover:bg-white/10"
      >
        Entrar
      </Link>
      <Link
        to={paths.register}
        className={buttonClasses({ className: 'hidden min-h-11 px-4 text-sm sm:inline-flex' })}
      >
        Crear cuenta
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-tinta/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-gutter sm:px-6">
        <Link
          to={paths.landing}
          aria-label="Riqchariy, inicio"
          className="mr-auto flex min-h-touch items-center"
        >
          <Logo tone="light" />
        </Link>

        <nav aria-label="Secciones" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-control px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">{accountLinks}</div>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen((open) => !open)}
          className="grid size-touch place-items-center rounded-control hover:bg-white/10 lg:hidden"
        >
          {menuOpen ? (
            <X aria-hidden className="size-6" />
          ) : (
            <Menu aria-hidden className="size-6" />
          )}
        </button>
      </div>

      <div
        id={menuId}
        hidden={!menuOpen}
        className="border-t border-white/10 bg-tinta px-gutter pb-5 pt-2 lg:hidden"
      >
        <nav aria-label="Secciones">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-touch items-center rounded-control px-2 text-base font-medium text-white/85 hover:bg-white/10"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {hasSession ? null : (
          <div className="mt-3 border-t border-white/10 pt-4 sm:hidden">
            <Link
              to={paths.register}
              className={buttonClasses({ fullWidth: true })}
              onClick={() => setMenuOpen(false)}
            >
              Crear cuenta
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
