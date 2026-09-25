import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rolldownOptions: {
      output: {
        // Librerías en chunks propios: cambian poco, así que el celular las guarda en caché entre deploys.
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 3,
            },
            { name: 'router', test: /node_modules[\\/]react-router[\\/]/, priority: 2 },
            {
              name: 'motion',
              test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/,
              priority: 2,
            },
          ],
        },
      },
    },
  },
})
