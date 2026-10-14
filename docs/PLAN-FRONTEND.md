# 🎨 Plan de trabajo — Frontend del Piloto Riqchariy

> Rama de trabajo: `feat/frontend` · Perfil: **FE** · Duración: 14 días (4 sprints)
> Tareas de origen: `S1.FE.01` → `S4.FE.04` de `SPRINTS-PILOTO.md` (16 tareas) + tareas de soporte que ningún sprint asignó.

---

## 0. Fuentes de verdad (en este orden)

1. **`docs/api/endpoints-piloto.md` (rama `develop`)** → contrato de API real que el backend está implementando.
2. **`docs/ALCANCE-MVP.md` (rama `develop`)** → qué entra y qué no.
3. `SPRINTS-PILOTO.md` → tareas FE y sus DoD.
4. `PILOTO-2-SEMANAS (1).md` → specs de juegos, UI y balance (referencial).
5. `README.md` → identidad visual y principios.

Si dos documentos chocan, manda el de arriba. Toda discrepancia se anota en la sección 10 y se resuelve en el sync diario.

### ⚠️ Diferencias ya detectadas entre el contrato real y PILOTO-2-SEMANAS

| Tema | PILOTO-2-SEMANAS | Contrato real (`develop`) | Impacto FE |
|---|---|---|---|
| Base URL | `/pacha/...` | `{API_URL}/api/v1/...` | `VITE_API_URL` + prefijo en el cliente HTTP |
| Login | `email + password` | `alias + password` (sin datos personales reales) | Formularios usan **alias** |
| Nombres de campos | camelCase (`savingsGoal`) | snake_case (`savings.meta.balance`) | Tipos TS reflejan snake_case tal cual (sin capa de mapeo) |
| Frascos | `goal / emergency / free` | `meta / emergencias / libre` | Usar los nombres del contrato |
| Transferencia | `{from_jar, to_jar, amount, confirmed}` | `{from, to, amount}` → `friction_warning` | La fricción la maneja FE (ConfirmHold) antes de enviar |
| Compras | `POST /pacha/decisions {type: BUY_ITEM}` | `POST /shop/buy {item_id, payment_method}` | Endpoint separado |
| Decisiones | `{type, ...params}` | `{event_id, choice_id}` (solo eventos) | Préstamos/pago de deuda **no tienen endpoint** aún → ver §10 |
| Preview | `{projected_state, impacts[]}` | `{wallet_after, stress_after, warning, risk_level}` | UI de preview se basa en estos 4 campos |
| Juego "La Trampa" | Puzzle de pagar 3 deudas | "Identificar estafas y ofertas engañosas" | **Decidir con el equipo** → ver §10 |
| Resultado Kiosco | `{performance}` | `{score, items_sold, time_seconds, perfect}` | Seguir el contrato |
| Chatbot | `{response, buttons[]}` | `{response, concepts_referenced, sources}` | Botones sugeridos se definen en FE (fijos) |
| Onboarding | `POST /pacha/onboarding` | No existe | Pedir endpoint o setear meta con otra llamada |
| Historial de score (Perfil) | Gráfica últimos 30 ticks | No hay endpoint | Guardar histórico local o pedir endpoint |

---

## 1. Alcance del frontend

### ✅ Entra
- Auth: registro (alias + password + código de aula) y login
- Layout de juego: VitalBar siempre visible + bottom nav mobile-first
- Home "Mi Vida" + botón **Avanzar día** + resumen del día
- Eventos: carta con opciones + **preview** antes de decidir + comentario de Qori
- Banco: 3 frascos, transferencias con fricción, deudas, credit score
- Tienda con contado vs. cuotas
- Hub de juegos + **5 minijuegos en React**
- Chat con Qori
- Ranking del aula, Perfil, Misiones
- Onboarding (3 slides + elegir meta)
- Estados de carga, vacío y error; responsive 375px/412px
- Deploy en Vercel

