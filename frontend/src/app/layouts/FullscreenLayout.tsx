import { Link, Outlet } from 'react-router'
import { ArrowLeft } from 'lucide-react'

/** Pantalla completa sin VitalBar ni bottom nav: minijuegos y onboarding. */
export function FullscreenLayout() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-gutter pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]">
      <Link
        to="/"
        className="-ml-2 flex min-h-touch w-fit items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-tinta-suave hover:bg-crema-200"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Volver
      </Link>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
