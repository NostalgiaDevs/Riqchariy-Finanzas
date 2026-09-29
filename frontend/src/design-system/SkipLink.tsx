/**
 * "Saltar al contenido": invisible hasta que se llega con Tab. Evita recorrer el logo,
 * el perfil y todo el menú antes de llegar a la pantalla.
 */
export function SkipLink({ href = '#contenido' }: { href?: string }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-superficie focus:px-4 focus:py-2 focus:font-semibold focus:text-tinta focus:shadow-raised"
    >
      Saltar al contenido
    </a>
  )
}
