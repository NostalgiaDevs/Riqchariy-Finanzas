import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { useAuthStore } from '@/core/store/authStore'
import { AppProviders } from './providers'
import { createQueryClient } from './queryClient'
import { routes } from './router'

function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <AppProviders queryClient={createQueryClient()}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}

describe('flujo de autenticación (contra los mocks de MSW)', () => {
  it('sin sesión, una ruta protegida redirige a /login', async () => {
    const router = renderApp('/bank')
    expect(await screen.findByRole('heading', { name: '¡Hola de nuevo!' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('login → vuelve a la ruta que pidió y la VitalBar muestra el estado del alumno', async () => {
    const user = userEvent.setup()
    const router = renderApp('/profile')

    await user.type(await screen.findByLabelText('Alias'), 'Alumno1 ')
    await user.type(screen.getByLabelText('Contraseña'), 'demo1234')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'alumno1' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/profile')
    expect(useAuthStore.getState().user?.alias).toBe('alumno1')

    const bar = await screen.findByRole('region', { name: 'Tu estado financiero' })
    expect(bar).toHaveTextContent('ⵊ135')
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
  })

  it('credenciales incorrectas muestran el error del backend', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.type(await screen.findByLabelText('Alias'), 'alumno1')
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Alias o contraseña incorrectos.')).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('registro con alias repetido muestra el 409 del backend', async () => {
    const user = userEvent.setup()
    renderApp('/register')

    await user.type(await screen.findByLabelText('Alias'), 'alumno2')
    await user.type(screen.getByLabelText('Contraseña'), 'demo1234')
    await user.type(screen.getByLabelText('Código de aula'), 'riqchariy-demo')
    await user.click(screen.getByRole('button', { name: 'Empezar' }))

    expect(
      await screen.findByText('Ese alias ya está en uso. Prueba con otro.'),
    ).toBeInTheDocument()
  })

  it('registro válido entra directo al inicio', async () => {
    const user = userEvent.setup()
    const router = renderApp('/register')

    await user.type(await screen.findByLabelText('Alias'), 'nueva_14')
    await user.type(screen.getByLabelText('Contraseña'), 'demo1234')
    await user.type(screen.getByLabelText('Código de aula'), 'RIQCHARIY-DEMO')
    await user.click(screen.getByRole('button', { name: 'Empezar' }))

    expect(await screen.findByRole('heading', { name: /Hola, nueva_14/ })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('cerrar sesión vuelve al login', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setSession({
      token: 'mock-token.mock-player-1',
      user: { player_id: 'mock-player-1', alias: 'alumno1' },
      expiresIn: 86400,
    })
    const router = renderApp('/profile')

    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))
    expect(await screen.findByRole('heading', { name: '¡Hola de nuevo!' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })
})
