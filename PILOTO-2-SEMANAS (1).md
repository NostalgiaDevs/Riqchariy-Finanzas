# 🚀 RIQCHARIY — Piloto de 2 Semanas
### Especificación completa: qué se construye, cómo se reparte, qué se entrega
**3 personas · 14 días · base sólida para iterar**

---

## 0. LA VERDAD ANTES DE EMPEZAR

Los docs originales planean 1 minijuego para 3 meses de MVP. Este piloto quiere 5 minijuegos + motor + chatbot + deploy en 2 semanas con 3 personas. Es viable **si y solo si** se acepta esto:

- Los 5 juegos se construyen **en React** (no en Phaser). Son minijuegos interactivos dentro de la misma SPA, no engines de juego completos. Phaser es para después — lo que importa ahora es que la mecánica funcione, sea divertida y enseñe. Si un juego en React divierte, en Phaser va a ser espectacular; si un juego en Phaser aburre, el motor no lo salva.
- El motor Pacha arranca **simplificado**: estado en memoria/BD simple, sin sistema de ticks automatizado. El alumno avanza manualmente su día con un botón "Siguiente día" (como un board game digital). El tick automático se añade en el siguiente ciclo.
- El chatbot funciona con **RAG básico**: una colección de conceptos en Qdrant (o Supabase pgvector), embeddings pre-cargados, y una llamada a la API de Claude/GPT con el estado del alumno inyectado en el prompt. Sin fine-tuning, sin caché semántico, sin evals automáticas. Eso viene después.
- Deploy en **Vercel** (frontend React) + **Render** (backend FastAPI + Postgres + Redis). Sin Docker en producción: Render lo maneja. Docker solo para desarrollo local.
- El dashboard docente **no entra** en este piloto. Es una pantalla de datos — se puede construir rápido después con los datos que este piloto ya genera.
- **No hay auth multi-colegio.** Un login simple (email + password o código del aula), un solo colegio/aula. Multi-tenancy es un problema de escala, no de piloto.

**Lo que SÍ se entrega al final de las 2 semanas:**
Un alumno abre la app → ve su estado financiero → recibe eventos y decide → juega 5 minijuegos que afectan su economía → le pregunta a Qori sobre su situación → ve su ranking vs. el aula → y todo esto vive en una URL real que un director de colegio puede probar en su celular.

---

## 1. EQUIPO Y ROLES (3 personas)

| Rol | Foco | Tecnología |
|---|---|---|
| **P1 — Motor + Backend** | Pacha Engine, API REST, BD, chatbot RAG, deploy backend | Python, FastAPI, PostgreSQL, Redis, Qdrant/pgvector |
| **P2 — Frontend + UI** | Toda la interfaz React, navegación, estado global, diseño visual, integración con API | React, TypeScript, Tailwind, Framer Motion |
| **P3 — Juegos + Contenido** | Los 5 minijuegos en React, contenido de eventos/ítems/balance, knowledge base del chatbot | React, TypeScript, diseño de juego, redacción |

**Regla:** los 3 trabajan en paralelo desde el día 2. Para eso, el día 1 se acuerda el contrato de API (los endpoints y sus tipos) y cada uno trabaja contra ese contrato. P2 y P3 usan datos mockeados hasta que P1 tenga los endpoints reales.

---

## 2. CRONOGRAMA DÍA A DÍA

### Semana 1 — El esqueleto que funciona

