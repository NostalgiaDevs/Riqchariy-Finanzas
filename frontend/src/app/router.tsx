import { createBrowserRouter, type RouteObject } from 'react-router'
import { USE_MOCKS } from '@/core/utils/env'
import { LoginPage } from '@/modules/auth/LoginPage'
import { RegisterPage } from '@/modules/auth/RegisterPage'
import { ComponentCatalog } from '@/modules/dev/ComponentCatalog'
import { HomePage } from '@/modules/home/HomePage'
import { ProfilePage } from '@/modules/profile/ProfilePage'
import { ComingSoon } from '@/modules/shared/ComingSoon'
import { NotFoundPage, RouteErrorPage } from '@/modules/shared/ErrorPages'
import { GuestOnly, RequireAuth } from './guards'
import { FullscreenLayout } from './layouts/FullscreenLayout'
import { GameLayout } from './layouts/GameLayout'

export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <GuestOnly />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <GameLayout />,
            children: [
              { index: true, element: <HomePage /> },
              {
                path: '/bank',
                element: (
                  <ComingSoon
                    title="Banco"
                    icon="🏦"
                    sprint={2}
                    text="Tus frascos de ahorro, tus deudas y tu credit score."
                  />
                ),
              },
              {
                path: '/shop',
                element: (
                  <ComingSoon
                    title="Tienda"
                    icon="🛍️"
                    sprint={3}
                    text="Compra al contado o en cuotas, y mira cuánto pagas de verdad."
                  />
                ),
              },
              {
                path: '/games',
                element: (
                  <ComingSoon
                    title="Juegos"
                    icon="🎮"
                    sprint={2}
                    text="El Kiosco, La Trampa y tres juegos más."
                  />
                ),
              },
              {
                path: '/ranking',
                element: (
                  <ComingSoon
                    title="Ranking"
                    icon="🏆"
                    sprint={4}
                    text="Tu posición en el aula y tu liga."
                  />
                ),
              },
              {
                path: '/chatbot',
                element: (
                  <ComingSoon
                    title="Qori"
                    icon="🦊"
                    sprint={3}
                    text="Pregúntale a Qori sobre tu plata."
                  />
                ),
              },
              {
                path: '/missions',
                element: (
                  <ComingSoon
                    title="Misiones"
                    icon="🎯"
                    sprint={4}
                    text="Retos semanales con recompensa."
                  />
                ),
              },
              { path: '/profile', element: <ProfilePage /> },
            ],
          },
          {
            element: <FullscreenLayout />,
            children: [
              {
                path: '/onboarding',
                element: (
                  <ComingSoon
                    title="Bienvenida"
                    icon="🌅"
                    sprint={4}
                    text="Elige tu meta y empieza tu vida financiera."
                  />
                ),
              },
              {
                path: '/games/:gameId',
                element: (
                  <ComingSoon
                    title="Minijuego"
                    icon="🕹️"
                    sprint={2}
                    text="Los juegos se abren a pantalla completa."
                  />
                ),
              },
            ],
          },
        ],
      },
      // Catálogo de componentes: solo en desarrollo o en el deploy de demo con mocks.
      ...(import.meta.env.DEV || USE_MOCKS
        ? [{ path: '/dev/componentes', element: <ComponentCatalog /> }]
        : []),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export function createAppRouter() {
  return createBrowserRouter(routes)
}
