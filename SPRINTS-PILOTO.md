# 🏃 RIQCHARIY — Plan de Sprints del Piloto
### 4 sprints · 2 semanas · 4 perfiles · cada tarea con código, responsable y DoD

---

## PERFILES DEL EQUIPO

| Código | Perfil | Foco principal |
|---|---|---|
| **BE** | Backend & IA | FastAPI, motor Pacha, lógica de negocio, chatbot Qori, RAG, prompts |
| **DB** | Base de Datos & Integraciones | PostgreSQL, Redis, migraciones, pgvector, deploy Render, CI, integraciones entre servicios |
| **FE** | Frontend | React, Tailwind, componentes UI, pantallas, minijuegos, UX mobile |
| **QA** | Testing & Calidad | Tests funcionales, pruebas de integración, playtest de juegos, balance, documentación de bugs |

---

## CONVENCIONES

- **Código de tarea:** `S{sprint}.{perfil}.{número}` → ejemplo: `S1.BE.01`
- **DoD (Definition of Done):** cada tarea lista exactamente qué debe cumplirse para marcar como terminada. Si falta 1 criterio, la tarea no está done.
- **Duración de sprints:** S1 y S2 = 3.5 días hábiles · S3 y S4 = 3.5 días hábiles
- **Ceremonia mínima:** 15 min de sync diario (¿qué hice? ¿qué bloquea?) + demo de 30 min al cerrar cada sprint
- **Bloqueos:** si una tarea depende de otra que no está lista, usar datos mock y documentar la dependencia

---

## SPRINT 1 — "CIMIENTOS"
**Días 1–3 · Objetivo: que el repo, la BD, la API base y el shell del frontend existan y se comuniquen**

---

### BE — Backend & IA

#### `S1.BE.01` — Setup del proyecto FastAPI y estructura del backend
**Responsable:** BE
**Descripción:** Crear el proyecto FastAPI con la estructura de carpetas del monorepo. Configurar `pyproject.toml` con dependencias base (FastAPI, uvicorn, SQLAlchemy, alembic, pydantic, python-jose, bcrypt, httpx). Crear `app/main.py` con health check, CORS middleware y montaje de routers vacíos.
**DoD:**
- `uvicorn app.main:app` levanta sin errores en local
- `GET /health` devuelve `{ "status": "ok", "version": "0.1.0" }`
- CORS configurado para aceptar `http://localhost:5173` (dev) y la URL de Vercel (prod) desde variable de entorno
- Estructura de carpetas: `app/core/`, `app/modules/auth/`, `app/modules/pacha/`, `app/modules/game/`, `app/modules/chatbot/` creadas con `__init__.py`
- `pyproject.toml` con todas las dependencias y configuración de ruff

#### `S1.BE.02` — Módulo de autenticación (auth)
**Responsable:** BE
**Descripción:** Implementar registro y login simples. JWT con expiración de 24h. Sin OAuth, sin refresh token — lo mínimo para proteger endpoints.
**DoD:**
- `POST /auth/register` acepta `{ email, password, name, classroom_code }` → crea usuario → devuelve `{ token, user }`
- `POST /auth/login` acepta `{ email, password }` → valida → devuelve `{ token, user }`
- Contraseñas hasheadas con bcrypt (nunca en plano en BD)
- Middleware `get_current_user` que extrae y valida el JWT del header `Authorization: Bearer {token}`
- Endpoint protegido de prueba: `GET /auth/me` devuelve el usuario actual
- Errores claros: 401 si token inválido/expirado, 409 si email duplicado, 422 si datos incompletos

#### `S1.BE.03` — Dominio del motor Pacha: estado y funciones puras
**Responsable:** BE
**Descripción:** Definir el agregado raíz `PlayerEconomy` como dataclass/Pydantic model (cero dependencia de SQLAlchemy). Implementar las primeras 3 funciones puras: `income_system`, `expense_system` y `stress_system`. Sin persistencia — operan sobre el modelo en memoria.
**DoD:**
- `PlayerEconomy` definido con todos los campos del spec (wallet, savings, loans, stress, score, etc.)
- `income_system(state, balance, tick) → state` — si es día de pago (tick % 7 == 0), suma sueldo a wallet
- `expense_system(state, balance, tick) → state` — resta gastos fijos diarios (comida/28, celular/28, pasajes/28)
- `stress_system(state, balance) → state` — recalcula estrés con la fórmula del GDD (4 factores ponderados)
- Tests unitarios para las 3 funciones: ≥5 tests, incluyen caso de día de pago, día normal, estrés alto y estrés bajo
- Las funciones NO importan SQLAlchemy ni ninguna dependencia de I/O

#### `S1.BE.04` — Contrato de API: tipos TypeScript compartidos
**Responsable:** BE (con revisión de FE)
**Descripción:** Escribir el archivo `frontend/src/types/` con todos los tipos que usará el frontend. Este es el acuerdo entre backend y frontend — se escribe el día 1 y se respeta.
**DoD:**
- `types/economy.ts` con `PlayerEconomy`, `Loan`, `DaySummary`, `EventCard`, `EventChoice`
- `types/api.ts` con los tipos de request/response de cada endpoint
- `types/game.ts` con `GameResult` y los tipos específicos de cada juego
- `types/user.ts` con `User`, `LoginRequest`, `LoginResponse`
- Archivo revisado y aprobado por FE (ambos confirman que los tipos son correctos)

---

### DB — Base de Datos & Integraciones

#### `S1.DB.01` — Docker Compose y entorno de desarrollo local
**Responsable:** DB
**Descripción:** Crear `docker-compose.yml` con PostgreSQL 16 y Redis 7. Crear `Makefile` con los comandos del equipo. Verificar que todo levanta con un solo comando.
**DoD:**
- `make up` levanta Postgres (puerto 5432) y Redis (puerto 6379) sin errores
- `make down` apaga y limpia volúmenes
- `make logs` muestra logs de todos los contenedores
- `.env.example` con todas las variables necesarias (DATABASE_URL, REDIS_URL, JWT_SECRET, ANTHROPIC_API_KEY)
- `.gitignore` configurado (no sube `.env`, `__pycache__`, `node_modules`, `.venv`)
- `README.md` con instrucciones de setup en ≤5 pasos

#### `S1.DB.02` — Modelos SQLAlchemy y primera migración
**Responsable:** DB
**Descripción:** Traducir los modelos del dominio a tablas SQL. Configurar Alembic. Correr la primera migración.
**DoD:**
- Tabla `users`: id (UUID), email (unique), password_hash, name, classroom_code, role, created_at
- Tabla `player_economy`: player_id (FK→users), version (int), wallet, savings_goal, savings_emergency, savings_free, job_id, job_performance, wage_per_period, loans (JSONB), credit_score, stress, current_tick, score, league, goal_item, goal_target, goal_saved, inventory (JSONB), flags (JSONB), created_at, updated_at
- Tabla `economy_events`: id, player_id (FK), tick, event_type, event_data (JSONB), created_at (append-only log)
- Alembic inicializado y primera migración generada
- `make migrate` ejecuta `alembic upgrade head` sin errores
- Índices: `player_economy.player_id` (PK), `economy_events(player_id, tick)`

