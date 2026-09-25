import type { ComponentType, SVGProps } from 'react'
import { NavLink } from 'react-router'
import { Gamepad2, House, Landmark, MessageCircle, Trophy } from 'lucide-react'
import { cn } from '@/core/utils/cn'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: House, end: true },
  { to: '/bank', label: 'Banco', icon: Landmark },
  { to: '/games', label: 'Juegos', icon: Gamepad2 },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
  { to: '/chatbot', label: 'Qori', icon: MessageCircle },
]

export function BottomNav() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-crema-200 bg-superficie/95 shadow-nav backdrop-blur"
    >
      <ul className="mx-auto flex h-nav max-w-lg items-stretch px-1 pb-[env(safe-area-inset-bottom)] box-content">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group flex min-h-touch flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors',
                  isActive ? 'text-fucsia-700' : 'text-tinta-suave hover:text-tinta',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-8 w-14 place-items-center rounded-full transition-colors',
                      isActive ? 'bg-fucsia-50' : 'group-hover:bg-crema-200',
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