| Día | P1 (Motor + Backend) | P2 (Frontend + UI) | P3 (Juegos + Contenido) |
|---|---|---|---|
| **D1** | Setup: repo, docker-compose local (Postgres + Redis), FastAPI hello world, deploy inicial a Render (que el URL exista). **Escribir el contrato de API** (tipos TypeScript + endpoints) y compartirlo. | Setup: Vite + React + Tailwind + React Router. Deploy vacío a Vercel. Configurar tokens de diseño (paleta, tipografía). Implementar layout base (GameLayout + VitalBar placeholder). | Escribir **todo** el contenido: `balance.yaml` con los números del GDD, los 15 eventos iniciales como JSON, los 4 trabajos, los 12 ítems de tienda, las 20 preguntas de la knowledge base de Qori. |
| **D2** | Modelos de BD: `users`, `player_economy` (estado financiero completo), `economy_events` (log). Alembic init + primera migración. Endpoint `POST /auth/login` simple (sin OAuth, sin refresh — un JWT y ya). `GET /pacha/state` devuelve el estado del alumno. | Pantalla de login simple. HomePage "Mi Vida" con layout de cards (no isométrico aún — cards con íconos: Billetera, Banco, Trabajo, Tienda, Ranking, Qori). VitalBar real: billetera · ahorros · deuda · estrés conectada a `GET /pacha/state` (mock por ahora). | **Juego 1 — El Kiosco** (día 1 de 3). Diseñar la mecánica simplificada: pantalla de compra de inventario → pantalla de fijar precios → ronda de clientes (arrastrar productos o tap) → cierre de caja con resumen visual. Empezar con la UI de compra de inventario. |
| **D3** | `POST /pacha/decisions` (comprar, ahorrar, pagar deuda, tomar préstamo) con su lógica pura: validar → aplicar → registrar evento → devolver nuevo estado. `POST /pacha/decisions/preview` (misma lógica, sin persistir). Seed script: crear aula demo con 10 alumnos. | Pantalla del **Banco**: vista de ahorros (frasco visual con barra de progreso), vista de préstamos con **el preview** (la pantalla "pagarás ⵊ216 por algo de ⵊ180" con línea de tiempo de cuotas). Conectar a la API mock con los tipos del contrato. | **Juego 1 — El Kiosco** (día 2). Ronda de clientes con timer (clientes llegan, piden productos, arrastras/tapeas para servir). Cierre de caja: animación de monedas con resumen ingresos − costos = utilidad. |
| **D4** | Motor de eventos: cargar los 15 eventos del JSON de P3. `POST /pacha/next-day` que avanza 1 día virtual: corre income → expense → credit → goals → stress → scoring → tal vez dispara un evento contextual → devuelve el resumen del día. Credit score: las fórmulas del GDD implementadas. | Pantalla de **Eventos/Decisiones**: la carta deslizable (EventCard) con opciones y mini-preview de impacto (flechas ↑↓). Conectar a `POST /pacha/decisions/preview`. Animación de consecuencia en VitalBar. Pantalla de **Tienda** con ItemCard y el badge de cuotas. | **Juego 1 — El Kiosco** (día 3). Dificultad progresiva (más clientes, productos que se agotan, el pan de ayer pierde valor). Pantalla de resultados. Calcular `performance` (0–1) que se enviará al backend como resultado del juego. Juego completo y jugable. |
| **D5** | `POST /games/results` — recibe resultado de un minijuego, valida (anti-trampa básica: performance ∈ [0,1]), traduce a efecto en el motor (performance del Kiosco → sueldo). Endpoint de **ranking**: `GET /leaderboard` con Redis sorted set por score financiero. Stress system con las fórmulas del GDD. | Pantalla de **Ranking**: tabla con podio, liga actual (Chaski/Qollqa/Amauta/Apu), posición del alumno destacada. Pantalla de **Perfil**: stats básicos + historial simple de score (gráfica de línea con los últimos N días). Integrar resultado del Kiosco con el backend. | **Juego 2 — La Trampa** (día 1 de 2). Diseño: 3 deudas con barras que crecen visualmente (las "enredaderas"). Ingreso fijo por turno. Interfaz de distribución: sliders o botones para asignar cuánto pagas a cada deuda. Las deudas con tasa alta crecen más rápido — la visualización ES la lección. |
| **D6** | Setup del **chatbot**: crear la knowledge base en Qdrant Cloud (free tier) o pgvector en la misma Postgres. Script para indexar los 20 conceptos que escribió P3. Endpoint `POST /chatbot/message` que: embeddea la pregunta → recupera 3 conceptos relevantes → construye prompt con estado del alumno → llama a la API de Claude → devuelve respuesta ≤2 líneas. | Integrar TODAS las pantallas con la API real de P1 (ya no mocks). Fix de bugs de integración. Pulir flujo completo: login → home → banco → decidir evento → ver efecto → ranking. Agregar sonidos básicos (cajita registradora al ganar intis, alerta suave en deuda). | **Juego 2 — La Trampa** (día 2). Visualización de interés creciendo. Condición de victoria (deudas pagadas) y de "derrota" (deudas cubren la pantalla + replay "¿qué hubiera pasado si…?" mostrando la estrategia óptima). Juego completo. |
| **D7** | Estabilizar todo: correr el flujo completo de punta a punta. Fix de bugs. Deploy actualizado a Render con BD real (Render Postgres). Verificar que el seed funciona en producción. **Buffer de emergencia de la semana 1.** | **Chatbot UI**: burbuja flotante de Qori, chat con burbujas, botones de acción ("¿Cómo funciona el interés?" / "Volver"). Conectar a `POST /chatbot/message`. Responsive: verificar que todo funciona en viewport de celular (375px). | **Juego 3 — Invierte o Pierde** (día 1 de 2). 6 rondas (simplificado de 12). 3 frascos: Conservador 😌 / Balanceado 🙂 / Arriesgado 😬. Interfaz de distribución de intis entre frascos. Al final de cada ronda, los frascos suben/bajan con animación + gráfica acumulada. |

### Semana 2 — Los juegos, el pulido y el deploy

