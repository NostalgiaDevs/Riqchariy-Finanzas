import { Outlet, ScrollRestoration } from 'react-router'

/**
 * Raíz de todas las rutas. Sin ScrollRestoration, al cambiar de pantalla el navegador
 * conserva el scroll anterior: desde el footer de la portada, /app abría ya scrolleado.
 * Va después del Outlet para restaurar el scroll cuando la nueva pantalla ya está pintada.
 */
export function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}