### ❌ No entra
Phaser, dashboard docente, PWA/push real, i18n, multi-aula, WebSocket (`VITE_WS_URL` no se usa).

---

## 2. Stack y decisiones técnicas

| Pieza | Elección | Por qué |
|---|---|---|
| Build | **Vite 8 + React 19 + TypeScript 6 (strict)** | Versiones actuales al crear el proyecto |
| Estilos | **Tailwind CSS v4** + `tokens.css` (`@theme`) | Paleta Riqchariy como tokens; v4 no usa `tailwind.config.ts` |
| Utilidad de clases | `clsx` + `tailwind-merge` → `cn.ts` | DoD de S1.FE.01 |
| Rutas | **React Router 8** | DoD de S1.FE.02 |
| Estado de servidor | **TanStack Query** | Cache, loading/error, invalidación tras cada decisión sin escribir boilerplate |
| Estado de cliente | **Zustand** (auth + UI) | Mínimo; el estado económico vive en TanStack Query |
| HTTP | wrapper sobre `fetch` (`core/api/client.ts`) | Inyecta token, prefijo `/api/v1`, maneja 401 → logout |
| Mocks | **MSW** (Mock Service Worker) | Mocks que imitan el contrato exacto; se apagan con `VITE_USE_MOCKS=false` sin tocar componentes |
| Animación | **Framer Motion** | VitalBar, IntiFly, cartas deslizables |
| Gráficas | **Recharts** | Invierte o Pierde, Perfil |
| Tests | **Vitest + Testing Library** (+ MSW en Node) | Los tests usan los mismos mocks que el navegador |
| Calidad | **oxlint** + Prettier | oxlint viene con la plantilla de Vite y es mucho más rápido que ESLint |

**Regla clave:** la lógica de cada minijuego es un **reducer puro** (`(state, action) → state`) separado del componente. Así se testea con Vitest sin renderizar, igual que el motor Pacha en el backend.

---

## 3. Estructura de carpetas

```
frontend/
├── index.html
├── vite.config.ts
├── .env.example                 # VITE_API_URL, VITE_USE_MOCKS
├── public/                      # favicon, og-image, sonidos
└── src/
    ├── main.tsx
    ├── app/
    │   ├── router.tsx           # rutas + RequireAuth
    │   ├── providers.tsx        # QueryClient, MSW, Toaster
    │   └── layouts/
    │       ├── GameLayout.tsx   # VitalBar + <Outlet/> + BottomNav
    │       └── FullscreenLayout.tsx  # para minijuegos
    ├── core/
    │   ├── api/
    │   │   ├── client.ts        # fetch + token + errores tipados
    │   │   └── endpoints/       # auth.ts, pacha.ts, shop.ts, games.ts, ...
    │   ├── hooks/               # usePlayerState, useNextDay, ...
    │   ├── store/               # authStore.ts, uiStore.ts (Zustand)
    │   └── utils/               # cn.ts, format.ts (formatIntis), league.ts
    ├── types/                   # contrato: economy.ts, api.ts, game.ts, user.ts
    ├── mocks/
    │   ├── handlers/            # 1 archivo por módulo del contrato
    │   ├── fixtures/            # playerState.ts, events.ts, leaderboard.ts
    │   └── browser.ts
    ├── design-system/
    │   ├── tokens.css
    │   ├── RButton.tsx · RCard.tsx · RModal.tsx · RBadge.tsx · RInput.tsx
    │   ├── ConfirmHold.tsx · Toast.tsx · Skeleton.tsx · EmptyState.tsx
    │   └── money/               # IntiAmount.tsx, WalletBar.tsx, IntiFly.tsx
    └── modules/
        ├── auth/                # LoginPage, RegisterPage
        ├── onboarding/          # OnboardingPage
        ├── home/                # HomePage, DaySummary, WorldTicker
        ├── events/              # EventCard, ChoiceOption, QoriComment
        ├── bank/                # SavingsPage, LoansPage, LoanPreview, CreditScoreGauge
        ├── shop/                # ShopPage, ItemCard, InstallmentBadge
        ├── games/
        │   ├── GamesHub.tsx
        │   ├── shared/          # GameShell, Timer, ResultScreen, useSubmitResult
        │   ├── kiosco/          # KioscoGame.tsx, kiosco.reducer.ts, kiosco.data.ts, *.test.ts
        │   ├── la-trampa/
        │   ├── invierte-o-pierde/
        │   ├── mercado-rapido/
        │   └── qori-quiz/
        ├── chatbot/             # QoriAvatar, ChatWindow, ChatBubble, ChatInput, ActionButtons
        ├── ranking/             # RankingPage, Podium
        ├── profile/             # ProfilePage
        └── missions/            # MissionsPage, MissionCard
```