| Día | P1 (Motor + Backend) | P2 (Frontend + UI) | P3 (Juegos + Contenido) |
|---|---|---|---|
| **D8** | Guardrails del chatbot: filtro de temas (solo finanzas/educación), tono para menores, respuestas máx 2 líneas. Contexto mejorado: inyectar los últimos 3 eventos del alumno al prompt para que Qori sea contextual ("Ayer tomaste un préstamo y tu estrés subió…"). | Hub de **Juegos**: pantalla que muestra los 5 minijuegos con card, descripción corta, estado (bloqueado/disponible) y botón de jugar. Integración del Kiosco y La Trampa con el flujo real (resultado → API → efecto en economía). | **Juego 3 — Invierte o Pierde** (día 2). El evento de "crisis" que golpea distinto a cada frasco. "El negocio del primo" como opción tentadora (50% desaparece). Pantalla final comparando tu estrategia con la óptima. Juego completo. |
| **D9** | Misiones semanales: 3 misiones hardcodeadas (ahorrar X intis, jugar 2 minijuegos, mantener estrés bajo Y). `GET /missions` + `POST /missions/{id}/claim`. Sistema de frascos de ahorro: Meta, Emergencias, Libre con `POST /pacha/savings/transfer`. | Pantalla de **Misiones** con cards de progreso. Pantalla de **Metas/Frascos**: los 3 frascos con barra de progreso, botón de mover intis entre frascos con confirmación de fricción en el de Emergencias. Animación de IntiFly (monedas volando entre frascos). | **Juego 4 — Mercado Rápido** (día 1 de 2). Minijuego de compra-venta: se presentan 6 productos con precio actual y precio "real" (estimado). El alumno decide cuáles comprar baratos y vender caros. Rondas rápidas de 30 segundos. Enseña: leer precios, oferta/demanda, margen. |
| **D10** | Scoring financiero: implementar la fórmula completa del GDD (disciplina 250 + deuda 250 + resiliencia 200 + calidad 150 + equilibrio 100). Ligas: calcular liga actual según score promedio sostenido. Tests del motor: cubrir los 5 systems principales + el pipeline de next-day. | **Navegación final**: bottom nav mobile-first (Home · Banco · Juegos · Ranking · Qori). Transiciones entre pantallas. Loading states y empty states con ilustraciones. Error handling visual (toast de Qori cuando algo falla: "Ups, algo salió mal. Intenta de nuevo"). | **Juego 4 — Mercado Rápido** (día 2). Dificultad progresiva (más productos, precios más cercanos, timer más corto). Resultado: ganancia total como % de inversión. Tabla de "mejores traders del aula". Juego completo. |
| **D11** | **Deploy final a Render**: BD de producción con seed, variables de entorno, CORS configurado para el dominio de Vercel, health check. Verificar que `POST /chatbot/message` funciona con la API de Claude en producción (API key en env vars de Render). Redis en Render o Upstash (free tier para el ranking). | **Deploy a Vercel**: build de producción, variables de entorno (API_URL apuntando a Render), dominio custom si hay. Verificar responsive en celular real. Pulir: colores finales de la paleta, tipografía Fredoka/Inter, favicon e ícono PWA, meta tags para compartir. | **Juego 5 — Qori Quiz** (día 1 de 1). El más simple: 10 preguntas situacionales de finanzas personales, cada una con escenario + 3 opciones. NO es un quiz de trivia: cada pregunta es un dilema ("Te ofrecen cuotas sin interés pero el total es 15% más que al contado. ¿Qué haces?"). Feedback inmediato con explicación de Qori en 1 línea. Score de sabiduría financiera. |
| **D12** | Testing de integración: jugar una partida completa como alumno de principio a fin (login → trabajar en kiosco → cobrar sueldo → evento → decisión → ahorro → preguntar a Qori → ranking). Fix de bugs de integración. Optimizar las queries lentas (N+1, etc). | Testing de UX: la misma partida completa pero buscando fricciones de UI. ¿Los botones son ≥44px? ¿Los números se leen? ¿Los colores de deuda son claros sin depender solo del rojo? ¿La VitalBar se entiende sin explicación? Fix todo lo encontrado. | Pulir los 5 juegos: equilibrar dificultad (que el Kiosco no sea imposible en la primera partida, que La Trampa tenga siempre salida), agregar los 5 eventos que faltan hasta completar 15, revisar el balance.yaml (¿el sueldo alcanza justo para gastos fijos + 15–20% de excedente?). |
| **D13** | **Hardening mínimo**: rate limiting en la API (60 req/min por usuario), CORS solo desde el dominio de Vercel, JWT con expiración de 24h, contraseñas hasheadas con bcrypt. Logging básico (qué endpoints se llaman, errores). Backup manual de la BD. | Pantalla de **onboarding**: 3 slides rápidos al primer ingreso ("Esto es tu vida financiera", "Gana intis trabajando", "Qori te ayuda"). Pantalla de "Mientras no estabas" (resumen de días avanzados). Toques finales de animación y transición. | Escribir la **guía del piloto**: documento de 1 página para el docente que va a usar esto con su aula. Qué es, cómo entran los alumnos, qué hacer en la sesión de clase, qué observar, cómo reportar bugs. |
| **D14** | Smoke test final en producción. Crear 10 cuentas de prueba con seed. Verificar: ¿funciona el chatbot? ¿Se guardan las decisiones? ¿El ranking se actualiza? ¿Los juegos reportan resultados? Documentar los endpoints finales. **Entregar.** | Smoke test visual final en 3 dispositivos (iPhone, Android, desktop). Screenshots y video de 2 minutos del producto para mostrar al colegio. **Entregar.** | Playtest final de los 5 juegos: ¿son divertidos? ¿Se entiende qué enseñan? ¿El balance.yaml produce la "escasez suave" que promete el GDD? Ajustar números. **Entregar.** |

---

## 3. ESPECIFICACIÓN DEL MOTOR PACHA (versión piloto)

### 3.1 Estado del alumno (`player_economy`)

```python
# Tabla: player_economy
player_id: UUID (FK → users)
version: int                    # optimistic locking

# dinero
wallet: Decimal                 # efectivo disponible
savings_goal: Decimal           # frasco Meta
savings_emergency: Decimal      # frasco Emergencias
savings_free: Decimal           # frasco Libre

# trabajo
job_id: str                     # "kiosco_ayudante" | "kiosco_titular"
job_performance: float          # 0–1, del minijuego
wage_per_period: Decimal        # calculado: base × performance

# deuda
loans: JSONB                    # [{id, principal, rate, term, paid, late, type}]
credit_score: int               # 300–850

# estado
stress: float                   # 0–1
current_tick: int               # día virtual actual
score: int                      # 0–1000, Score Financiero
league: str                     # chaski | qollqa | amauta | apu

# meta
goal_item: str | null           # "laptop"
goal_target: Decimal            # 900
goal_saved: Decimal             # lo acumulado en frasco Meta

# inventario
inventory: JSONB                # [{item, bought_at_tick}]
flags: JSONB                    # ["tuvo_mora", "primera_inversion", ...]

created_at: timestamp
updated_at: timestamp
```

### 3.2 Pipeline de "Siguiente día" (simplificado, sin ticks automáticos)