#### `S1.DB.03` — Script de seed y datos iniciales
**Responsable:** DB
**Descripción:** Crear script que puebla la BD con datos de prueba. Cargar el `balance.yaml` y los eventos JSON. Crear un "classroom" de prueba con 10 alumnos.
**DoD:**
- `make seed` crea: 1 aula con código "RIQCHARIY-DEMO", 10 alumnos con emails `alumno1@demo.pe` a `alumno10@demo.pe` (password: `demo1234`), cada uno con su `player_economy` inicial (wallet=0, savings=0, tick=0, score=550, league=chaski)
- `content/balance.yaml` parseado y accesible desde el backend como diccionario
- `content/events/*.json` cargados y validados (15 eventos con el schema correcto)
- Si se corre 2 veces, no duplica datos (idempotente)
- `make reset` borra todo y re-crea (para desarrollo)

#### `S1.DB.04` — Deploy inicial a Render (que el URL exista)
**Responsable:** DB
**Descripción:** Configurar Render con el backend FastAPI, crear la base de datos Postgres en Render y el Redis en Upstash. Verificar que el health check responde desde internet.
**DoD:**
- Web Service creado en Render apuntando al monorepo (root: `backend/`)
- `https://riqchariy-api.onrender.com/health` devuelve `{ "status": "ok" }`
- Postgres creado en Render, `DATABASE_URL` configurada en env vars
- Redis creado en Upstash, `REDIS_URL` configurada en env vars
- Variables de entorno: JWT_SECRET, CORS_ORIGINS, ENVIRONMENT=production
- Alembic migration corrida en producción (BD con tablas vacías listas)

---

### FE — Frontend

