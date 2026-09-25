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
import { USE_MOCKS } from './core/utils/env'

/** Con VITE_USE_MOCKS=true, MSW intercepta las llamadas a la API antes de montar la app. */
async function enableMocking() {
  if (!USE_MOCKS) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={createAppRouter()} />
      </AppProviders>
    </StrictMode>,
  )
})