```
POST /pacha/next-day
  1. income_system    → ¿es día de pago? (cada 7 ticks) → wallet += wage
  2. expense_system   → gastos fijos del día (comida: 100/28, celular: 25/28, pasajes: 40/28)
  3. credit_system    → ¿vence cuota hoy? → cobrar o marcar mora → intereses
  4. savings_system   → interés: cada 28 ticks, savings *= 1.04
  5. goals_system     → ¿llegó a la meta? → flag + felicitación
  6. stress_system    → recalcular: f(deuda/ingreso, emergencia, mora, gustos)
  7. scoring          → recalcular Score Financiero (la fórmula de 5 componentes)
  8. event_engine     → probabilidad contextual → si dispara, devolver la carta
  9. persist          → guardar estado + log de evento en 1 transacción
  10. return          → { new_state, day_summary, event_card? }
```

**En el piloto:** el alumno presiona un botón "Avanzar día" desde el home. El botón muestra cuántos días ha avanzado hoy (máximo 4 por sesión para simular la cadencia real). Esto permite que el alumno juegue a su ritmo sin necesitar un worker de ticks.

### 3.3 Decisiones disponibles

```
POST /pacha/decisions
{
  type: "BUY_ITEM"          → { item_id, payment: "cash" | "installments" }
  type: "SAVE"              → { amount, jar: "goal" | "emergency" | "free" }
  type: "TAKE_LOAN"         → { source: "bank" | "store" | "lender", amount, term }
  type: "PAY_LOAN"          → { loan_id, amount }
  type: "TRANSFER_SAVINGS"  → { from_jar, to_jar, amount }
  type: "RESPOND_EVENT"     → { event_id, choice_index }
}

POST /pacha/decisions/preview → misma lógica, devuelve { projected_state, impacts[] }
```

### 3.4 Eventos (15 para el piloto)

| # | Nombre | Categoría | Enseña |
|---|---|---|---|
| 1 | Te enfermaste (leve) | emergencia | fondo de emergencia |
| 2 | Se rompió el celular | emergencia | gastos imprevistos |
| 3 | Familiar necesita ayuda | emergencia | dilema emocional vs. financiero |
| 4 | Oferta flash zapatillas −30% | tentación | urgencia artificial |
| 5 | El nuevo juego que todos tienen | tentación | presión social |
| 6 | Sorteo "deposita y duplica" | tentación | estafa / si suena muy bueno… |
| 7 | Cuotas sin inicial | tentación | costo real de las cuotas |
| 8 | Hora extra en el kiosco | oportunidad | tiempo vs. dinero |
| 9 | Taller que sube tu performance | oportunidad | inversión en ti mismo |
| 10 | Bono por desempeño | oportunidad | recompensa al esfuerzo |
| 11 | Ganga real en el mercado | oportunidad | oportunidad legítima |
| 12 | Inflación esta semana | macro | precios suben |
| 13 | Subida de tasa de ahorro | macro | incentivo a ahorrar |
| 14 | Desafío de ahorro grupal | social | cooperación |
| 15 | Visita del auditor | social | orden financiero |

Formato JSON de cada evento:
```jsonc
{
  "id": "enfermedad_leve",
  "name": "¡Te enfermaste!",
  "description": "Te sientes mal. Puedes ir a la farmacia o aguantar.",
  "category": "emergency",
  "icon": "🤒",
  "base_probability": 0.08,
  "modifiers": [
    { "if": "stress > 0.6", "multiply": 1.5 }
  ],
  "choices": [
    {
      "text": "Ir a la farmacia (ⵊ40)",
      "effects": { "wallet": -40, "stress": -0.05 },
      "preview_label": "Billetera ↓40 · Estrés ↓"
    },
    {
      "text": "Aguantar y esperar",
      "effects": { "stress": 0.15 },
      "preview_label": "Estrés ↑↑ · puede empeorar"
    }
  ],
  "teaches": ["fondo_emergencia", "gastos_imprevistos"],
  "qori_comment": {
    "choice_0": "Bien resuelto. ¿Tenías fondo de emergencia? Si no, armemos uno.",
    "choice_1": "Aguantar es una opción, pero el riesgo de empeorar es real."
  }
}
```

### 3.5 Balance económico del piloto

```yaml
# content/balance.yaml — versión piloto

income:
  kiosco_ayudante:
    base_wage: 240          # por mes virtual (28 ticks)
    pay_period: 7           # pago cada 7 ticks = ⵊ60/semana
    performance_range: [0.8, 1.2]  # el minijuego modifica ±20%
  kiosco_titular:
    base_wage: 320
    pay_period: 7
    unlock: "kiosco_performance >= 0.9 AND ticks >= 28"

expenses:
  fixed:
    comida: { amount: 100, period: 28, skippable: false }
    celular: { amount: 25, period: 28, skippable: true, skip_penalty: "no_feed" }
    pasajes: { amount: 40, period: 28, skippable: false }
  # Total fijos: ⵊ165/mes. Sueldo base: ⵊ240. Excedente: ⵊ75 (31%) → ok
  # Con performance 0.8: sueldo ⵊ192, excedente ⵊ27 (14%) → escasez suave ✓

savings:
  interest_rate: 0.04       # 4% mensual virtual (didáctico)
  interest_period: 28       # cada mes virtual
  emergency_shield: 150     # con ≥150 en emergencias, eventos dan opción "usar fondo"

credit:
  bank:
    rate: 0.05              # 5% mensual
    max_multiple: 2         # hasta 2× ingreso mensual
    min_score: 500
  store_installments:
    rate: 0.08              # 8% escondido en cuotas
  lender:
    rate: 0.15              # prestamista informal
    min_score: 0            # siempre disponible

credit_score:
  initial: 550
  on_time_payment: +8
  emergency_fund_maintained: +3   # por mes
  late_payment: -40
  used_lender: -15
  debt_over_40pct: -5             # por mes

stress:
  weights:
    debt_ratio: 0.35        # deuda/ingreso
    no_emergency: 0.25      # no tiene fondo de emergencia
    recent_late: 0.25       # mora en últimos 14 ticks
    no_recent_fun: 0.15     # no compró un gusto en 28 ticks

scoring:
  savings_discipline: 250   # ¿ahorra % constante?
  debt_management: 250      # puntualidad + ratio
  resilience: 200           # ¿las crisis lo tumban?
  decision_quality: 150     # ¿usa previews?
  balance: 100              # ¿gustos sin romper metas?

leagues:
  chaski: [0, 300]
  qollqa: [301, 550]
  amauta: [551, 750]
  apu: [751, 1000]

shop:
  items:
    - { id: zapatillas, price: 180, stress_reduction: 0.05, category: gusto }
    - { id: audifonos, price: 90, stress_reduction: 0.03, category: gusto }
    - { id: salida_amigos, price: 25, stress_reduction: 0.02, category: gusto }
    - { id: mochila, price: 60, stress_reduction: 0.02, category: necesidad }
    - { id: celular_nuevo, price: 350, stress_reduction: 0.06, category: gusto }
    - { id: bicicleta, price: 200, stress_reduction: 0.04, category: utilidad }
    - { id: juego_video, price: 45, stress_reduction: 0.03, category: gusto }
    - { id: ropa, price: 70, stress_reduction: 0.03, category: necesidad }
    - { id: libro, price: 20, stress_reduction: 0.01, category: educacion }
    - { id: candado_bici, price: 15, stress_reduction: 0, category: seguro }
    - { id: botiquin, price: 25, stress_reduction: 0, category: seguro }
    - { id: curso_online, price: 50, stress_reduction: 0, category: educacion }
```