---

## 4. Convenciones

- **Ramas:** trabajar en `feat/frontend`. Si una pieza es grande, sub-rama `feat/frontend-<tema>` → PR hacia `feat/frontend`. PR final de `feat/frontend` → **`develop`** (no `main`).
- **Commits:** Conventional Commits con el código de tarea → `feat(fe): VitalBar con animación de cambio (S1.FE.03)`.
- **Tipos:** reflejan el JSON del contrato **en snake_case**, sin traducir. Menos código y menos bugs de integración.
- **Dinero:** siempre con `IntiAmount` / `formatIntis()`: símbolo ⵊ, `font-variant-numeric: tabular-nums`, nunca negativo visible (`ⵊ0`, no `ⵊ-3.40`).
- **Deuda:** siempre color + ícono ⚠ + texto. Nunca solo color.
- **Touch targets:** mínimo 44×44 px.
- **Nada de lógica económica en el FE.** El FE muestra lo que devuelve el backend; los juegos calculan su propio resultado, pero el efecto en la economía lo decide el backend.

---

## 5. Plan por sprint

Leyenda: 🔴 bloquea a otros · 🔗 depende del backend · ⭐ prioridad alta

### SPRINT 1 — Cimientos (D1–D3)

**Objetivo:** app deployada en Vercel, login funcionando con mocks, VitalBar visible con datos del contrato.

> **Estado (2026-09-25):** ✅ código completo en `feat/frontend` · 36 tests pasando · build y lint limpios. Pendiente: revisión de tipos con BE y conectar Vercel.
>
> **Pulido UX/UI (2026-09-29):** la app toma la paleta de la portada (amanecer andino). Cabecera nocturna con la VitalBar (`WalletBar tone="night"`, billetera en dorado) y borde de cerros con el Inti (`HorizonEdge`); bottom nav oscuro con pestaña activa en dorado. Home con "Mañana es el día N" (lugar del futuro *Avanzar día*), meta con lo que falta y accesos a Tienda/Misiones. Perfil con escalera de ligas. "Próximamente" y 404/error con el mismo cielo. Tokens nuevos en `tokens.css`: `anil`, `cerro`, `cerro-oscuro`, `alba`, `inti-claro` y tintes `-300` para texto sobre la noche. 43 tests.
>
> **Web responsive (2026-09-29):** la app ya no es solo una columna de celular. Celular (<768px): barra inferior. Tablet (768–1023px): barra inferior y contenido en 2 columnas. Laptop/PC (≥1024px): menú lateral (`SideNav`) con Tienda y Misiones, cabecera en una fila (logo · VitalBar · perfil) y contenido hasta 1152px como la portada. Se renderiza una sola navegación según `useIsDesktop()` (`core/hooks/useMediaQuery.ts`). Verificado sin scroll horizontal de 320px a 1920px. 45 tests.
>
> **Revisión final del Sprint 1 (2026-09-29):** corregidos: scroll que no volvía arriba al navegar (`ScrollRestoration` en `RootLayout`), página de fondo que se movía con un modal abierto, celular de la portada con el diseño viejo, título de pestaña por pantalla (`useDocumentTitle`), foco al primer campo con error y ayuda duplicada en formularios, "Saltar al contenido" en la app, zonas táctiles del footer de la portada, 404 que mandaba a la portada con sesión, rangos de ligas duplicados (ahora solo en `LEAGUES`). Optimización: framer-motion se carga en diferido (`LazyMotion`), −30 kB gzip en la primera carga (190.8 → 160.7 kB de JS); `vercel.json` con caché inmutable para `/assets`. 49 tests.
>
> **Home y Perfil completos (2026-09-29):** Home con frascos, deudas y score; Perfil con cabecera nocturna, credit score (`CreditScoreGauge`, adelantado de S2.FE.02), trabajo, cosas y logros. Pantallas "Próximamente" con la lista de lo que traerá cada una.
>
> **Pendiente del Sprint 1 (no es código):** conectar Vercel (S1.FE.04) y revisar los tipos del contrato con BE (FE-00).

