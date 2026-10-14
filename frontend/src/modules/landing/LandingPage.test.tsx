import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppProviders } from '@/app/providers'
import { createQueryClient } from '@/app/queryClient'
import { routes } from '@/app/router'
import { useAuthStore } from '@/core/store/authStore'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <AppProviders queryClient={createQueryClient()}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}

describe('portada', () => {
  it('es lo primero que se ve: no manda al login', async () => {
    const router = renderAt('/')
    expect(
      await screen.findByRole('heading', { level: 1, name: /Equivócate con la plata aquí/ }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('sin sesión ofrece crear cuenta y entrar', async () => {
    renderAt('/')
    const hero = await screen.findByRole('region', { name: /Equivócate con la plata aquí/ })
    expect(within(hero).getByRole('link', { name: 'Crear mi cuenta' })).toHaveAttribute(
      'href',
      '/register',
    )
    expect(within(hero).getByRole('link', { name: 'Ya tengo cuenta' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('con sesión ofrece seguir jugando en vez de entrar', async () => {
    useAuthStore.getState().setSession({
      token: 'mock-token.mock-player-1',
      user: { player_id: 'mock-player-1', alias: 'alumno1' },
      expiresIn: 86400,
    })
    renderAt('/')
    const hero = await screen.findByRole('region', { name: /Equivócate con la plata aquí/ })
    expect(within(hero).getByRole('link', { name: 'Seguir jugando' })).toHaveAttribute(
      'href',
      '/app',
    )
    expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument()
  })

  it('incluye todas las secciones de información', async () => {
    renderAt('/')
    for (const name of [
      'Una semana en Pacha',
      'Cinco minijuegos que mueven tu economía',
      'Qori te explica tu plata con tus números',
      'Cuatro ligas, de Chaski a Apu',
      'Para colegios y familias',
      'Preguntas frecuentes',
    ]) {
      expect(await screen.findByRole('heading', { level: 2, name })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /Escribir un correo/ })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:contacto.riqchariy@gmail.com'),
    )
  })

  it('el menú móvil se abre y se cierra', async () => {
    const user = userEvent.setup()
    renderAt('/')
    const toggle = await screen.findByRole('button', { name: 'Abrir menú' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('el login tiene un enlace para volver a la portada', async () => {
    renderAt('/login')
    expect(await screen.findByRole('link', { name: 'Portada' })).toHaveAttribute('href', '/')
  })
})