---

## 4. ESPECIFICACIÓN DE LOS 5 MINIJUEGOS

Todos se construyen como **componentes React** dentro de `frontend/src/modules/games/`. Cada uno es una pantalla fullscreen con su propia lógica de estado local (useState/useReducer). Al terminar, envía el resultado al backend con `POST /games/results`.

### 🎮 Juego 1 — El Kiosco
**Género:** tycoon/time-management simplificado
**Duración:** 3–5 minutos por jornada
**Pantallas:** 3 fases en secuencia

**Fase 1 — Compra de inventario (30 seg)**
- 6 productos disponibles (pan, gaseosa, galletas, fruta, sándwich, helado)
- Cada uno con precio de compra al por mayor y cantidad limitada
- Presupuesto del día = ⵊ50
- UI: grid de productos, tap para agregar al carrito, total visible

**Fase 2 — Fijar precios (20 seg)**
- Los productos comprados aparecen en tu kiosco
- Slider de precio para cada uno: más caro = más margen pero menos clientes
- Indicador visual de "demanda esperada" que baja cuando subes el precio

**Fase 3 — Hora punta (90 seg)**
- Clientes llegan con pedidos (burbuja con ícono del producto)
- Tap en el producto correcto para servir. Si demoras >3s el cliente se va (venta perdida)
- Velocidad progresiva: minuto 1 tranquilo, último 30s frenético
- Productos se agotan, pan del día anterior vale la mitad

**Cierre de caja:**
- Animación: monedas de ingresos apilándose, costos restándose = utilidad
- "Tu eficiencia hoy: 85%" → esto es el `performance` que viaja al backend
- Si `performance ≥ 0.9` tres veces seguidas: desbloquea trabajo "Kiosco titular"

**Qué enseña (intrínsecamente):** margen, inventario, merma, precio vs. demanda, presión de tiempo, flujo de caja

### 🎮 Juego 2 — La Trampa
**Género:** puzzle de asignación por turnos
**Duración:** 3–5 minutos por partida

**Setup:**
- 3 deudas con montos, tasas y plazos distintos:
  - Tienda: ⵊ120, 8%/mes, 6 cuotas
  - Banco: ⵊ200, 5%/mes, 10 cuotas
  - Prestamista: ⵊ80, 15%/mes, sin plazo (solo interés si pagas mínimo)
- Ingreso fijo por turno: ⵊ70
- Gasto fijo por turno: ⵊ30 (no evitable)
- Disponible para pagar: ⵊ40

**Cada turno:**
- Las 3 deudas se muestran como barras que crecen (interés acumulándose visualmente)
- Distribuyes tus ⵊ40 entre las 3 deudas con sliders
- Puedes pagar solo el mínimo (interés) o abonar al principal
- Botón "Siguiente turno" → las barras crecen/decrecen según tu pago

**Eventos durante la partida:**
- Turno 3: "¿Refinanciar la del prestamista al banco?" (a veces conviene, a veces es trampa)
- Turno 5: "Ingreso extra de ⵊ30 — ¿pagar deuda o guardar?"

**Victoria:** las 3 barras llegan a 0 → confetti + "¡Escapaste de la trampa en N turnos!"
**Derrota (deuda > ⵊ500):** pantalla con las barras cubriendo todo + **"¿Qué hubiera pasado?"** → replay mostrando la estrategia avalancha (pagar primero la de mayor tasa)

**Resultado enviado al backend:** `{ turns_to_win: N | null, strategy_used: "avalanche"|"snowball"|"mixed", total_interest_paid: X }`. Afecta: score de manejo de deuda.

### 🎮 Juego 3 — Invierte o Pierde
**Género:** estrategia de portafolio por rondas
**Duración:** 3–4 minutos (6 rondas)

**Setup:**
- Capital inicial: ⵊ100
- 4 frascos de inversión:
  - Conservador 😌 (+1%/ronda, nunca baja)
  - Balanceado 🙂 (+2.5% promedio, rango −3% a +6%)
  - Arriesgado 😬 (+4% promedio, rango −15% a +20%)
  - El negocio del primo 🤑 (+10% O −100%, 50/50 cada ronda)

