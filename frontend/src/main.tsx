import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import '@fontsource/fredoka/500.css'
import '@fontsource/fredoka/600.css'
import '@fontsource/fredoka/700.css'
import '@fontsource-variable/inter'
import '@fontsource/noto-sans-tifinagh/tifinagh-400.css'
import './index.css'
import { AppProviders } from './app/providers'
import { createAppRouter } from './app/router'
async function startApp() {
  // Retire only the old MSW worker, including installations left by earlier builds.
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        registrations
          .filter((registration) =>
            [registration.active, registration.waiting, registration.installing].some(
              (worker) =>
                worker && new URL(worker.scriptURL).pathname.endsWith('/mockServiceWorker.js'),
            ),
          )
          .map((registration) => registration.unregister()),
      )
    } catch {
      // An unavailable service-worker API must not prevent the app from rendering.
    }
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={createAppRouter()} />
      </AppProviders>
    </StrictMode>,
  )
}

void startApp()