#### FE-00 · Tipos del contrato + cliente API + mocks 🔴 (soporte de `S1.BE.04`)
- [x] `types/` escritos a partir de `docs/api/endpoints-piloto.md` (`PlayerState`, `Loan`, `Savings`, `NextDayResponse`, `DecisionPreview`, `ShopItem`, `LeaderboardResponse`, `Mission`, `ChatResponse`, `GameResultRequest`...)
- [ ] Revisión cruzada con BE: ambos aprueban los tipos (dejar constancia en el PR)
- [x] `core/api/client.ts`: prefijo `/api/v1`, header `Authorization`, 401 → logout + redirect a `/login`, errores con `{status, message}`
- [x] MSW con handlers para **todos** los endpoints del contrato usando los JSON de ejemplo como fixtures
- [x] `VITE_USE_MOCKS=true|false` alterna mocks ↔ API real

#### `S1.FE.01` · Setup + design system base
- [x] `npm run dev` en `localhost:5173`
- [x] Paleta: crema `#FAF6EF`, fucsia `#D62E6C`, dorado `#F2A81D`, verde `#2E9E6B`, rojo `#C4472F`, turquesa `#2AA8A0`, morado `#7B3FA0`, oscuro `#141B2E`
- [x] Fuentes Fredoka (títulos) + Inter (UI)
- [x] `RButton` (primary/secondary/danger/ghost), `RCard`, `RModal`, `RBadge`, `RInput`
- [x] `tokens.css` (espaciado, radios, sombras) + `cn.ts` — en Tailwind v4 la paleta vive en `@theme` dentro de `tokens.css` (no existe `tailwind.config.ts`)
- [x] oxlint + Prettier configurados

#### `S1.FE.02` · Layout, rutas y login
- [x] `GameLayout` con VitalBar arriba + `<Outlet/>` + bottom nav (Home · Banco · Juegos · Ranking · Qori)
- [x] Rutas: `/login`, `/register`, `/onboarding`, `/`, `/bank`, `/shop`, `/games`, `/games/:gameId`, `/ranking`, `/chatbot`, `/profile`, `/missions`
- [x] `RequireAuth`: sin token → `/login`
- [x] `LoginPage` y `RegisterPage` con **alias** + password (+ `classroom_code` en registro), contra MSW
- [x] Bottom nav correcta en 375px, sin parpadeo blanco entre páginas

#### `S1.FE.03` · Componentes de dinero + VitalBar ⭐
- [x] `IntiAmount`: ⵊ, números tabulares, color según signo, animación al cambiar
- [x] `WalletBar` (VitalBar): Billetera · Ahorros (suma de 3 frascos) · Deuda (suma de `loans[].remaining`, rojo + ⚠) · Estrés (0–100%)
- [x] Estrés > 60% ámbar, > 80% rojo
- [x] `IntiFly`: moneda que vuela de A a B (Framer Motion)
- [x] Alimentada por `usePlayerState()` (TanStack Query → `GET /pacha/state`)

