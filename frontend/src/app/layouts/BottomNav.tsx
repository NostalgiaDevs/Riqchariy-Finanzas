import { NavLink } from 'react-router'
import { cn } from '@/core/utils/cn'
import { PRIMARY_NAV } from './navItems'

/** Celular y tablet. En laptop/PC la reemplaza SideNav. */
export function BottomNav() {
  return (
    // Misma noche que la cabecera (y que el header y el footer de la portada): el contenido
    // crema queda enmarcado entre cielo arriba y cielo abajo.
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-tinta/95 shadow-nav backdrop-blur"
    >
      <ul className="mx-auto flex h-nav max-w-lg items-stretch px-1 pb-[env(safe-area-inset-bottom)] box-content md:max-w-2xl">
        {PRIMARY_NAV.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group flex min-h-touch flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors md:text-sm',
                  isActive ? 'text-white' : 'text-white/65 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-8 w-14 place-items-center rounded-full transition-colors',
                      isActive ? 'bg-white/12 text-dorado' : 'group-hover:bg-white/8',
                    )}
                  >
                    <Icon aria-hidden className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
