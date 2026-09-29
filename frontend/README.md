# Riqchariy · Frontend

SPA del piloto: React 19 + TypeScript + Vite + Tailwind v4. Plan de trabajo en [`../docs/PLAN-FRONTEND.md`](../docs/PLAN-FRONTEND.md).

## Arrancar en local

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173 — con mocks por defecto
```

Entra con **alumno1** / **demo1234** (hay de `alumno1` a `alumno10`). Para registrarte, el código de aula es `RIQCHARIY-DEMO`.

Catálogo de componentes (VitalBar, IntiFly, botones, modal…): **http://localhost:5173/dev/componentes**

## Rutas

| Ruta                                | Qué es                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `/`                                 | Portada pública (qué es Riqchariy, ligas, colegios)                          |
| `/login`, `/register`               | Entrar y crear cuenta (con sesión, redirigen a `/app`)                       |
| `/app`                              | Home "Mi Vida" (exige sesión; todo el juego vive bajo `/app`)                |
| `/app/bank`, `/app/games`, `/app/…` | Pantallas del juego (las de sprints futuros muestran "Llega en el Sprint N") |
| `/dev/componentes`                  | Catálogo del design system (solo en dev o con mocks)                         |

Las rutas se definen en `src/app/paths.ts`: usa `paths.bank` en vez de escribir `'/app/bank'`.

## Responsive

La app se adapta a celular, tablet y laptop/PC (mismos cortes que Tailwind):

- **Celular (<768px):** barra de navegación inferior, una columna.
- **Tablet (768–1023px):** barra inferior, contenido en 2 columnas.
- **Laptop/PC (≥1024px):** menú lateral (`SideNav`), cabecera en una fila, contenido hasta 1152px.

Solo se renderiza una navegación a la vez (`useIsDesktop()` en `src/core/hooks/useMediaQuery.ts`).

## Animaciones

framer-motion carga su motor aparte (`src/core/motion/features.ts`) para no frenar la primera pantalla.
Por eso se usa **`m.div`** y no `motion.div` (`LazyMotion strict` avisa si alguien usa `motion.*`).
Para animaciones simples (entrar, cambiar un ancho) basta con CSS.

## Mocks vs. backend real

| Variable         | Valor                   | Efecto                                                                                    |
| ---------------- | ----------------------- | ----------------------------------------------------------------------------------------- |
| `VITE_USE_MOCKS` | `true`                  | [MSW](https://mswjs.io) responde todas las llamadas con datos del contrato (`src/mocks/`) |
| `VITE_USE_MOCKS` | `false`                 | La app llama al backend en `VITE_API_URL`                                                 |
| `VITE_API_URL`   | `http://localhost:8000` | URL del backend **sin** `/api/v1` (el cliente lo agrega)                                  |

`npm run dev` lee `.env.development` (mocks activados). Para usar tu backend local, crea `.env.development.local` (no se sube a git):

```bash
VITE_USE_MOCKS=false
VITE_API_URL=http://localhost:8000
```

Con `VITE_USE_MOCKS=false`, MSW ni siquiera se descarga: queda en un chunk aparte.

## Scripts

| Comando              | Qué hace                                          |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo                            |
| `npm run build`      | Chequeo de tipos + build de producción en `dist/` |
| `npm run preview`    | Sirve `dist/` para probar el build                |
| `npm test`           | Tests (Vitest + Testing Library + MSW)            |
| `npm run test:watch` | Tests en modo watch                               |
| `npm run lint`       | oxlint                                            |
| `npm run format`     | Prettier                                          |

## Estructura

```
src/
├── app/            router, guards (RequireAuth), providers, layouts (GameLayout, BottomNav)
├── core/
│   ├── api/        client.ts (fetch + token + errores) · endpoints.ts (1 función por endpoint)
│   ├── hooks/      usePlayerState…
│   ├── store/      authStore (Zustand, persistido en localStorage)
│   └── utils/      cn, format (intis), vitals
├── types/          contrato de docs/api/endpoints-piloto.md, en snake_case
├── design-system/  tokens.css, RButton, RCard, RModal, RBadge, RInput, Skeleton, money/
├── mocks/          handlers MSW + fixtures + "BD" en memoria
├── modules/        pantallas por dominio (auth, home, profile…)
└── test/           setup de Vitest y servidor MSW
```

**Reglas:** los componentes no llaman a `fetch`, usan `core/api/endpoints.ts` vía TanStack Query. Los montos siempre pasan por `IntiAmount` / `formatIntis`. Los tipos reflejan el contrato tal cual; si el contrato cambia, se actualizan `src/types/` y `src/mocks/fixtures.ts`.

## Deploy en Vercel (S1.FE.04)

1. En Vercel: **Add New → Project** → importar el repo.
2. **Root Directory:** `frontend` · **Framework:** Vite (lo detecta solo). Build `npm run build`, output `dist`.
3. **Environment Variables:**
   - `VITE_API_URL` = `https://riqchariy-api.onrender.com` (o la URL que tenga el backend en Render)
   - `VITE_USE_MOCKS` = `true` hasta que el backend responda en Render; luego `false`
4. **Production Branch:** la que el equipo use para producción (`main`). Las demás ramas generan _preview deployments_ con su propia URL.
5. Avisar a DB/BE la URL final para agregarla a `CORS_ORIGINS` del backend.

`vercel.json` ya redirige todas las rutas a `index.html`, así que recargar en `/bank` no da 404.