#### `S1.FE.04` · Deploy en Vercel
- [ ] 👤 Conectar el repo en Vercel (lo hace el dueño de la cuenta; pasos en `frontend/README.md`): root directory `frontend/`, build `npm run build`, output `dist`
- [ ] `VITE_API_URL` apuntando a Render; `VITE_USE_MOCKS=true` hasta que el backend responda
- [x] Rewrite SPA (`vercel.json`) para que `/bank` no dé 404 al recargar
- [ ] Deploy automático con cada push

**Demo S1:** abrir la URL de Vercel en el celular → login → Home vacío con VitalBar llena (mocks).

---

### SPRINT 2 — El motor vive (D4–D7)

**Objetivo:** el alumno avanza días, decide eventos, maneja su banco y juega 2 minijuegos.

#### `S2.FE.01` · Home + eventos ⭐ 🔗 `S2.BE.01`, `S2.BE.03`
- [ ] `HomePage`: grid (Billetera, Banco, Trabajo, Tienda, Ranking, Qori) + `WorldTicker` ("Día 14 · ⵊ135 en billetera")
- [ ] Botón **▶ Avanzar día** → `POST /pacha/next-day` → contador de avances de la sesión (máx. 4)
- [ ] `DaySummary`: resumen del día a partir de `summary` (ingreso, gastos, interés, cuotas, cambio de score/estrés)
- [ ] `EventCard`: si hay `pending_events`, carta deslizable con ícono, título, descripción y 2–3 opciones
- [ ] `ChoiceOption`: al tocar → `POST /pacha/decisions/preview` → muestra `wallet_after`, `stress_after`, `warning`, `risk_level`
- [ ] Confirmar → `POST /pacha/decisions` → `QoriComment` con `outcome`
- [ ] Tras cada decisión: invalidar `playerState` y animar VitalBar

#### `S2.FE.02` · Banco ⭐ 🔗 `S2.DB.04`
- [ ] `SavingsPage`: 3 frascos (Meta con progreso a `goal_target`, Emergencias, Libre) + modal "Mover intis" → `POST /pacha/savings/transfer`
- [ ] Salida desde Emergencias: modal de fricción + `ConfirmHold` (mantener 2 s)
- [ ] `LoansPage`: deudas con barra pagado/total, tasa, cuota, `next_due_tick`
- [ ] `LoanPreview`: "Recibes ⵊ200. Pagarás ⵊ36 × 6 = ⵊ216. Regalas ⵊ16 al banco." + línea de tiempo de cuotas (cálculo solo visual)
- [ ] `CreditScoreGauge`: semicírculo 300–850 con color por zona
- [ ] Botones "Pedir préstamo" / "Pagar cuota" **deshabilitados** hasta que exista endpoint (§10)

#### `S2.FE.03` · Juego 1: El Kiosco ⭐ 🔗 `S2.BE.04`
- [ ] `kiosco.reducer.ts` + tests (compra, precio vs. demanda, servir, agotarse, performance)
- [ ] Fase 1 · Compra (30 s): 6 productos, presupuesto ⵊ50, carrito
- [ ] Fase 2 · Precios (20 s): slider por producto + indicador de demanda
- [ ] Fase 3 · Hora punta (90 s): clientes con pedido, tap para servir, se van a los 3 s, velocidad creciente
- [ ] Cierre de caja: ingresos − costos = utilidad, animado
- [ ] `POST /games/results` con `{score, items_sold, time_seconds, perfect}` → mostrar `message` y `reward`
- [ ] 375px portrait · 3 partidas seguidas sin bugs

#### `S2.FE.04` · Juego 2: La Trampa ⭐ ⚠️ definición pendiente (§10)
- [ ] `la-trampa.reducer.ts` + tests
- [ ] Implementar la versión que el equipo apruebe:
  - **A (PILOTO):** 3 deudas que crecen, repartir ⵊ40 por turno, victoria/derrota, replay con estrategia avalancha
  - **B (ALCANCE-MVP):** identificar estafas y ofertas engañosas
- [ ] `POST /games/results` con el payload acordado
- [ ] 3 partidas sin crash

