import type { ReactNode } from 'react'
import { Link, useRouteError } from 'react-router'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { useHasSession } from '@/core/store/authStore'
import { AndeanDawn, NightStars } from '@/design-system/AndeanDawn'
import { buttonClasses } from '@/design-system/buttonStyles'
import { RButton } from '@/design-system/RButton'
import { paths } from '@/app/paths'

/** Mismo cielo que la portada: aunque algo falle, el alumno sigue en Riqchariy. */
function ErrorScreen({
  icon,
  title,
  text,
  action,
}: {
  icon: string
  title: string
  text: string
  action: ReactNode
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-noche text-white">
      <NightStars className="h-3/5" />
      <main className="relative mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3 px-gutter pb-8 pt-16 text-center">
        <span
          aria-hidden
          className="grid size-20 place-items-center rounded-full bg-white/10 text-5xl ring-1 ring-inset ring-white/15"
        >
          {icon}
        </span>
        <h1 className="mt-2 text-3xl">{title}</h1>
        <p className="text-lg text-white/75">{text}</p>
        <div className="mt-4">{action}</div>
      </main>
      <AndeanDawn className="relative h-[140px] sm:h-[200px]" />
    </div>
  )
}

/** errorElement del router: si una pantalla revienta, la app no queda en blanco. */
export function RouteErrorPage() {
  const error = useRouteError()
  useDocumentTitle('Error')
  if (import.meta.env.DEV) console.error(error)
  return (
    <ErrorScreen
      icon="🦊"
      title="Esta pantalla no cargó"
      text="Recarga la página. Si vuelve a pasar, avísale a tu profe."
      action={
        <RButton size="lg" onClick={() => window.location.reload()}>
          Recargar
        </RButton>
      }
    />
  )
}

export function NotFoundPage() {
  // Con sesión, lo útil es volver al juego, no a la portada.
  const hasSession = useHasSession()
  useDocumentTitle('Pantalla no encontrada')
  return (
    <ErrorScreen
      icon="🧭"
      title="Esta pantalla no existe"
      text={`Puede que el enlace esté mal escrito. Vuelve ${hasSession ? 'a tu vida en Pacha' : 'al inicio'} y sigue desde ahí.`}
      action={
        <Link to={hasSession ? paths.app : paths.landing} className={buttonClasses({ size: 'lg' })}>
          {hasSession ? 'Volver a mi vida' : 'Volver al inicio'}
        </Link>
      }
    />
  )
}