**Cada ronda:**
- Distribuyes tus intis entre los 4 frascos (drag & drop o input numérico)
- Botón "Invertir" → animación de resultados (frascos suben/bajan con sonido)
- Gráfica de tu portafolio vs. cada frasco acumulado
- Ronda 3: evento "Crisis del mercado" — arriesgado cae −12%, balanceado −3%, conservador OK
- Ronda 5: el negocio del primo dice "trae más plata, esta vez es seguro" (es la estafa)

**Final:**
- Gráfica comparativa: tu portafolio vs. 100% conservador vs. 100% arriesgado
- Concepto destacado: "La diversificación te habría dado X"
- Score: % de retorno total

**Resultado al backend:** `{ final_value, diversification_score, fell_for_scam: bool }`. Afecta: score de resiliencia + flag de estafa.

### 🎮 Juego 4 — Mercado Rápido
**Género:** juego de velocidad y lectura de precios
**Duración:** 2–3 minutos (5 rondas de 30 segundos)

**Cada ronda:**
- 6 cards de productos con "precio de venta" visible
- El "valor real" (precio promedio) aparece al mantener presionado (gesto de investigar)
- Compras los que están por debajo del valor real, ignoras los que están arriba
- Timer de 30 segundos, los precios se mueven ligeramente

**Mecánica de riesgo:** un producto por ronda es "demasiado barato para ser verdad" — 50% de las veces es ganga real, 50% es producto defectuoso (pierdes la inversión). Comprar sin investigar (sin mantener presionado) tiene más riesgo.

**Final:** balance de compras. "Ganaste ⵊ45 con un margen de 18%" o "Perdiste ⵊ20 por no investigar los precios".

**Resultado al backend:** `{ profit, accuracy_pct, investigated_before_buying_pct }`. Afecta: score de calidad de decisiones.

### 🎮 Juego 5 — Qori Quiz (el rápido)
**Género:** quiz situacional con dilemas
**Duración:** 2–3 minutos (10 preguntas)

**NO es trivia.** Cada pregunta es un escenario:
```
"Tu amigo te dice: 'Deposita ⵊ50 en esta app y mañana tendrás ⵊ100.
Ya lo hice y me funcionó.' ¿Qué haces?"

A) Depositar ⵊ50 — suena bien si a él le funcionó
B) Depositar ⵊ20 — probar con poco por si acaso
C) No depositar — si suena demasiado bueno, probablemente es estafa
```

- Feedback inmediato: ✅ o ❌ + explicación de Qori en 1 línea
- Las preguntas cubren: interés compuesto, inflación, estafas, presupuesto, ahorro, deuda, seguros, inversión, presión social, comparar precios
- Score: 0–100 de "sabiduría financiera"

**Resultado al backend:** `{ score, correct_count, weakest_topic }`. Se usa para personalizar los eventos que el motor dispara (si el alumno falló en "estafas", sube la probabilidad del evento "sorteo deposita y duplica").

---

## 5. ESPECIFICACIÓN DEL CHATBOT QORI (versión piloto)

### 5.1 Arquitectura

```
[Mensaje del alumno]
      ↓
POST /chatbot/message { message, player_id }
      ↓
1. Cargar estado del alumno (wallet, loans, stress, últimos 3 eventos)
2. Embedder: convertir mensaje a vector (API de OpenAI text-embedding-3-small)
3. Recuperar top-3 conceptos de la knowledge base (pgvector similarity search)
4. Construir prompt:
   - System: personalidad de Qori + reglas
   - Contexto: estado del alumno + conceptos recuperados
   - User: mensaje del alumno
5. Llamar API de Claude (claude-sonnet-4-20250514) con max_tokens=200
6. Devolver respuesta + botones sugeridos
```

### 5.2 System prompt de Qori

```markdown
Eres Qori, un zorro andino que es el guía financiero de Riqchariy.
Hablas con estudiantes peruanos de 12–17 años.

REGLAS ABSOLUTAS:
- Máximo 2 líneas por mensaje. Si necesitas más, ofrece un botón "Cuéntame más".
- Siempre contextual: abre con algo sobre SU situación financiera actual.
- Nunca juzgues una decisión como "mala" — explica las consecuencias.
- Tono: cercano, con humor peruano suave, sin condescendencia.
- Solo temas de finanzas personales y del juego. Todo lo demás: "Eso no es lo mío,
  pero puedo ayudarte con tus finanzas 🦊"
- Nunca des consejo de inversión real. Siempre aclara que es el juego.
- Usa ⵊ para referirte a intis.

ESTADO DEL ALUMNO:
{player_state_json}

ÚLTIMOS EVENTOS:
{recent_events_json}

CONCEPTOS RECUPERADOS:
{retrieved_concepts}

Responde en español peruano natural. Si el alumno pregunta sobre un concepto,
usa los conceptos recuperados como base pero adapta a su situación.
Sugiere 1–2 botones de acción al final: [texto del botón]
```

### 5.3 Knowledge base (20 conceptos para el piloto)

Cada concepto es un archivo `.md` en `content/knowledge_base/conceptos/`:

```markdown
# Interés compuesto
## Definición
El dinero que ganas (o pagas) sobre los intereses ya acumulados.
Es "intereses sobre intereses".
## Ejemplo real
Si ahorras S/100 al 5% mensual: mes 1 = S/105, mes 2 = S/110.25
(no S/110, porque el 5% se calcula sobre S/105).
## Ejemplo en el juego
Tu frasco de ahorro crece 4% al mes. Si dejas ⵊ100 quietos 3 meses:
ⵊ100 → ⵊ104 → ⵊ108.16 → ⵊ112.49. ¡ⵊ12.49 gratis!
## Dato clave
Einstein NO dijo que es "la fuerza más poderosa del universo"
(es un mito), pero sí es la herramienta más importante de las finanzas.
```