#### FE-S2 · Integración con API real
- [ ] Apagar MSW por módulo a medida que el backend publique endpoints
- [ ] Reportar diferencias de contrato como issue: endpoint, request, response recibido vs. esperado

**Demo S2:** login → avanzar 3 días → evento → preview → decidir → jugar Kiosco → ver recompensa en la VitalBar.

---

### SPRINT 3 — Juegos y Qori (D8–D10)

**Objetivo:** 5 juegos jugables, Qori responde, tienda funcionando.

#### `S3.FE.04` · Hub de juegos + Tienda (primero: desbloquea la navegación) 🔗 `S2.DB.03`
- [ ] `GamesHub`: 5 cards (nombre, ícono, 1 línea, botón Jugar; estado "próximamente" si el juego no está listo)
- [ ] `ShopPage`: ítems de `GET /shop/items` con precio, `can_afford`, badge de cuotas
- [ ] `InstallmentBadge`: "ⵊ180 o 3 cuotas de ⵊ48 (total ⵊ144)" desde `installment_detail`
- [ ] Comprar → confirmación con total → `POST /shop/buy` → IntiFly + VitalBar

#### `S3.FE.03` · Chat con Qori ⭐ 🔗 `S3.BE.01`
- [ ] `QoriAvatar` flotante (abajo a la derecha, sobre el bottom nav)
- [ ] `ChatWindow` tipo sheet (~80% de la altura en mobile)
- [ ] `ChatBubble` usuario (derecha, fucsia) / Qori (izquierda, crema)
- [ ] `ChatInput` que no quede tapado por el teclado en iOS
- [ ] `ActionButtons` fijos: "¿Cómo funciona el interés?", "¿Ahorro o pago deuda?", "Explícame mi estrés", "¿Cómo subo mi score?"
- [ ] Indicador "..." mientras responde; 429 → mensaje amable ("Dame un respiro 🦊")
- [ ] Historial solo en memoria de la sesión

#### `S3.FE.01` · Juego 3: Invierte o Pierde
- [ ] Reducer + tests con RNG inyectable (tests deterministas)
- [ ] 6 rondas, ⵊ100, 4 frascos (Conservador, Balanceado, Arriesgado, Primo)
- [ ] La distribución debe sumar el capital disponible
- [ ] Ronda 3: crisis · Ronda 5: el primo pide más plata (estafa)
- [ ] Gráfica acumulada (Recharts) + pantalla final vs. 100% conservador / 100% arriesgado
- [ ] `POST /games/results` con `{final_value, diversification_score, fell_for_scam}`

#### `S3.FE.02` · Juegos 4 y 5: Mercado Rápido + Qori Quiz
- [ ] **Qori Quiz** (primero, es el más barato): 10 dilemas, 3 opciones, feedback ✅/❌ + explicación, progreso "3 de 10", score 0–100 + `weakest_topic`
- [ ] **Mercado Rápido:** 5 rondas de 30 s, 6 cards, mantener presionado revela el valor real, 1 producto trampa por ronda, resultado con margen
- [ ] Ambos en 375px, 3 partidas sin bugs

**Demo S3:** 5 juegos desde el hub + Qori contestando sobre el estado del alumno + compra en cuotas.

---

### SPRINT 4 — Pulido y entrega (D11–D14)

**Objetivo:** estable, bonito y listo para mostrárselo a un director desde el celular.

#### `S4.FE.03` · Ranking, Perfil y Misiones 🔗 `S2.DB.02`, `S2.DB.04`
- [ ] `RankingPage`: podio top 3, lista, mi posición destacada, liga con nombre quechua + `league_icon`
- [ ] `ProfilePage`: alias, liga, score, credit score, días jugados, gráfica de score (histórico local si no hay endpoint)
- [ ] `MissionsPage`: `GET /missions`, barra de progreso, "Reclamar" → `POST /missions/{id}/claim` → animación de recompensa

