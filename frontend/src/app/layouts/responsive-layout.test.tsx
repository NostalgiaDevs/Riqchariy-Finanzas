import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { AppProviders } from '../providers'
import { createQueryClient } from '../queryClient'
import { routes } from '../router'

const originalMatchMedia = window.matchMedia

/** Simula el ancho de la pantalla para las media queries "(min-width: Npx)". */
function setViewportWidth(width: number) {
  window.matchMedia = ((query: string) => {
    const min = Number(/min-width:\s*(\d+)px/.exec(query)?.[1] ?? 0)
    return {
      matches: width >= min,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    } as unknown as MediaQueryList
  }) as typeof window.matchMedia
}

/** Debe haber exactamente una navegación principal (no dos, una oculta con CSS). */
function onlyMainNav() {
  const navs = screen.getAllByRole('navigation', { name: 'Navegación principal' })
  expect(navs).toHaveLength(1)
  return navs[0]!
}

async function loginAndOpenHome() {
  const user = userEvent.setup()
  const router = createMemoryRouter(routes, { initialEntries: ['/app'] })
  render(
    <AppProviders queryClient={createQueryClient()}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  await user.type(await screen.findByLabelText('Alias'), 'alumno1')
  await user.type(screen.getByLabelText('Contraseña'), 'demo1234')
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
  await screen.findByRole('heading', { name: /Hola, alumno1/ })
}

describe('layout del juego según el tamaño de pantalla', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('celular: barra inferior con las 5 secciones y Tienda/Misiones desde el Home', async () => {
    setViewportWidth(375)
    await loginAndOpenHome()

    const nav = onlyMainNav()
    expect(within(nav).getAllByRole('link')).toHaveLength(5)
    expect(within(nav).queryByRole('link', { name: 'Tienda' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Más en Pacha' })).toBeInTheDocument()

    // El Home muestra la plata del alumno, no solo accesos: frascos, deudas y score.
    // Dependen de GET /pacha/state: se espera a que llegue.
    expect(
      await screen.findByRole('heading', { name: 'Tus ahorros, en 3 frascos' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tus deudas' })).toBeInTheDocument()
    expect(screen.getByText('Préstamo del banco')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Score financiero' })).toBeInTheDocument()
  })

  it('laptop/PC: un solo menú lateral que incluye Tienda y Misiones', async () => {
    setViewportWidth(1366)
    await loginAndOpenHome()

    const nav = onlyMainNav()
    expect(within(nav).getByRole('link', { name: 'Tienda' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Misiones' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Inicio' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    // Ya están en el menú: el Home no los repite.
    expect(screen.queryByRole('heading', { name: 'Más en Pacha' })).not.toBeInTheDocument()
  })
})
