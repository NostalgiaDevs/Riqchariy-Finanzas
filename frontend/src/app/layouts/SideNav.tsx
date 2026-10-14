import { NavLink } from 'react-router'
import { cn } from '@/core/utils/cn'
import { PRIMARY_NAV, SECONDARY_NAV, type NavItem } from './navItems'
import { QoriTip } from './QoriTip'

function NavList({ items }: { items: NavItem[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex min-h-touch items-center gap-3 rounded-control px-3 font-semibold transition-colors',
                // Activo = un pedazo de noche con el ícono en dorado, igual que en la barra inferior.
                isActive
                  ? 'bg-tinta text-white shadow-card'
                  : 'text-tinta-suave hover:bg-crema-200 hover:text-tinta',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  aria-hidden
                  className={cn('size-5 shrink-0', isActive && 'text-dorado')}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {label}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

/**
 * Laptop y PC: menú lateral que sigue al contenido al hacer scroll, justo debajo de la cabecera
 * (su alto lo publica GameLayout en --app-header-h).
 */
export function SideNav() {
  return (
    <div className="sticky top-[calc(var(--app-header-h,8rem)+1rem)] flex flex-col gap-6 self-start pt-6">
      <nav aria-label="Navegación principal" className="flex flex-col gap-4">
        <NavList items={PRIMARY_NAV} />
        <hr className="mx-3 border-crema-300" />
        <NavList items={SECONDARY_NAV} />
      </nav>
      {/* Fuera del <nav>: llena la columna bajo el menú con algo útil en vez de dejarla vacía. */}
      <QoriTip />
    </div>
  )
}