#### `S4.FE.01` · Onboarding + pulido visual
- [ ] 3 slides deslizables + selector de meta (laptop ⵊ900 / celular ⵊ350 / bici ⵊ200 / curso ⵊ150) + "Empezar mi vida"
- [ ] Solo en el primer ingreso (`current_tick === 0`)
- [ ] Favicon, meta tags `og:*` (vista previa en WhatsApp)
- [ ] IntiFly en compras y cobros; slide-in de eventos

#### `S4.FE.04` · Estados especiales
- [ ] Resumen consolidado si se avanzan varios días seguidos ("En los últimos 3 días…")
- [ ] Empty states: ranking, misiones, deudas, historial
- [ ] Error: toast de Qori sin romper la app + `ErrorBoundary` por ruta
- [ ] Skeletons en Home, Banco y Ranking

#### `S4.FE.02` · Responsive + accesibilidad
- [ ] Todas las pantallas en 375px y 412px sin scroll horizontal
- [ ] Touch targets ≥ 44 px; tab activa marcada
- [ ] Contraste AA en texto sobre crema y sobre cards
- [ ] Deuda: color + ⚠ + texto en todas partes
- [ ] Prueba en iPhone (Safari) + Android (Chrome) reales

#### FE-S4 · Entrega
- [ ] Build de producción con `VITE_USE_MOCKS=false`
- [ ] Smoke test en 3 dispositivos
- [ ] Capturas + video de 2 min para el colegio

**Demo final:** registro → onboarding → 10 días → 5 juegos → Qori → ranking, en un celular real.

---

## 6. Cronograma día a día

| Día | Trabajo | Entregable |
|---|---|---|
| D1 | Setup Vite/Tailwind/Router · FE-00 tipos · deploy vacío a Vercel | URL pública viva |
| D2 | Design system + MSW + Login/Registro + GameLayout | Login con mocks |
| D3 | IntiAmount, VitalBar, IntiFly · **Demo S1** | VitalBar en el celular |
| D4 | Home + Avanzar día + DaySummary | Loop de días (mock) |
| D5 | EventCard + preview + decisión · inicio del Kiosco (reducer) | Eventos jugables |
| D6 | Banco (frascos, fricción, deudas, gauge) · Kiosco fases 1–2 | Banco completo |
| D7 | Kiosco fase 3 + cierre · La Trampa · integración real · **Demo S2** | 2 juegos |
| D8 | Hub + Tienda · Qori Quiz | 3 juegos |
| D9 | Chat Qori · Invierte o Pierde | Chat vivo |
| D10 | Mercado Rápido · **Demo S3** | 5 juegos |
| D11 | Ranking + Misiones + Perfil | Pantallas sociales |
| D12 | Onboarding + estados especiales | Flujo de primer ingreso |
| D13 | Responsive + a11y + pulido de animaciones | App lista para móvil |
| D14 | Smoke test en dispositivos, video, fixes · **Entrega** | Piloto entregado |

> La carga FE es la más alta del equipo (16 tareas + 5 juegos). Los días 7, 10 y 13 son los primeros que se sacrifican si algo se retrasa.

---

## 7. Contenido que el FE necesita (nadie lo tiene asignado en SPRINTS)

En PILOTO-2-SEMANAS lo escribía P3, pero en SPRINTS no tiene dueño. Hasta que alguien lo asuma, vive en archivos `*.data.ts` dentro de cada juego, para poder moverlo luego a `content/`:

- [ ] Kiosco: 6 productos con costo mayorista, stock, precio sugerido y demanda base
- [ ] La Trampa: deudas iniciales (versión A) **o** casos de estafa/oferta (versión B)
- [ ] Invierte o Pierde: parámetros de los 4 frascos y textos de los eventos de ronda 3 y 5
- [ ] Mercado Rápido: catálogo de productos con valor real y rangos de precio
- [ ] Qori Quiz: **10 dilemas** (interés compuesto, inflación, estafas, presupuesto, ahorro, deuda, seguros, inversión, presión social, comparar precios) con explicación de 1 línea
- [ ] Onboarding: textos de los 3 slides
- [ ] Mensajes de Qori para toasts, errores y estados vacíos

