import { useLayoutEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useIsDesktop } from '@/core/hooks/useMediaQuery'
import { usePlayerState } from '@/core/hooks/usePlayerState'
import { useAuthStore } from '@/core/store/authStore'
import { cn } from '@/core/utils/cn'
import { selectVitals } from '@/core/utils/vitals'
import { AliasAvatar } from '@/design-system/AliasAvatar'
import { HorizonEdge } from '@/design-system/AndeanDawn'
import { Logo } from '@/design-system/Logo'
import { WalletBar } from '@/design-system/money/WalletBar'
import { RButton } from '@/design-system/RButton'
import { SkipLink } from '@/design-system/SkipLink'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'
import { paths } from '../paths'

/**
 * Ancho del contenido por pantalla: celular 512px, tablet 768px, laptop/PC 1152px (como la portada).
 * La cabecera y el cuerpo comparten el contenedor para que todo quede alineado.
 */
const CONTAINER = 'mx-auto w-full max-w-lg px-gutter md:max-w-3xl md:px-6 lg:max-w-6xl'

/** En laptop/PC: columna del menú lateral + contenido. El logo de la cabecera usa la misma columna. */
const DESKTOP_COLUMNS = 'lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-10'

/**
 * Layout del juego: el cielo de la portada arriba (con la VitalBar) y la pantalla sobre crema.
 * Celular y tablet: navegación abajo, en la misma noche. Laptop y PC: menú lateral.
 * Se renderiza una sola navegación (no dos ocultas con CSS) para no duplicar el landmark.
 */
export function GameLayout() {
  const location = useLocation()
  const isDesktop = useIsDesktop()

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <AppHeader />

      <div className={cn(CONTAINER, DESKTOP_COLUMNS, 'flex-1')}>
        {isDesktop ? <SideNav /> : null}
        <main
          id="contenido"
          // Al saltar aquí, que no quede tapado por la cabecera fija.
          className={cn(
            'min-w-0 scroll-mt-[var(--app-header-h,10rem)] pt-2 lg:pt-6',
            isDesktop
              ? 'pb-12'
              : 'pb-[calc(var(--spacing-nav)+env(safe-area-inset-bottom)+1.5rem)]',
          )}
        >
          {/* Solo animación de entrada (CSS): sin salida no hay cuadro vacío ni parpadeo entre
              pantallas. La key la reinicia en cada cambio de ruta. */}
          <div key={location.pathname} className="animate-entrada">
            <Outlet />
          </div>
        </main>
      </div>

      {isDesktop ? null : <BottomNav />}
    </div>
  )
}

/**
 * Celular/tablet: logo y perfil en una fila, VitalBar debajo.
 * Laptop/PC: una sola fila (logo · VitalBar · perfil), con la VitalBar alineada al contenido.
 */
function AppHeader() {
  const alias = useAuthStore((state) => state.user?.alias)
  const headerRef = useRef<HTMLElement>(null)

  // Publica el alto de la cabecera: el menú lateral se pega justo debajo aunque la VitalBar crezca.
  useLayoutEffect(() => {
    const header = headerRef.current
    if (!header || typeof ResizeObserver === 'undefined') return
    const root = document.documentElement
    const observer = new ResizeObserver(() => {
      root.style.setProperty('--app-header-h', `${header.offsetHeight}px`)
    })
    observer.observe(header)
    return () => {
      observer.disconnect()
      root.style.removeProperty('--app-header-h')
    }
  }, [])

  return (
    <header ref={headerRef} className="sticky top-0 z-30 text-white">
      <div className="bg-noche-alta pt-[max(0.25rem,env(safe-area-inset-top))] lg:pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div
          className={cn(
            CONTAINER,
            'pb-2 lg:grid lg:grid-cols-[13rem_minmax(0,38rem)_1fr] lg:items-center lg:gap-x-10 lg:pb-3',
          )}
        >
          <div className="flex items-center justify-between gap-3 lg:contents">
            <Link
              to={paths.app}
              aria-label="Riqchariy, ir al inicio"
              className="flex min-h-touch items-center lg:col-start-1 lg:row-start-1"
            >
              <Logo tone="light" />
            </Link>
            {/* NavLink: en el Perfil queda marcado (aria-current), porque no está en la navegación. */}
            <NavLink
              to={paths.profile}
              aria-label={`Mi perfil${alias ? `: ${alias}` : ''}`}
              className={({ isActive }) =>
                cn(
                  'flex min-h-touch items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold text-white/90 hover:bg-white/10 lg:col-start-3 lg:row-start-1 lg:justify-self-end',
                  isActive && 'bg-white/12 text-white',
                )
              }
            >
              <AliasAvatar alias={alias} />
              <span className="max-w-32 truncate">{alias ?? 'Mi perfil'}</span>
            </NavLink>
          </div>
          <div className="lg:col-start-2 lg:row-start-1">
            <VitalBar />
          </div>
        </div>
      </div>
      {/* El cielo sigue detrás de los cerros; el suelo crema une la cabecera con el contenido. */}
      <HorizonEdge className="-mt-px" />
    </header>
  )
}

function VitalBar() {
  const { data, isError, refetch, isRefetching } = usePlayerState()

  if (isError && !data) {
    return (
      <div
        role="alert"
        className="flex items-center justify-between gap-3 rounded-card bg-white/[0.07] p-3 text-sm text-white ring-1 ring-inset ring-white/12"
      >
        <span>🦊 No pudimos cargar tu estado.</span>
        <RButton variant="onDark" loading={isRefetching} onClick={() => refetch()}>
          Reintentar
        </RButton>
      </div>
    )
  }

  return <WalletBar tone="night" vitals={data ? selectVitals(data) : null} />
}
