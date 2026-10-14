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
            // framer-motion no va en un grupo: su motor se importa de forma dinámica
            // (src/core/motion/features.ts) y un grupo lo volvería a meter en la carga inicial.
          ],
        },
      },
    },
  },
})
