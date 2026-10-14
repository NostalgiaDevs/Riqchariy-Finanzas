import { createBrowserRouter, type RouteObject } from 'react-router'
import { USE_MOCKS } from '@/core/utils/env'
import { LoginPage } from '@/modules/auth/LoginPage'
import { RegisterPage } from '@/modules/auth/RegisterPage'
import { ComponentCatalog } from '@/modules/dev/ComponentCatalog'
import { HomePage } from '@/modules/home/HomePage'
import { LandingPage } from '@/modules/landing/LandingPage'
import { ProfilePage } from '@/modules/profile/ProfilePage'
import { ComingSoon } from '@/modules/shared/ComingSoon'
import { NotFoundPage, RouteErrorPage } from '@/modules/shared/ErrorPages'
import { GuestOnly, RequireAuth } from './guards'
import { FullscreenLayout } from './layouts/FullscreenLayout'
import { GameLayout } from './layouts/GameLayout'
import { RootLayout } from './layouts/RootLayout'
import { paths } from './paths'

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      // Portada pública: lo primero que ve cualquiera que entra a la página.
      { path: paths.landing, element: <LandingPage /> },
      {
        element: <GuestOnly />,
        children: [
          { path: paths.login, element: <LoginPage /> },
          { path: paths.register, element: <RegisterPage /> },
        ],
      },
      {
        path: paths.app,
        element: <RequireAuth />,
        children: [
          {
            element: <GameLayout />,
            children: [
              { index: true, element: <HomePage /> },
              {
                path: 'bank',
                element: (
                  <ComingSoon
                    title="Banco"
                    icon="🏦"
                    sprint={2}
                    text="Tus frascos de ahorro, tus deudas y tu credit score."
                    features={[
                      'Mover intis entre tus frascos Meta, Emergencias y Libre',
                      'Ver cada deuda: cuánto te falta, la tasa y cuándo vence la cuota',
                      'Antes de pedir un préstamo, ver cuánto pagarás en total',
                      'Seguir tu credit score, de 300 a 850',
                    ]}
                  />
                ),
              },
              {
                path: 'shop',
                element: (
                  <ComingSoon
                    title="Tienda"
                    icon="🛍️"
                    sprint={3}
                    text="Compra al contado o en cuotas, y mira cuánto pagas de verdad."
                    features={[
                      'Comprar al contado o en cuotas',
                      'Ver el total real de las cuotas antes de decidir',
                      'Saber si te alcanza antes de comprar',
                    ]}
                  />
                ),
              },
              {
                path: 'games',
                element: (
                  <ComingSoon
                    title="Juegos"
                    icon="🎮"
                    sprint={2}
                    text="El Kiosco, La Trampa y tres juegos más."
                    features={[
                      'El Kiosco: compra mercadería, pon precios y atiende la hora punta',
                      'La Trampa: decide a qué deuda pagarle primero',
                      'Invierte o Pierde, Mercado Rápido y Qori Quiz',
                      'Lo que logras en cada juego cambia tu sueldo o tu score',
                    ]}
                  />
                ),
              },
              {
                path: 'ranking',
                element: (
                  <ComingSoon
                    title="Ranking"
                    icon="🏆"
                    sprint={4}
                    text="Tu posición en el aula y tu liga."
                    features={[
                      'Ver tu posición frente a tu aula',
                      'El podio con los tres mejores scores',
                      'Tu liga: Chaski, Qollqa, Amauta o Apu',
                    ]}
                  />
                ),
              },
              {
                path: 'chatbot',
                element: (
                  <ComingSoon
                    title="Qori"
                    icon="🦊"
                    sprint={3}
                    text="Pregúntale a Qori sobre tu plata."
                    features={[
                      'Preguntarle lo que no entiendas sobre tu plata',
                      'Respuestas cortas, con los números de tu partida',
                      'Solo habla de finanzas y del juego',
                    ]}
                  />
                ),
              },
              {
                path: 'missions',
                element: (
                  <ComingSoon
                    title="Misiones"
                    icon="🎯"
                    sprint={4}
                    text="Retos semanales con recompensa."
                    features={[
                      'Tres retos nuevos cada semana',
                      'Ahorrar, jugar minijuegos o mantener tu estrés bajo',
                      'Cobrar intis de recompensa al completarlos',
                    ]}
                  />
                ),
              },
              { path: 'profile', element: <ProfilePage /> },
            ],
          },
          {
            element: <FullscreenLayout />,
            children: [
              {
                path: 'onboarding',
                element: (
                  <ComingSoon
                    title="Bienvenida"
                    icon="🌅"
                    sprint={4}
                    text="Elige tu meta y empieza tu vida financiera."
                    features={[
                      'Conocer Pacha en tres pasos cortos',
                      'Elegir tu meta: laptop, celular, bici o curso',
                    ]}
                  />
                ),
              },
              {
                path: 'games/:gameId',
                element: (
                  <ComingSoon
                    title="Minijuego"
                    icon="🕹️"
                    sprint={2}
                    text="Los juegos se abren a pantalla completa."
                    features={[
                      'Jugar a pantalla completa, sin distracciones',
                      'Ver tu resultado y tu recompensa al terminar',
                    ]}
                  />
                ),
              },
            ],
          },
        ],
      },
      // Catálogo de componentes: solo en desarrollo o en el deploy de demo con mocks.
      ...(import.meta.env.DEV || USE_MOCKS
        ? [{ path: paths.components, element: <ComponentCatalog /> }]
        : []),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export function createAppRouter() {
  return createBrowserRouter(routes)
}
