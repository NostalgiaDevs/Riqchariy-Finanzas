# 🌅 Riqchariy Finanzas

> **Riqchariy** (quechua: *despertar*). No enseñamos teoría financiera: entrenamos decisiones financieras reales.

Plataforma EdTech gamificada para colegios del Perú. Los estudiantes no leen sobre finanzas: **viven** una vida financiera simulada — ingresos, gastos fijos, tentaciones, crédito, emergencias e inversión — dentro de una economía persistente llamada **Pacha**, acompañados por **Qori** (chatbot financiero con RAG) y medidos por un **dashboard conductual** que es lo que el colegio realmente compra.

![status](https://img.shields.io/badge/fase-0%20%C2%B7%20cimientos-D62E6C)
![stack](https://img.shields.io/badge/stack-FastAPI%20%2B%20Vue%203%20%2B%20Phaser-2AA8A0)
![license](https://img.shields.io/badge/licencia-privada-lightgrey)

---

## 📌 Qué es esto

| | |
|---|---|
| **Producto** | Programa anual de Educación Financiera Gamificada (B2B a colegios privados) |
| **Usuarios** | Estudiantes (12–17), docentes, administradores de colegio |
| **Cliente que paga** | El colegio |
| **Corazón técnico** | `Pacha Engine`: economía simulada determinista por ticks |
| **Diferenciador** | Reporte conductual por alumno (disciplina de ahorro, riesgo, impulsividad) |
| **Moneda del juego** | El **Inti** (ⵊ) |

**Sesión objetivo:** 5–10 minutos, 2–4 veces por semana + 1 sesión guiada en clase.

---

## 🧱 Arquitectura en 30 segundos

```
Cloudflare (CDN/WAF/SSL)
        │
  Frontend Vue 3 SPA ──iframe/postMessage──► Minijuegos Phaser
        │ REST + JWT · WebSocket
  FastAPI Gateway (modular monolith)
   ├── auth · users · learning
   ├── pacha/      ⭐ el motor económico (funciones puras + ticks)
   ├── game        (resultados de Phaser, anti-trampa)
   ├── chatbot     (LLM + RAG sobre Qdrant + estado del alumno)
   └── analytics   (métricas conductuales del event log)
        │
  PostgreSQL · Redis · Qdrant
```

**Regla de oro arquitectónica:** *modular monolith ahora, microservicios cuando los datos lo exijan, nunca antes.* ML real solo con 10,000+ decisiones registradas; antes de eso, IA basada en reglas.

**Principio rector del motor:** el motor es un sistema **determinista** de funciones puras sobre un estado versionado, alimentado por un flujo de eventos. Mismo estado + misma decisión + misma semilla → mismo resultado. Eso lo hace testeable, reproducible, auditable y balanceable.

---

## 🗂️ Estructura del monorepo

```
riqchariy/
├── backend/       FastAPI · modular monolith · el Pacha Engine
├── frontend/      Vue 3 + Vite + Pinia + Tailwind
├── games/         Minijuegos Phaser (builds aislados)
├── content/       Contenido como datos: eventos, ítems, balance.yaml
├── infra/         Docker, Nginx/Caddy, backups, (Terraform en F4)
├── docs/          ADRs, GDD, backlog, runbooks, los 5 documentos base
├── scripts/       Utilidades de desarrollo y operación
└── .github/       CI/CD (tests, lint, Simulation Lab, deploy)
```

Detalle completo y comentado en **[`docs/ESTRUCTURA.md`](docs/ESTRUCTURA.md)**.

---

## 🚀 Puesta en marcha (local)

**Requisitos:** Docker + Docker Compose, Node 20+, Python 3.12+, Make.

```bash
git clone git@github.com:<org>/riqchariy.git
cd riqchariy
cp .env.example .env          # completar secretos locales
make up                       # levanta postgres, redis, qdrant, backend, frontend
make migrate                  # aplica migraciones Alembic
make seed                     # colegio demo + aula + 10 alumnos + contenido base
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API (docs) | http://localhost:8000/docs |
| Postgres | localhost:5432 |
| Redis | localhost:6379 |
| Qdrant | http://localhost:6333 |

> **Gate de Fase 0:** `make up` debe funcionar en la máquina de cada fundador sin ajustes manuales. Si no corre, es un bug de prioridad alta — no un "en mi PC sí funciona".

### Comandos frecuentes

```bash
make test          # pytest + vitest
make lint          # ruff + eslint + prettier
make fmt           # autoformato
make tick          # avanza 1 tick virtual en el aula demo
make sim           # Simulation Lab: 10,000 agentes × 1 temporada
make logs          # logs de todos los contenedores
make down          # apaga y limpia
```

---

## ⏱️ Cómo funciona el motor Pacha (lo mínimo que todo el equipo debe saber)

- **1 tick = 1 día virtual.** Default: 4 ticks por día real → 1 semana real ≈ 1 mes virtual.
- Un worker procesa los ticks **por aula, en lote**; el alumno nunca ve 12 ticks procesarse en su cara: al volver recibe el **"Mientras no estabas…"**.
- Cada `*_system` es una **función pura** `(state, world, rng?) → state`. **Cero I/O adentro.** Toda la persistencia ocurre al final del pipeline.
- Orden fijo del pipeline: `income → expense → credit → investment → inflation → goals → events → stress → scoring → persist → publish`.
- Toda transición se escribe como evento inmutable en `economy_events` (event sourcing *light*): el dashboard y el ML se construyen del log, no del estado.
- El **preview** de una decisión corre exactamente la misma función pura sin persistir. Si el preview miente, el producto miente.

### Contratos principales

```
GET  /pacha/state                  estado del alumno
GET  /pacha/summary?since_tick=80  "lo que pasó mientras no estabas"
POST /pacha/decisions/preview      impacto simulado, sin aplicar
POST /pacha/decisions              aplica decisión
GET  /pacha/world                  inflación, temporada, precios
WS   /pacha/live                   ticks, precios del Qhatu, torneos
```

---

## 🎛️ Contenido como datos

Ítems, trabajos, eventos y constantes de balance viven en `content/` como YAML/JSON versionado en git — **nunca hardcodeado en Python**. El equipo pedagógico crea y ajusta contenido sin tocar código.

```bash
content/balance.yaml              # ⭐ todas las constantes económicas
content/events/*.json             # 28 cartas de evento (v1)
content/items/*.yaml              # tienda y Qhatu
content/jobs/*.yaml               # trabajos y sueldos
```

Cambiar el balance implica: editar `balance.yaml` → `make sim` → revisar umbrales → playtest → telemetría. **CI falla el build si el balance rompe los umbrales de fairness** (bot óptimo demasiado dominante, bot impulsivo sin ruta de salida, Gini del aula > 0.45).

---

## 🧭 Fase actual y hoja de ruta

| Fase | Periodo | Objetivo | Estado |
|---|---|---|---|
| 0 | Sem 1–2 | Cimientos: repo, entorno, ADRs | 🟡 en curso |
| 1 | Mes 1–3 | MVP piloto en 1 colegio real | ⬜ |
| 2 | Mes 4–6 | 3–5 colegios · chatbot v1 · dashboard que vende | ⬜ |
| 3 | Mes 7–12 | 10 colegios pagantes · operación estable | ⬜ |
| 4 | Año 2 H1 | Escala técnica · nube gestionada · PWA | ⬜ |
| 5 | Año 2 H2 | Plataforma de datos e IA real | ⬜ |
| 6 | Año 3+ | Microservicios · LATAM · Serie Semilla | ⬜ |

**Ningún gate se salta.** Los criterios de salida de cada fase están en `docs/02-plan-de-construccion-por-fases.md`.

---

## 🤝 Cómo contribuir (convenciones del equipo)

1. **Ramas:** `main` (protegida) ← `feat/<scope>-<descripcion>` · `fix/…` · `chore/…`
2. **Commits:** [Conventional Commits](https://www.conventionalcommits.org) — `feat(pacha): agrega credit_system con mora`
3. **PR obligatorio** entre fundadores. El code review es aprendizaje mutuo, no burocracia.
4. **Pre-commit:** ruff + eslint + prettier corren antes del commit. CI vuelve a verificarlo.
5. **Toda decisión de arquitectura deja un ADR** de 1 página en `docs/adr/` (contexto, opciones, elección, trade-offs).
6. **Nada fuera del alcance firmado se construye.** Las ideas nuevas van a `docs/backlog.md`.

### Cobertura de tests exigida

| Módulo | Mínimo |
|---|---|
| `backend/app/modules/pacha/` | **90%** |
| `backend/app/modules/scoring/` | **90%** |
| Resto del backend | 70% (desde Fase 3) |

El motor económico es el corazón: si calcula mal, el producto miente a un menor de edad sobre dinero.

---

## 🔐 Datos de menores — no negociable

Este proyecto maneja datos de estudiantes menores de edad bajo la **Ley 29733 (Protección de Datos Personales, Perú)**.

- Los alumnos **no se autoregistran**: el colegio crea las cuentas (carga por CSV del docente).
- Consentimiento de padres gestionado por el colegio; banco de datos registrado ante la ANPD.
- Datos personales cifrados en reposo; PII fuera de logs y de la telemetría de producto.
- **Jamás se venden datos.** Los reportes agregados son anónimos fuera del aula.
- Conversaciones del chatbot registradas solo para auditoría de seguridad, con retención acotada.
- Auditoría de equidad obligatoria en cualquier modelo ML: no puede penalizar por colegio o distrito.

Ver `docs/compliance/` antes de tocar cualquier tabla con PII.

---

## 📚 Documentación base

| Doc | Contenido |
|---|---|
| `docs/01-documento-maestro.md` | Producto, negocio, stack, marketing, startup |
| `docs/02-plan-de-construccion-por-fases.md` | Fases 0–6, gates, evolución del stack |
| `docs/03-arquitectura-motor-pacha.md` | Motor económico: dominio, ticks, eventos, APIs |
| `docs/04-diseno-visual-y-ciencia.md` | Identidad visual, pantallas, fundamento científico |
| `docs/05-gdd-simulador.md` | Game Design Document: loops, números, balanceo |
| `docs/adr/` | Decisiones de arquitectura |
| `docs/runbooks/` | Qué hacer cuando algo se cae en horario de clase |

---

## 🎨 Identidad rápida (para no improvisar estilos)

```
Fondo    #FAF6EF (crema) · oscuro #141B2E
Primario #D62E6C (fucsia andino)
Dinero   #F2A81D (dorado inti)
Ahorro   #2E9E6B · Deuda #C4472F
Acentos  #2AA8A0 · #7B3FA0
Tipos    Display redondeada (títulos) + Inter (UI) · números SIEMPRE tabulares
Ligas    Chaski → Qollqa → Amauta → Apu
```

Accesibilidad AA obligatoria. La deuda nunca se comunica solo con color: siempre lleva ícono y patrón.

---

## 📄 Licencia

Código propietario. © Riqchariy. Todos los derechos reservados.
Marca "Riqchariy" en trámite ante INDECOPI.