Lista de los 20 conceptos:
1. Interés compuesto
2. Inflación
3. Presupuesto personal
4. Fondo de emergencia
5. Deuda buena vs. deuda mala
6. Tasa de interés
7. Credit score
8. Ahorro con propósito
9. Diversificación
10. Riesgo y retorno
11. Estafas financieras (señales de alarma)
12. Cuotas vs. contado
13. Ingresos vs. gastos fijos
14. Margen de ganancia
15. Oferta y demanda
16. Presión social en el gasto
17. Urgencia artificial (ofertas "solo hoy")
18. Seguros (gasto preventivo)
19. Capital humano (invertir en ti mismo)
20. Contabilidad mental (frascos)

### 5.4 Botones de acción que Qori sugiere

```json
[
  { "text": "¿Cómo funciona el interés?", "action": "ask", "topic": "interes_compuesto" },
  { "text": "¿Debería ahorrar o pagar deuda?", "action": "ask", "topic": "deuda_vs_ahorro" },
  { "text": "Explícame mi estrés", "action": "explain", "metric": "stress" },
  { "text": "¿Cómo subo mi score?", "action": "explain", "metric": "credit_score" },
  { "text": "Volver al juego", "action": "close" }
]
```

---

## 6. CONTRATOS DE API (el acuerdo del día 1)

```
# ── Auth ──
POST   /auth/login              { email, password } → { token, user }
POST   /auth/register           { email, password, name, classroom_code } → { token, user }

# ── Pacha (motor) ──
GET    /pacha/state              → PlayerEconomy completa
POST   /pacha/next-day           → { new_state, day_summary, event_card? }
POST   /pacha/decisions/preview  { type, ...params } → { projected_state, impacts[] }
POST   /pacha/decisions          { type, ...params } → { new_state, qori_comment }

# ── Tienda ──
GET    /shop/items               → Item[] (con precios ajustados por inflación)

# ── Juegos ──
POST   /games/results            { game_id, result_data } → { effects_applied, new_state }

# ── Ranking ──
GET    /leaderboard              → { players: [{name, score, league, rank}], my_rank }

# ── Chatbot ──
POST   /chatbot/message          { message } → { response, buttons[] }

# ── Misiones ──
GET    /missions                 → Mission[] (con progreso)
POST   /missions/{id}/claim      → { reward_applied, new_state }

# ── Ahorros ──
POST   /pacha/savings/transfer   { from_jar, to_jar, amount } → { new_state }
```

Tipos TypeScript compartidos (P1 los escribe, P2 y P3 los usan desde el día 1):

```typescript
// types/economy.ts
interface PlayerEconomy {
  playerId: string
  wallet: number
  savingsGoal: number
  savingsEmergency: number
  savingsFree: number
  jobId: string
  jobPerformance: number
  wagePerPeriod: number
  loans: Loan[]
  creditScore: number
  stress: number
  currentTick: int
  score: number
  league: 'chaski' | 'qollqa' | 'amauta' | 'apu'
  goalItem: string | null
  goalTarget: number
  goalSaved: number
  inventory: InventoryItem[]
  flags: string[]
}

interface Loan {
  id: string
  principal: number
  rate: number
  term: number
  paid: number
  late: number
  type: 'bank' | 'store' | 'lender'
}

interface EventCard {
  id: string
  name: string
  description: string
  icon: string
  category: 'emergency' | 'temptation' | 'opportunity' | 'macro' | 'social'
  choices: EventChoice[]
  teaches: string[]
}

interface EventChoice {
  text: string
  effects: Record<string, number>
  previewLabel: string
}

interface GameResult {
  gameId: 'kiosco' | 'la_trampa' | 'invierte_o_pierde' | 'mercado_rapido' | 'qori_quiz'
  data: Record<string, any>  // específico por juego
}

interface DaySummary {
  tick: number
  incomeReceived: number | null
  expensesPaid: { name: string, amount: number }[]
  loanPayments: { loanId: string, amount: number, status: 'paid' | 'late' }[]
  savingsInterest: number | null
  stressChange: number
  scoreChange: number
}
```

---

## 7. DEPLOY

### 7.1 Frontend → Vercel

```
Repo: riqchariy (monorepo)
Root directory: frontend
Build command: npm run build
Output directory: dist
Framework: Vite

Variables de entorno:
  VITE_API_URL=https://riqchariy-api.onrender.com
  VITE_WS_URL=wss://riqchariy-api.onrender.com   (no se usa en piloto)
```

Dominio: `riqchariy.vercel.app` (o custom si tienen dominio).
Cada push a `main` despliega automáticamente.

### 7.2 Backend → Render

```
Tipo: Web Service
Repo: riqchariy (monorepo)
Root directory: backend
Build command: pip install -r requirements.txt
Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Runtime: Python 3.12

Variables de entorno:
  DATABASE_URL=postgresql://...   (Render Postgres, free tier)
  REDIS_URL=redis://...           (Upstash Redis, free tier)
  JWT_SECRET=...                  (generar con openssl rand -hex 32)
  ANTHROPIC_API_KEY=sk-ant-...    (para el chatbot)
  CORS_ORIGINS=https://riqchariy.vercel.app
  ENVIRONMENT=production
```

**Base de datos:** Render Postgres (free tier: 1GB, expira en 90 días — suficiente para piloto. Plan Starter $7/mes si quieren persistencia).

**Redis:** Upstash (free tier: 10,000 commands/day — suficiente para el ranking del piloto).