---

## 8. Estrategia de integración

1. **D1–D6:** todo contra MSW, con fixtures copiados del contrato.
2. Cada vez que el backend confirme un endpoint en producción/local, se apaga su handler en MSW (flag por módulo).
3. Los errores del backend (400/409) muestran su `message` al alumno. Por eso se pide al BE que los mensajes sean aptos para menores.
4. Tras cualquier mutación (`next-day`, `decisions`, `transfer`, `buy`, `games/results`, `claim`): invalidar `playerState` en TanStack Query y reconciliar la VitalBar con `new_state` cuando venga en la respuesta.

---

## 9. Riesgos y orden de recorte

| Riesgo | Plan B |
|---|---|
| No alcanzan los 5 juegos | Orden de prioridad: **Kiosco > La Trampa > Qori Quiz > Invierte o Pierde > Mercado Rápido**. ALCANCE-MVP pide mínimo 3. Los no terminados aparecen como "Próximamente" en el hub |
| Endpoint del backend retrasado | Seguir con MSW; la pantalla se entrega igual y se conecta después |
| El contrato cambia a mitad de sprint | Solo se cambia en `types/` + fixture; TypeScript señala todos los usos |
| iOS Safari (teclado, audio, 100vh) | Usar `100dvh`; audio solo tras interacción; probar en iPhone desde D7 |
| Animaciones lentas en Android gama media | Animar solo `transform`/`opacity`; respetar `prefers-reduced-motion` |

**Si hay que recortar, en este orden:** sonidos → IntiFly → gráfica del Perfil → Mercado Rápido → Invierte o Pierde → onboarding animado.
**No se recorta:** VitalBar, Avanzar día, eventos con preview, Banco, Kiosco, Qori, Ranking.

---

## 10. Preguntas abiertas para el equipo (resolver en el sync de D1–D2)

1. **La Trampa:** ¿puzzle de deudas (PILOTO) o detección de estafas (ALCANCE-MVP)? Define el payload de `/games/results`.
2. **Préstamos:** el contrato no tiene endpoint para **pedir préstamo** ni **pagar cuota**. ¿Se agregan (`POST /pacha/loans`, `POST /pacha/loans/{id}/pay`) o esas acciones solo existen dentro de eventos?
3. **Onboarding:** ¿endpoint para fijar `goal_item` / `goal_target`, o se crea con valores por defecto al registrarse?
4. **Límite de 4 días:** ¿por sesión del JWT, por día real, o lo controla el backend (y el FE solo muestra el mensaje)?
5. **Eventos pendientes:** `pending_events` devuelve solo IDs. ¿Viene la carta completa en `next-day` o hace falta `GET /pacha/events/{id}`?
6. **Historial de score:** ¿endpoint para la gráfica del Perfil o se guarda en local?
7. **Payloads de juegos 3–5:** confirmar que siguen el formato de SPRINTS (`S3.BE.03`).
8. **Base de la rama:** `feat/frontend` salió de `main`, pero el equipo integra en `develop`. Conviene traer `develop` a esta rama antes de empezar para tener `docs/api/` y la estructura actual.

---

## 11. Definición de terminado del frontend

- [ ] URL de Vercel abre en un celular y funciona contra el backend real (sin mocks)
- [ ] Registro → login → onboarding → avanzar días → eventos con preview → decisiones reflejadas en la VitalBar
- [ ] Banco: 3 frascos con transferencia y fricción; deudas visibles
- [ ] Tienda con contado y cuotas
- [ ] ≥ 3 juegos (meta: 5) jugables que envían su resultado y muestran la recompensa
- [ ] Qori responde desde el chat
- [ ] Ranking y misiones funcionando
- [ ] Sin crashes en el flujo completo; errores mostrados con toast
- [ ] 375px y 412px sin overflow; targets ≥ 44 px; deuda nunca solo con color
- [ ] `npm run build` y `npm run lint` sin errores; tests de los reducers de juegos pasando
