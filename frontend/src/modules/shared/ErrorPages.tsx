import type { ReactNode } from 'react'
import { Link, useRouteError } from 'react-router'
import { RButton } from '@/design-system/RButton'

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
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-gutter text-center">
      <span aria-hidden className="text-6xl">
        {icon}
      </span>
      <h1 className="text-2xl">{title}</h1>
      <p className="text-tinta-suave">{text}</p>
      <div className="mt-2">{action}</div>
    </div>
  )
}

/** errorElement del router: si una pantalla revienta, la app no queda en blanco. */
export function RouteErrorPage() {
  const error = useRouteError()
  if (import.meta.env.DEV) console.error(error)
  return (
    <ErrorScreen
      icon="🦊"
      title="Ups, algo salió mal"
      text="Qori ya está revisando. Intenta de nuevo."
      action={<RButton onClick={() => window.location.reload()}>Recargar</RButton>}
    />
  )
}

export function NotFoundPage() {
  return (
    <ErrorScreen
      icon="🧭"
      title="Esta pantalla no existe"
      text="Parece que te perdiste en el camino."
      action={
        <Link
          to="/"
          className="inline-flex min-h-touch items-center rounded-control bg-fucsia px-4 font-display font-semibold text-white hover:bg-fucsia-700"
        >
          Volver al inicio
        </Link>
      }
    />
  )
}