**Chatbot:** API de Anthropic para Claude Sonnet. Costo estimado para el piloto: ~$5–15 (20 alumnos × 10 mensajes × 500 tokens promedio).

**pgvector para RAG:** activar la extensión en Render Postgres (`CREATE EXTENSION vector;`). Indexar los 20 conceptos con embeddings de OpenAI text-embedding-3-small. Costo: <$0.01 (una sola indexación de 20 textos cortos).

### 7.3 Checklist de deploy

```
□ Render: Web Service creado y corriendo (health check en /health)
□ Render: Postgres creado, migración corrida (alembic upgrade head)
□ Render: pgvector activado, 20 conceptos indexados
□ Upstash: Redis creado, URL en env vars de Render
□ Vercel: build exitoso, VITE_API_URL apuntando a Render
□ CORS: Render solo acepta requests de Vercel
□ Seed: 10 alumnos de prueba creados (script ejecutado una vez)
□ Chatbot: ANTHROPIC_API_KEY configurada, /chatbot/message devuelve respuesta
□ SSL: ambos servicios con HTTPS (Vercel y Render lo dan gratis)
□ Probar en celular real: abrir la URL de Vercel en Chrome mobile
```

---

## 8. LO QUE NO ENTRA (backlog explícito del siguiente piloto)

| Feature | Por qué no | Cuándo |
|---|---|---|
| Ticks automáticos (worker) | Requiere Celery/RQ, complejidad de infra | Piloto 2 |
| Dashboard docente | Es una vista de datos sobre lo que este piloto genera | Piloto 2 |
| Multi-colegio / multi-aula | Solo tenemos 1 aula de prueba | Piloto 2 |
| Qhatu (mercado entre alumnos) | Requiere WebSocket + order book | Piloto 3 |
| Juegos en Phaser (canvas real) | Los juegos React son suficientes para validar mecánica | Piloto 3 |
| Auth con OAuth / SSO | Email + password alcanza para el piloto | Piloto 2 |
| Reporte PDF del docente | No hay dashboard docente aún | Piloto 2 |
| PWA / push notifications | Se necesita service worker, manifest | Piloto 2 |
| Inversiones dentro del motor | Solo el minijuego enseña inversiones | Piloto 2 |
| Temporadas y reinicio con herencia | No hay duración suficiente para una temporada | Piloto 3 |
| Simulation Lab (balance automático) | Los bots de simulación son Piloto 3 | Piloto 3 |
| Tests automatizados (90% cobertura) | Se prioriza velocidad; tests del motor en Piloto 2 | Piloto 2 |

---

## 9. DEFINICIÓN DE "TERMINADO" (qué tiene que pasar el día 14)

### Must have (sin esto no hay piloto)
- [ ] URL pública funcionando (Vercel + Render) que un celular pueda abrir
- [ ] Un alumno puede: registrarse → ver su estado → avanzar días → recibir y responder eventos → ver consecuencias en su billetera/estrés/score
- [ ] Los 5 minijuegos son jugables y sus resultados afectan la economía del alumno
- [ ] Qori responde preguntas financieras de manera contextual (sabe tu estado)
- [ ] Ranking del aula funciona (se ve quién va primero por Score Financiero)
- [ ] El sueldo alcanza justo para vivir y queda un 15–20% de excedente (la escasez suave funciona)
- [ ] Ningún alumno queda en deuda imposible (siempre hay ruta de salida)

### Nice to have (si sobra tiempo)
- [ ] Sonidos (cajita al ganar intis, alerta suave en deuda)
- [ ] Animación de IntiFly (monedas volando)
- [ ] Onboarding de 3 slides al primer ingreso
- [ ] Misiones semanales
- [ ] Frasco de emergencia como "escudo" en eventos

### Señales de que funciona (observar en el playtest)
- Los alumnos quieren seguir avanzando días ("¿puedo hacer uno más?")
- Alguien pregunta algo a Qori por curiosidad, no por obligación
- Alguien se ríe o se queja cuando le cae un evento ("¡no, otra vez enfermo!")
- Discuten entre ellos estrategias ("yo le pagué primero al prestamista")
- Alguien mira el ranking y dice "voy a subir"

---

## 10. RIESGOS Y PLAN B

| Riesgo | Probabilidad | Plan B |
|---|---|---|
| No da tiempo para los 5 juegos | Alta | **Prioridad: Kiosco > La Trampa > Qori Quiz > Invierte o Pierde > Mercado Rápido.** Los 3 primeros son los más pedagógicos. Si solo salen 3, el piloto sigue siendo válido. |
| Render free tier es muy lento (cold start) | Media | Pagar $7/mes por el plan Starter. Si es inaceptable: Railway ($5/mes) como alternativa. |
| La API de Claude/GPT es cara o lenta | Baja | Cachear respuestas por topic: si 5 alumnos preguntan "¿qué es interés compuesto?", la primera respuesta se cachea. Respuestas pre-armadas para los 20 conceptos como fallback. |
| El balance está roto (sueldo no alcanza o sobra demasiado) | Media | P3 hace un playtest manual el día 10: jugar 30 días virtuales a mano, anotar billetera en cada día. Si no funciona, ajustar `balance.yaml` (es un archivo, no código). |
| Integración frontend-backend tiene muchos bugs | Alta | El contrato de API del día 1 y los tipos TypeScript compartidos minimizan esto. P2 usa mocks que imitan exactamente el contrato hasta que P1 tenga endpoints reales (día 4–5). |
| Un fundador se enferma o tiene emergencia | Media | Los 3 deben entender el contrato de API completo. Cualquiera puede continuar el trabajo de otro con fricción pero sin bloqueo. El motor y los juegos son los más difíciles de transferir — documentar decisiones en el PR. |