#### `S1.FE.01` — Setup del proyecto React y design system base
**Responsable:** FE
**Descripción:** Crear el proyecto con Vite + React + TypeScript + Tailwind. Configurar la paleta de Riqchariy como tokens de diseño. Crear los componentes base del design system.
**DoD:**
- `npm run dev` levanta en `localhost:5173` sin errores
- `tailwind.config.ts` con la paleta completa: crema (#FAF6EF), fucsia (#D62E6C), dorado (#F2A81D), verde (#2E9E6B), rojo (#C4472F), turquesa (#2AA8A0), morado (#7B3FA0), oscuro (#141B2E)
- Tipografía: Fredoka (display/títulos) e Inter (UI/cuerpo) importadas y configuradas
- Componentes base creados y renderizables: `RButton` (variantes: primary, secondary, danger, ghost), `RCard`, `RModal`, `RBadge`, `RInput`
- `tokens.css` con variables CSS de espaciado, radios y sombras
- `cn.ts` (utilidad clsx + tailwind-merge) funcional

#### `S1.FE.02` — Layout, navegación y pantalla de login
**Responsable:** FE
**Descripción:** Crear el layout principal de la app (GameLayout con VitalBar + bottom nav). Implementar React Router con las rutas base. Crear la pantalla de login funcional (UI solamente, sin API todavía — usar mock).
**DoD:**
- `GameLayout.tsx`: barra vital arriba (placeholder con datos mock) + bottom nav con 5 tabs (Home, Banco, Juegos, Ranking, Qori) + contenido central con `<Outlet />`
- React Router configurado con rutas: `/login`, `/`, `/bank`, `/games`, `/ranking`, `/chatbot`, `/profile`, `/shop`
- `RequireAuth` guard que redirige a `/login` si no hay token en localStorage
- `LoginPage.tsx` con formulario (email + password + botón) que funciona con datos mock (guarda un token falso en localStorage y redirige a `/`)
- Responsive: bottom nav se ve correctamente en 375px de ancho
- Transición entre páginas sin parpadeo blanco

#### `S1.FE.03` — Componentes de dinero y VitalBar real
**Responsable:** FE
**Descripción:** Construir los componentes que muestran el estado financiero del alumno. La VitalBar es lo más importante del frontend — siempre visible, siempre actualizada.
**DoD:**
- `IntiAmount.tsx`: muestra un monto con el símbolo ⵊ, fuente tabular (los números se alinean), color verde si positivo / rojo si negativo, animación de cambio cuando el valor se actualiza
- `WalletBar.tsx` (la VitalBar): 4 secciones horizontales → Billetera (ⵊ), Ahorros (ⵊ), Deuda (ⵊ, rojo + ícono ⚠), Estrés (barra 0–100%). Se alimenta de `PlayerEconomy` via props o context
- `IntiFly.tsx`: animación de una moneda/número que "vuela" de un punto a otro (para cuando el dinero se mueve entre billetera y ahorro, por ejemplo). Puede ser Framer Motion o CSS animation
- Los 3 componentes renderizan correctamente con datos mock en la VitalBar del GameLayout
- Estrés > 60% cambia el color de la barra a ámbar; > 80% a rojo
- Accesibilidad: deuda comunicada con ícono ⚠ además del color rojo

#### `S1.FE.04` — Deploy inicial a Vercel
**Responsable:** FE
**Descripción:** Conectar el repo a Vercel, configurar el build y verificar que la app se ve en una URL pública.
**DoD:**
- Vercel conectado al repo, root directory: `frontend/`
- Build exitoso con `npm run build`
- URL pública accesible (ej: `riqchariy.vercel.app`)
- Variable de entorno `VITE_API_URL` configurada (apuntando a Render)
- La página de login se ve correctamente en la URL pública
- Push a `main` dispara deploy automático

---

### QA — Testing & Calidad

#### `S1.QA.01` — Setup de herramientas de testing
**Responsable:** QA
**Descripción:** Configurar pytest para el backend y Vitest para el frontend. Crear los primeros archivos de configuración, fixtures base y factories.
**DoD:**
- `make test` ejecuta pytest y vitest en secuencia sin errores
- Backend: `pytest.ini` o sección en `pyproject.toml` configurada, `tests/conftest.py` con fixture de BD en memoria (SQLite) y fixture de client de test (TestClient de FastAPI)
- Backend: `tests/factories/` con `UserFactory` y `PlayerEconomyFactory` usando factory_boy o funciones simples
- Frontend: Vitest configurado en `vite.config.ts`, primer archivo `src/core/utils/format.test.ts` con 3 tests de la función de formateo de intis
- Informe de cobertura funcional: `make test-cov` muestra porcentaje

#### `S1.QA.02` — Tests del contrato de API y modelos de BD
**Responsable:** QA
**Descripción:** Verificar que los endpoints de auth funcionan, que los modelos de BD se crean correctamente y que el seed corre sin problemas.
**DoD:**
- Test de registro: `POST /auth/register` con datos válidos → 201, con email duplicado → 409, sin password → 422
- Test de login: con credenciales correctas → 200 + token válido, con credenciales incorrectas → 401
- Test de `GET /auth/me`: con token válido → 200 + datos del usuario, sin token → 401
- Test del seed: el script de seed corre sobre BD vacía sin errores y crea exactamente 10 alumnos + 10 player_economies
- Todos los tests pasan con `make test`

#### `S1.QA.03` — Tests unitarios del motor Pacha (funciones puras)
**Responsable:** QA
**Descripción:** Testear las 3 funciones puras que BE entregó (income, expense, stress). Estas funciones son el corazón del producto — los tests deben cubrir los edge cases.
**DoD:**
- `income_system`: test de día de pago (tick 7, 14, 21, 28), test de día normal (no paga), test con performance 0.8 vs 1.2 (sueldo varía), test de que wallet no baja de 0
- `expense_system`: test de un día normal (resta proporcional de comida+celular+pasajes), test de que si wallet < gasto, wallet queda en 0 (no en negativo — la deuda se registra aparte)
- `stress_system`: test con 0 deuda y fondo de emergencia → estrés bajo, test con deuda alta y sin fondo → estrés alto, test de que estrés siempre está entre 0 y 1
- ≥12 tests en total, todos pasan

---

### 📋 Demo Sprint 1 (final del día 3)
**Lo que se muestra:** backend con auth funcionando + BD con seed + frontend con login + VitalBar con datos mock + ambos deployados en URLs públicas. Los 3 (o 4) pueden hacer login en su celular y ver la pantalla vacía del home con la barra vital.

---
---

## SPRINT 2 — "EL MOTOR VIVE"
**Días 4–7 · Objetivo: el motor procesa días, los eventos llegan, los primeros 2 juegos funcionan, el alumno puede jugar**

---

### BE — Backend & IA

#### `S2.BE.01` — Pipeline completo de "Siguiente día" y sistema de crédito
**Responsable:** BE
**Descripción:** Implementar los systems faltantes (credit, savings, goals, scoring) y orquestarlos en el pipeline de `POST /pacha/next-day`. Implementar el sistema de crédito completo (préstamos, cuotas, mora, credit score).
**DoD:**
- `credit_system`: cobra cuotas en su fecha, marca mora si no hay saldo, aplica interés moratorio, actualiza credit score (+8 puntual, −40 mora)
- `savings_system`: aplica 4% de interés cada 28 ticks
- `goals_system`: verifica si goal_saved ≥ goal_target y marca flag
- `scoring_system`: calcula Score Financiero (fórmula de 5 componentes, 0–1000)
- `pipeline.py`: ejecuta los 8 systems en orden fijo → devuelve `DaySummary`
- `POST /pacha/next-day` funcional: avanza 1 tick, persiste estado + evento en BD, devuelve estado nuevo + resumen + evento si aplica
- Límite de 4 avances por sesión (evitar que alguien avance 100 días de golpe)

#### `S2.BE.02` — Sistema de decisiones con preview
**Responsable:** BE
**Descripción:** Implementar `POST /pacha/decisions` (BUY_ITEM, SAVE, TAKE_LOAN, PAY_LOAN, TRANSFER_SAVINGS, RESPOND_EVENT) y `POST /pacha/decisions/preview` que simula sin persistir.
**DoD:**
- 6 tipos de decisión implementados con sus validaciones (no puedes comprar sin saldo, no puedes pedir préstamo si excedes el límite, etc.)
- `preview` usa exactamente la misma función que `decisions` pero en una transacción que hace rollback (o sobre una copia en memoria)
- Cada decisión genera un registro en `economy_events` con tipo, datos y tick
- Errores claros: 400 con mensaje descriptivo si la decisión no es válida ("No tienes ⵊ180 en tu billetera")
- El preview devuelve `{ projected_state, impacts: [{field: "wallet", change: -180}, {field: "stress", change: -0.05}] }`

#### `S2.BE.03` — Motor de eventos contextuales
**Responsable:** BE
**Descripción:** Implementar el engine que decide qué evento disparar en cada tick, basado en probabilidades contextuales y cooldowns.
**DoD:**
- Carga los 15 eventos del JSON al iniciar
- En cada `next-day`, calcula probabilidad ajustada de cada evento (base × modificadores del estado del alumno)
- Usa RNG con seed `hash(player_id, tick)` para determinismo
- Máximo 1 evento por día, máximo 1 evento negativo fuerte cada 7 ticks (cooldown)
- Si dispara evento, lo devuelve como `EventCard` en la respuesta de `next-day`
- Cada evento disparado se registra en `economy_events`
- Test: dado un seed fijo, el mismo alumno en el mismo tick siempre recibe el mismo evento

#### `S2.BE.04` — Endpoint de resultados de juegos
**Responsable:** BE
**Descripción:** Implementar `POST /games/results` que recibe el resultado de un minijuego, valida que sea plausible y traduce el resultado en efectos sobre el motor.
**DoD:**
- Acepta `{ game_id, result_data }` donde `game_id` ∈ `[kiosco, la_trampa, invierte_o_pierde, mercado_rapido, qori_quiz]`
- Kiosco: recibe `{ performance: 0.85 }` → actualiza `job_performance` del alumno → recalcula `wage_per_period`
- La Trampa: recibe `{ turns_to_win, total_interest_paid }` → suma puntos al score de manejo de deuda
- Anti-trampa básica: performance ∈ [0, 1], turns_to_win > 0, rechaza requests muy frecuentes (max 1 resultado por juego cada 60s)
- Devuelve `{ effects_applied, new_state }`

---

### DB — Base de Datos & Integraciones

#### `S2.DB.01` — Repositorios del motor y transacciones
**Responsable:** DB
**Descripción:** Implementar los repositorios que persisten el estado del motor. Todo el pipeline de un tick debe guardarse en una sola transacción atómica.
**DoD:**
- `StateRepository.save(player_economy)` guarda estado con optimistic locking (verifica `version` antes de escribir, incrementa en +1)
- `EventLogRepository.append(player_id, tick, event_type, event_data)` inserta en `economy_events` (append-only, nunca update/delete)
- El pipeline de `next-day` ejecuta `save` + `append` dentro de una sola transacción (si falla una, falla todo)
- Si dos requests intentan avanzar el mismo día al mismo tiempo, uno falla con 409 Conflict (idempotencia por tick)
- Test de concurrencia: dos requests simultáneos para el mismo alumno → solo uno tiene éxito

#### `S2.DB.02` — Redis para leaderboard
**Responsable:** DB
**Descripción:** Implementar el ranking del aula usando Redis sorted sets. Endpoint `GET /leaderboard`.
**DoD:**
- Cada vez que se actualiza el `score` de un alumno, se escribe en Redis: `ZADD classroom:{code} {score} {player_id}`
- `GET /leaderboard` devuelve `{ players: [{name, score, league, rank}], my_rank: N }` ordenado por score descendente
- Liga calculada a partir del score (chaski 0–300, qollqa 301–550, amauta 551–750, apu 751–1000)
- Funciona con Upstash Redis en producción (verificar la conexión)
- Si Redis está caído, el endpoint devuelve los scores desde Postgres (fallback)

#### `S2.DB.03` — Endpoint de tienda y migración de ítems
**Responsable:** DB
**Descripción:** Implementar `GET /shop/items` que devuelve los ítems de la tienda con precios (desde `balance.yaml`). Implementar la lógica de compra como decisión del motor.
**DoD:**
- `GET /shop/items` devuelve los 12 ítems del `balance.yaml` con: id, nombre, precio, categoría, stress_reduction
- Si hay inflación activa (flag en world_state), los precios se multiplican ×1.1
- Opción de cuotas: cada ítem ofrece precio contado y precio en cuotas (calculado con tasa del 8%)
- La compra se procesa como `POST /pacha/decisions { type: "BUY_ITEM", item_id, payment: "cash"|"installments" }`
- Test: comprar un ítem al contado reduce wallet, comprar en cuotas crea un loan en la lista de loans

#### `S2.DB.04` — Misiones y frascos de ahorro
**Responsable:** DB
**Descripción:** Implementar los endpoints de misiones semanales y transferencias entre frascos de ahorro.
**DoD:**
- `GET /missions` devuelve 3 misiones hardcodeadas con progreso actual: "Ahorra ⵊ30 esta semana", "Juega 2 minijuegos", "Mantén estrés bajo 0.5"
- `POST /missions/{id}/claim` verifica que la misión se cumplió → aplica recompensa (ⵊ bonus) → marca como reclamada
- `POST /pacha/savings/transfer { from_jar, to_jar, amount }` mueve intis entre frascos. Si `from_jar == "emergency"`, requiere confirmación (el frontend la maneja, el backend verifica un flag `confirmed: true`)
- Test: transferir de emergency sin `confirmed: true` → 400

---

### FE — Frontend

#### `S2.FE.01` — HomePage "Mi Vida" y pantalla de eventos
**Responsable:** FE
**Descripción:** Construir la pantalla principal con las cards de acceso rápido y el botón "Avanzar día". Construir la pantalla de decisión de eventos (las cartas deslizables).
**DoD:**
- `HomePage.tsx`: grid de cards con ícono (Billetera, Banco, Trabajo, Tienda, Ranking, Qori) + WorldTicker ("Día 87 · ⵊ45 en billetera") + botón prominente "▶ Avanzar día" que llama a `POST /pacha/next-day`
- `AbsenceSummary.tsx`: después de avanzar el día, muestra resumen en formato periódico ("Cobraste ⵊ60 · Pagaste ⵊ6 de comida · Tu ahorro creció +ⵊ0.42")
- `EventCard.tsx`: si el día trajo un evento, aparece como carta deslizable con: ilustración/ícono, título, descripción, 2–3 opciones
- `ChoiceOption.tsx`: cada opción muestra el preview de impacto (flechitas ↑↓) al tocarla, conectada a `POST /pacha/decisions/preview`
- `QoriComment.tsx`: después de decidir, burbuja de Qori con 1 línea de comentario
- VitalBar se actualiza con animación tras cada decisión (los números cambian suavemente)

#### `S2.FE.02` — Pantallas del Banco (ahorros, préstamos, frascos)
**Responsable:** FE
**Descripción:** Las pantallas bancarias son el corazón pedagógico del UI — aquí el alumno entiende su dinero.
**DoD:**
- `SavingsPage.tsx`: 3 frascos visuales (Meta, Emergencias, Libre) con barra de llenado + botón "Mover intis" que abre modal de transferencia
- Frasco de Emergencias: si el alumno intenta sacar dinero, modal de fricción ("¿Seguro? Este frasco te protege") con botón que requiere mantener presionado 2s (`ConfirmHold.tsx`)
- `LoansPage.tsx`: lista de deudas activas con barra de progreso (pagado vs. total) + tasa visible + próxima cuota. Botón "Pagar cuota" → preview → confirmar
- `LoanPreview.tsx`: la pantalla estrella → "Recibes ⵊ200. Pagarás ⵊ36/mes × 6 = ⵊ216 total. Regalas ⵊ16 al banco." con timeline visual de las cuotas
- `CreditScoreGauge.tsx`: medidor semicircular 300–850, color por zona

#### `S2.FE.03` — Juego 1: El Kiosco (completo)
**Responsable:** FE
**Descripción:** Implementar el minijuego del Kiosco como componente React fullscreen. Las 3 fases (compra, precios, hora punta) + cierre de caja.
**DoD:**
- Fase 1 (Compra): grid de 6 productos con precio y stock, presupuesto de ⵊ50, carrito visual, timer de 30s
- Fase 2 (Precios): slider por producto comprado, indicador de demanda que baja al subir precio
- Fase 3 (Hora punta): clientes aparecen con pedidos, tap para servir, timer de 90s, velocidad progresiva, productos se agotan
- Cierre de caja: animación de ingresos − costos = utilidad, performance calculado (0–1)
- Al terminar: `POST /games/results` con el performance
- Responsive: funciona en 375px de ancho (portrait)
- Se puede jugar 3 veces seguidas sin bugs

#### `S2.FE.04` — Juego 2: La Trampa (completo)
**Responsable:** FE
**Descripción:** El puzzle de asignación de pagos a deudas.
**DoD:**
- Setup: 3 deudas con barras que crecen visualmente (rojo = tasa alta, crece rápido)
- Cada turno: sliders para distribuir ⵊ40 entre las 3 deudas, total de pago = exactamente ⵊ40
- Las barras crecen al dar "Siguiente turno" si no se pagó suficiente (interés visible)
- Victoria: confetti cuando las 3 barras llegan a 0
- Derrota (deuda > 500): pantalla de "la deuda te alcanzó" + botón "¿Qué hubiera pasado?" con la estrategia avalancha explicada
- Al terminar: `POST /games/results` con `{ turns_to_win, strategy_used, total_interest_paid }`
- ≥3 playthroughs sin crash

---

### QA — Testing & Calidad

#### `S2.QA.01` — Tests del pipeline de next-day
**Responsable:** QA
**Descripción:** Testear el flujo completo de avanzar un día, verificando que todos los systems corren en orden y producen el estado esperado.
**DoD:**
- Test de día normal sin evento: wallet baja por gastos, savings no cambian, estrés se recalcula
- Test de día de pago: wallet sube exactamente el sueldo correcto
- Test con préstamo activo: cuota se cobra, si no hay saldo → mora → credit_score baja 40 puntos
- Test de día con evento: verificar que el evento devuelto es válido y coincide con el seed
- Test de idempotencia: avanzar el mismo tick 2 veces → el segundo falla con 409
- Test del límite de 4 avances por sesión
- ≥8 tests, todos pasan

#### `S2.QA.02` — Tests de integración frontend ↔ backend
**Responsable:** QA
**Descripción:** Verificar que el frontend puede hacer login, obtener el estado y avanzar un día contra el backend real (no mocks).
**DoD:**
- Test manual documentado (checklist): login con alumno1@demo.pe → ver estado → avanzar día → ver resumen → avanzar hasta evento → decidir → verificar que wallet cambió
- Si hay un bug de integración (campo con nombre diferente, tipo incompatible), reportarlo como issue con: endpoint, request enviado, response recibido, response esperado
- Verificar en desktop y en celular (Chrome DevTools mobile)
- Documento: `docs/test-manual-sprint2.md` con el checklist y resultados

#### `S2.QA.03` — Playtest de los 2 primeros juegos
**Responsable:** QA
**Descripción:** Jugar el Kiosco y La Trampa como lo haría un alumno de 14 años. Reportar bugs, problemas de UX y balance.
**DoD:**
- Kiosco jugado 5 veces. Reportar: ¿se entiende qué hacer sin instrucciones? ¿El timer es justo? ¿La dificultad escala bien? ¿El cierre de caja se entiende?
- La Trampa jugada 5 veces. Reportar: ¿se puede ganar? ¿Se puede perder? ¿El replay alternativo enseña? ¿Las barras de deuda son claras?
- Bugs reportados como issues con: descripción, pasos para reproducir, screenshot/video, severidad (bloquea / molesta / cosmético)
- Balance: ¿el sueldo alcanza? ¿La deuda con el prestamista es realmente devastadora? Anotar observaciones

---

### 📋 Demo Sprint 2 (final del día 7)
**Lo que se muestra:** un alumno hace login → ve su estado → avanza 3 días → recibe un evento → decide → juega el Kiosco → cobra su sueldo → ve su ranking vs. los 10 alumnos demo. Flujo completo, de punta a punta, en el celular.

---
---

## SPRINT 3 — "JUEGOS Y QORI"
**Días 8–10 · Objetivo: los 5 juegos funcionan, Qori responde con RAG, la app se siente completa**

---

### BE — Backend & IA

#### `S2.BE.01` → `S3.BE.01` — Chatbot Qori con RAG funcional
**Responsable:** BE
**Descripción:** Implementar el chatbot completo: embeddings de la knowledge base, búsqueda por similitud, construcción del prompt con contexto del alumno, llamada a Claude.
**DoD:**
- 20 conceptos de la knowledge base indexados en pgvector (tabla `knowledge_embeddings` con id, concept_id, content, embedding vector(1536))
- Script `make index-kb` que: lee los 20 `.md` de `content/knowledge_base/` → genera embeddings con OpenAI text-embedding-3-small → inserta en pgvector
- `POST /chatbot/message { message }` hace: embed del mensaje → busca top-3 conceptos similares → construye prompt con system de Qori + estado del alumno + últimos 3 eventos + conceptos recuperados → llama a Claude Sonnet → devuelve `{ response, buttons[] }`
- Respuestas de Qori ≤ 2 líneas (controlado en el prompt)
- Si el alumno pregunta algo fuera de finanzas, Qori responde: "Eso no es lo mío, pero puedo ayudarte con tus finanzas 🦊"
- Tiempo de respuesta < 5 segundos en producción

#### `S3.BE.02` — Guardrails del chatbot y contexto enriquecido
**Responsable:** BE
**Descripción:** Asegurar que Qori es seguro para menores de edad y que sus respuestas son contextuales al estado del alumno.
**DoD:**
- Filtro de contenido: el system prompt incluye instrucciones explícitas de no responder temas fuera de finanzas/educación, no dar consejos de inversión real, no interactuar con temas inapropiados
- Contexto inyectado al prompt: wallet actual, deudas activas (monto y tasa), estrés, los últimos 3 eventos con sus decisiones → Qori abre con observación sobre el estado ("Veo que tu estrés subió después de la mora del martes…")
- Botones sugeridos: el prompt pide a Claude que sugiera 2 botones de acción en formato `[Texto del botón]` → el backend los parsea y devuelve como array de strings
- Test: enviar 5 mensajes de prueba y verificar que las respuestas son contextuales, cortas y apropiadas
- Test de guardrail: preguntar sobre temas no-financieros → verificar rechazo cortés

#### `S3.BE.03` — Endpoints para juegos 3, 4 y 5
**Responsable:** BE
**Descripción:** Extender `POST /games/results` para los 3 juegos restantes con sus efectos en el motor.
**DoD:**
- Invierte o Pierde: recibe `{ final_value, diversification_score, fell_for_scam }` → afecta score de resiliencia (+/− según diversificación) + flag `cayo_en_estafa` (sube probabilidad del evento "sorteo deposita y duplica")
- Mercado Rápido: recibe `{ profit, accuracy_pct, investigated_before_buying_pct }` → afecta score de calidad de decisiones
- Qori Quiz: recibe `{ score, correct_count, weakest_topic }` → guarda `weakest_topic` en flags del alumno → modifica probabilidades de eventos relacionados
- Validación anti-trampa: los valores están en rangos plausibles
- Tests para los 5 tipos de resultado

---

### DB — Base de Datos & Integraciones

#### `S3.DB.01` — pgvector y indexación de knowledge base
**Responsable:** DB
**Descripción:** Activar pgvector en la BD de Render, crear la tabla de embeddings y verificar que la búsqueda por similitud funciona.
**DoD:**
- `CREATE EXTENSION vector;` ejecutado en Render Postgres
- Tabla `knowledge_embeddings(id, concept_id, title, content, embedding vector(1536))` migrada
- `make index-kb` funciona en local y en producción
- Query de similitud: `SELECT * FROM knowledge_embeddings ORDER BY embedding <=> $1 LIMIT 3` devuelve los 3 conceptos más relevantes en < 100ms
- Test: buscar "cómo funciona el interés" → devuelve "Interés compuesto" como primer resultado

#### `S3.DB.02` — Deploy actualizado con chatbot y todos los endpoints
**Responsable:** DB
**Descripción:** Actualizar el deploy en Render con todos los endpoints nuevos. Configurar la API key de Anthropic. Verificar el flujo completo en producción.
**DoD:**
- `ANTHROPIC_API_KEY` configurada en Render env vars
- `OPENAI_API_KEY` configurada (para embeddings de pgvector)
- Todos los endpoints de Sprint 2 y 3 responden en producción
- `POST /chatbot/message` funciona desde la URL de Render (verificar con curl)
- Knowledge base indexada en la BD de producción
- Seed actualizado con los datos nuevos (misiones, etc.)

#### `S3.DB.03` — Logs y monitoreo básico
**Responsable:** DB
**Descripción:** Configurar logging estructurado para poder debuggear en producción.
**DoD:**
- Cada request logea: timestamp, method, path, status_code, duration_ms, user_id (sin PII como email)
- Errores 500 logean el traceback completo
- Logs accesibles desde el dashboard de Render
- Endpoint `/health` incluye: status de BD (conecta o no), status de Redis (conecta o no), timestamp
- Rate limiting: máximo 60 requests/minuto por usuario (429 si excede)

---

### FE — Frontend

#### `S3.FE.01` — Juego 3: Invierte o Pierde (completo)
**Responsable:** FE
**Descripción:** El juego de portafolio por rondas.
**DoD:**
- 6 rondas, capital inicial ⵊ100, 4 frascos (Conservador, Balanceado, Arriesgado, Primo)
- UI de distribución: inputs numéricos o sliders, total debe sumar exactamente el capital disponible
- Resultado por ronda con animación (frascos suben/bajan) y sonido diferenciado (positivo/negativo)
- Ronda 3: "Crisis" → arriesgado cae fuerte, conservador se mantiene
- "El negocio del primo": 50% desaparece con animación de 💨, explicación de estafa
- Gráfica acumulada: línea por frasco + línea de tu portafolio
- Pantalla final: tu retorno vs. cada frasco individual, concepto de diversificación
- `POST /games/results` al terminar

#### `S3.FE.02` — Juegos 4 y 5: Mercado Rápido + Qori Quiz
**Responsable:** FE
**Descripción:** Los 2 juegos más simples de implementar.
**DoD:**
- **Mercado Rápido:** 5 rondas de 30s, 6 cards de productos, mantener presionado revela precio real, comprar si está barato, ignorar si está caro. Timer visible. Un producto por ronda es "trampa". Pantalla de resultados con margen total. `POST /games/results`
- **Qori Quiz:** 10 preguntas situacionales (no trivia) con 3 opciones cada una. Feedback inmediato: ✅ con explicación verde o ❌ con explicación y la respuesta correcta. Score 0–100. Barra de progreso (pregunta 3 de 10). `POST /games/results` con score y weakest_topic
- Ambos juegos responsive en 375px
- Ambos jugables 3 veces sin bugs

#### `S3.FE.03` — Chatbot UI (Qori)
**Responsable:** FE
**Descripción:** La interfaz del chatbot: burbuja flotante, ventana de chat, burbujas de mensaje, botones de acción.
**DoD:**
- `QoriAvatar.tsx`: burbuja flotante en esquina inferior derecha, icono de zorro, badge de notificación
- `ChatWindow.tsx`: se abre al tap en la burbuja, ocupa ~80% de la pantalla en mobile (sheet desde abajo)
- `ChatBubble.tsx`: burbujas de usuario (derecha, color primario) y de Qori (izquierda, color crema)
- `ChatInput.tsx`: input de texto + botón enviar
- `ActionButtons.tsx`: botones sugeridos por Qori debajo de su último mensaje (tappables)
- Loading: mientras espera respuesta de Claude, Qori muestra "..." animado
- Conectado a `POST /chatbot/message` real
- Historial de la sesión se mantiene en el estado local (no se persiste entre sesiones en el piloto)

#### `S3.FE.04` — Hub de juegos y pantalla de tienda
**Responsable:** FE
**Descripción:** La pantalla que muestra los 5 juegos + la tienda de ítems.
**DoD:**
- `GamesHub.tsx`: 5 cards con nombre del juego, ícono, descripción de 1 línea, botón "Jugar"
- Cada card navega a la pantalla fullscreen del juego correspondiente
- `ShopPage.tsx`: grid de los 12 ítems con precio, categoría, badge de cuotas ("ⵊ180 o 3 cuotas de ⵊ64.80"). Botón "Comprar" → preview → confirmar
- `InstallmentBadge.tsx`: muestra el precio total en cuotas vs. contado ("Pagarás ⵊ194.40 en total")
- Conectados a la API real

---

### QA — Testing & Calidad

#### `S3.QA.01` — Playtest completo de los 5 juegos
**Responsable:** QA
**Descripción:** Jugar cada juego múltiples veces buscando bugs, problemas de balance y oportunidades de mejora.
**DoD:**
- Cada juego jugado mínimo 3 veces
- Checklist por juego: ¿se entiende sin instrucciones? ¿La dificultad es justa? ¿Se puede ganar y perder? ¿El resultado se envía al backend? ¿El efecto se refleja en el estado? ¿Es divertido?
- Bugs reportados como issues con severidad
- Balance report: "El Kiosco da mucho/poco dinero", "La Trampa es imposible/trivial", etc.
- Verificar en mobile (375px): ¿los botones son tocables? ¿Los textos se leen?

#### `S3.QA.02` — Test del chatbot Qori
**Responsable:** QA
**Descripción:** Probar el chatbot con 15 mensajes variados y verificar calidad de respuestas.
**DoD:**
- 5 preguntas financieras ("¿cómo funciona el interés?", "¿debería pagar deuda o ahorrar?", "¿qué es diversificación?", "¿por qué subió mi estrés?", "¿cómo subo mi score?") → verificar que son contextuales, cortas y correctas
- 5 preguntas de juego ("¿qué hago en el Kiosco?", "¿cómo escapo de la trampa?", "¿por qué me fue mal?") → verificar que responde con utilidad
- 5 preguntas fuera de tema ("¿cuál es la capital de Francia?", "dime un chiste", "ayúdame con mi tarea de matemáticas", "me siento solo", "dime una grosería") → verificar que rechaza cortésmente sin romperse
- Documento: `docs/test-chatbot-sprint3.md` con cada pregunta, respuesta recibida y evaluación (✅ ok / ⚠️ mejorable / ❌ falla)

#### `S3.QA.03` — Verificación de balance económico
**Responsable:** QA
**Descripción:** Simular manualmente 30 días virtuales (un mes completo) y verificar que la economía funciona según el GDD.
**DoD:**
- Jugar 30 días virtuales con alumno1 tomando decisiones "disciplinadas" (ahorra 20% del sueldo, paga cuotas a tiempo, tiene fondo de emergencia)
- Jugar 30 días virtuales con alumno2 tomando decisiones "impulsivas" (compra todo, toma préstamos, no ahorra)
- Verificar: ¿el disciplinado tiene mejor score que el impulsivo? ¿El impulsivo tiene ruta de salida? ¿El sueldo alcanza justo para fijos + 15–20% excedente? ¿El estrés refleja la realidad? ¿El credit score sube/baja correctamente?
- Documento: `docs/balance-test-sprint3.md` con la tabla de estado por día de ambos alumnos
- Si algo está roto: issue con propuesta de ajuste al `balance.yaml`

---

### 📋 Demo Sprint 3 (final del día 10)
**Lo que se muestra:** flujo completo con los 5 juegos funcionando + Qori respondiendo preguntas sobre el estado del alumno + tienda con preview de cuotas. La app se siente como un producto real.

---
---

## SPRINT 4 — "PULIDO Y ENTREGA"
**Días 11–14 · Objetivo: estable, deployado, bonito y entregable a un director de colegio**

---

### BE — Backend & IA

#### `S4.BE.01` — Hardening de seguridad
**Responsable:** BE
**Descripción:** Asegurar el backend para que sea presentable en producción (no production-grade de verdad, pero sí sin vulnerabilidades obvias).
**DoD:**
- JWT con expiración de 24h (no infinito)
- CORS solo desde el dominio de Vercel (no `*`)
- Rate limiting: 60 req/min por usuario con 429
- Passwords con bcrypt, nunca logueadas
- Inputs sanitizados: SQL injection no es posible (SQLAlchemy con parámetros, no string concat)
- Health check no expone datos internos

#### `S4.BE.02` — Cacheo de chatbot y optimización
**Responsable:** BE
**Descripción:** Reducir latencia y costos del chatbot cacheando respuestas frecuentes.
**DoD:**
- Cache en Redis: si un mensaje es muy similar (embedding distance < 0.05) a uno ya respondido en las últimas 24h, devolver la respuesta cacheada
- Respuestas pre-armadas para los 5 conceptos más preguntados como fallback si la API de Claude falla/timeout
- Timeout de 10s en la llamada a Claude; si excede, devolver respuesta genérica de Qori ("Hmm, déjame pensar… mientras tanto, revisa tu estado financiero 🦊")
- Log de costos: cada llamada a Claude logea tokens usados

#### `S4.BE.03` — Onboarding y estado inicial del alumno
**Responsable:** BE
**Descripción:** Implementar un flujo de primer ingreso: el alumno elige su meta y recibe su primer sueldo.
**DoD:**
- `POST /pacha/onboarding { goal_item, goal_target }` → setea la meta del alumno + avanza al tick 1 (primer día con sueldo)
- Si el alumno ya hizo onboarding (`current_tick > 0`), el endpoint devuelve 409
- Metas disponibles: laptop (ⵊ900), celular nuevo (ⵊ350), bicicleta (ⵊ200), curso (ⵊ150)
- El estado inicial post-onboarding: wallet con primer sueldo semanal, savings en 0, meta seteada, score 550, liga chaski

---

### DB — Base de Datos & Integraciones

#### `S4.DB.01` — Deploy final y verificación end-to-end en producción
**Responsable:** DB
**Descripción:** Todo deployado, todo funcionando, seed corrido, URLs verificadas.
**DoD:**
- Backend en Render: todos los endpoints responden, health check verde
- BD migrada con alembic, seed ejecutado (10 alumnos de prueba)
- Knowledge base indexada en pgvector de producción
- Redis de Upstash conectado y funcional (verificar con `GET /leaderboard`)
- Frontend en Vercel: build exitoso, `VITE_API_URL` apunta a Render, la app carga
- Probar flujo completo en producción: registrar usuario nuevo → login → onboarding → avanzar día → jugar Kiosco → chatear con Qori → ver ranking
- Dominio custom configurado si hay (ej: `app.riqchariy.pe`)

#### `S4.DB.02` — Backup y recuperación
**Responsable:** DB
**Descripción:** Asegurar que los datos del piloto no se pierden.
**DoD:**
- Script de backup manual: `pg_dump` de la BD de Render → archivo descargable
- Backup ejecutado y almacenado en un lugar seguro (Google Drive del equipo o R2)
- Script de restauración probado: descargar backup → restaurar en BD local → verificar que los datos están completos
- Documentado en `docs/runbooks/backup.md`: cómo hacer backup, dónde se guarda, cómo restaurar

#### `S4.DB.03` — Documentación de API final
**Responsable:** DB
**Descripción:** Documentar todos los endpoints disponibles para referencia del equipo.
**DoD:**
- FastAPI autodocs (`/docs`) accesibles en producción con todos los endpoints listados
- Cada endpoint tiene: description, request body schema, response schema, posibles errores
- Colección de requests de prueba (Bruno, Insomnia o .http file) con los 15 endpoints del piloto
- `docs/api/endpoints-piloto.md` con tabla resumen: método, ruta, descripción, auth requerida

---

### FE — Frontend

#### `S4.FE.01` — Onboarding y polish visual
**Responsable:** FE
**Descripción:** Flujo de primer ingreso + toques finales de diseño.
**DoD:**
- `OnboardingPage.tsx`: 3 slides (swipeable): "Esto es tu vida financiera" → "Gana intis trabajando" → "Qori te ayuda". Último slide: selector de meta (laptop / celular / bici / curso) + botón "Empezar mi vida"
- Conectado a `POST /pacha/onboarding`
- Favicon de Riqchariy configurado
- Meta tags para compartir (og:title, og:description, og:image) → cuando alguien comparte la URL en WhatsApp se ve bien
- Animaciones pulidas: IntiFly funciona en compras y cobros, VitalBar hace transition suave, las cards de evento tienen slide-in

#### `S4.FE.02` — Responsive final y accesibilidad
**Responsable:** FE
**Descripción:** Verificar que TODO funciona en celular y cumple accesibilidad mínima.
**DoD:**
- Todas las pantallas probadas en 375px (iPhone SE) y 412px (Android mid-range) sin overflow horizontal ni elementos cortados
- Bottom nav: íconos tocables (≥44px target), labels visibles, tab activa marcada
- Botones en juegos: ≥44px de target, texto legible
- Deuda: comunicada con color rojo + ícono ⚠ + texto (nunca solo color)
- Contraste AA verificado en las combinaciones principales (texto sobre crema, texto sobre cards)
- Números de dinero siempre en fuente tabular (se alinean)

#### `S4.FE.03` — Pantallas de ranking y perfil final
**Responsable:** FE
**Descripción:** Pulir las pantallas sociales y de perfil.
**DoD:**
- `RankingPage.tsx`: podio top 3 con avatares, lista del resto del aula, tu posición destacada con color, liga actual con nombre quechua e ícono
- `ProfilePage.tsx`: nombre, liga, stats (score, credit score, días jugados, decisiones tomadas), gráfica de score en el tiempo (línea con los últimos 30 ticks)
- `MissionsPage.tsx`: 3 misiones con barra de progreso, botón "Reclamar" cuando cumplida → animación de recompensa
- Screenshot-ready: que un alumno quiera compartir su pantalla de perfil

#### `S4.FE.04` — Pantalla de "Mientras no estabas" y edge cases
**Responsable:** FE
**Descripción:** Manejar los estados especiales y edge cases de la UI.
**DoD:**
- Si el alumno avanza 3+ días de golpe: resumen consolidado ("En los últimos 3 días: cobraste ⵊ60, pagaste ⵊ18 de gastos, tu ahorro creció ⵊ1.20")
- Empty states: ranking vacío ("Aún no hay datos, ¡avanza unos días!"), sin misiones, sin historial
- Error states: si la API falla, toast de Qori ("Algo salió mal, intenta de nuevo 🦊") sin crashear la app
- Loading states: skeleton loaders en home, banco y ranking mientras cargan datos
- Sin wallet negativa visible (si es 0, mostrar "ⵊ0" no "ⵊ-3.40")

---

### QA — Testing & Calidad

#### `S4.QA.01` — Test end-to-end completo en producción
**Responsable:** QA
**Descripción:** Jugar una partida completa de 15 días virtuales en la URL de producción como lo haría un alumno real.
**DoD:**
- Registrarse como alumno nuevo → onboarding → elegir meta (laptop)
- Avanzar 15 días virtuales tomando decisiones variadas: ahorrar, comprar, tomar préstamo, pagar cuota, responder eventos
- Jugar los 5 minijuegos al menos 1 vez cada uno
- Hacer 5 preguntas a Qori
- Ver ranking y verificar que la posición tiene sentido
- **TODO funciona sin crashes.** Si hay crash, es un bug blocker que se arregla antes de entregar
- Documento: `docs/test-e2e-final.md` con cada paso, resultado y screenshots

#### `S4.QA.02` — Test en dispositivos reales
**Responsable:** QA
**Descripción:** Probar en al menos 2 celulares reales (no solo Chrome DevTools).
**DoD:**
- Probar en iPhone (Safari) y Android (Chrome): login → home → avanzar día → jugar Kiosco → chatbot
- Reportar cualquier problema de: layout roto, botones no tocables, texto cortado, teclado que tapa input, scroll que no funciona
- Verificar que los sonidos funcionan (si se implementaron) con volumen del celular en normal
- Verificar que la app se puede agregar a la pantalla de inicio ("Add to Home Screen") y se ve correctamente
- Documento: `docs/test-dispositivos.md` con dispositivo, OS, navegador, resultado

#### `S4.QA.03` — Documentación del piloto y guía para el docente
**Responsable:** QA
**Descripción:** Crear la documentación que se entrega junto con el producto.
**DoD:**
- `docs/guia-docente-piloto.md` (1 página): qué es Riqchariy, cómo entran los alumnos (URL + código de aula), qué hacer en la sesión de clase (20 min), qué observar, cómo reportar bugs
- `docs/bugs-conocidos.md`: lista de bugs conocidos que no se arreglaron, con workarounds si aplica
- `docs/metricas-piloto.md`: qué métricas se van a observar durante el piloto (% de retención, promedio de días avanzados, juegos más jugados, preguntas más frecuentes a Qori)
- Video de 2 minutos del producto funcionando (grabación de pantalla del flujo completo) → para mostrar a directores de colegio

#### `S4.QA.04` — Verificación final del balance y criterios de éxito
**Responsable:** QA
**Descripción:** Última verificación de que el producto cumple los "Must have" del piloto.
**DoD:**
- Checklist de "Must have" verificado punto por punto:
  - [ ] URL pública funciona
  - [ ] Login y registro funcionan
  - [ ] Avanzar días funciona
  - [ ] Eventos llegan y se pueden decidir
  - [ ] Los 5 juegos son jugables y reportan resultados
  - [ ] Qori responde contextualmente
  - [ ] Ranking funciona
  - [ ] El sueldo alcanza justo (15–20% excedente)
  - [ ] No hay espiral de deuda sin salida
- Cada punto marcado con ✅ o ❌. Si hay ❌, es un bug blocker
- Sign-off: los 4 miembros del equipo confirman "listo para pilotar"

---

### 📋 Demo Sprint 4 — ENTREGA FINAL (día 14)
**Lo que se muestra:** demo completa en celular real, desde registro hasta 10 días jugados, con los 5 juegos, Qori y ranking. Se entrega: URL funcional + guía del docente + video de 2 min + lista de bugs conocidos.

---
---

## RESUMEN VISUAL: TAREAS POR SPRINT Y PERFIL

```
              BE              DB              FE              QA
         ─────────────   ─────────────   ─────────────   ─────────────
SPRINT 1  S1.BE.01-04    S1.DB.01-04    S1.FE.01-04    S1.QA.01-03
(D1-3)    Setup+Auth     Docker+BD      React+Design   Tests setup
          Motor domain   Seed+Deploy    VitalBar       Tests auth+motor
          API contract                  Login+Deploy

SPRINT 2  S2.BE.01-04    S2.DB.01-04    S2.FE.01-04    S2.QA.01-03
(D4-7)    Pipeline       Repos+Redis    Home+Eventos   Tests pipeline
          Decisiones     Leaderboard    Banco          Integración
          Eventos        Tienda+Misio.  🎮 Kiosco      Playtest 2 juegos
          Game results                  🎮 La Trampa

SPRINT 3  S3.BE.01-03    S3.DB.01-03    S3.FE.01-04    S3.QA.01-03
(D8-10)   Chatbot RAG    pgvector       🎮 Invierte    Playtest 5 juegos
          Guardrails     Deploy prod    🎮 Mercado+Quiz Chatbot test
          Games 3-5 EP   Logs/monitor   Chatbot UI     Balance test
                                        Hub+Tienda

SPRINT 4  S4.BE.01-03    S4.DB.01-03    S4.FE.01-04    S4.QA.01-04
(D11-14)  Seguridad      Deploy final   Onboarding     E2E producción
          Cache chatbot  Backup         Responsive     Dispositivos
          Onboarding EP  API docs       Ranking+Perfil Docs+Guía
                                        Edge cases     Balance final
```

**Total: 57 tareas** (BE: 14 · DB: 14 · FE: 16 · QA: 13)
