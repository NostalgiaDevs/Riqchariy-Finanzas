# Avance del Backend — Riqchariy

> **Responsable:** santiago2706 (backend)
> **Fase del proyecto:** Fase 0 — Cimientos
> **Última actualización:** 2026-09-21

Este documento registra el avance del backend (`backend/`) dentro del monorepo Riqchariy: qué está construido, cómo está configurado y qué queda pendiente para cerrar la Fase 0.

---

## 1. Resumen

El backend es una API en **FastAPI** (modular monolith), pensada para correr sobre **PostgreSQL + pgvector** y **Redis**, con despliegue objetivo en Render. Hasta ahora se dejó lista la base del proyecto: estructura de módulos, configuración centralizada con Pydantic, conexión asíncrona a base de datos, dependencias del proyecto y primeros tests.

Todavía no hay lógica de negocio (Pacha, auth, chatbot, etc.) implementada — los routers de cada módulo existen solo como esqueleto.

---

## 2. Estructura creada

```
backend/
├── app/
│   ├── main.py                  # instancia FastAPI, CORS, montaje de routers, /health
│   ├── core/
│   │   ├── config.py             # Settings (Pydantic) — variables de entorno
│   │   └── database.py           # engine asíncrono, AsyncSessionLocal, Base, get_db
│   └── modules/
│       ├── auth/router.py
│       ├── pacha/router.py
│       ├── game/router.py
│       ├── chatbot/router.py
│       ├── shop/router.py
│       ├── missions/router.py
│       └── leaderboard/router.py
├── tests/
│   ├── test_config.py            # valida parsing de CORS y reglas de JWT_SECRET
│   └── test_health.py            # valida GET /health
├── pyproject.toml                # dependencias + config de ruff/pytest
├── Dockerfile
└── .dockerignore
```

Todos los módulos (`auth`, `pacha`, `game`, `chatbot`, `shop`, `missions`, `leaderboard`) están registrados en `main.py` con su prefijo `/api/v1/<modulo>`, pero sus routers aún no tienen endpoints — son placeholders (`APIRouter()` vacío).

---

## 3. `app/core/config.py` — Configuración centralizada

- Clase `Settings(BaseSettings)` que carga variables desde `.env` (busca `../.env` y `.env`, según desde dónde se ejecute).
- Variables cubiertas: app (`app_name`, `app_env`, `app_debug`), CORS, base de datos, Redis, pgvector, JWT, Claude/Anthropic, Pacha (semilla y ticks), y rate limiting.
- `cors_origins` acepta tanto una lista como un string separado por comas (`field_validator`), para que `CORS_ORIGINS` en `.env` se pueda escribir como texto plano.
- Regla de seguridad: si `app_env != "development"` y el `jwt_secret` sigue siendo el valor de ejemplo (`INSECURE_JWT_SECRET`), la app **no arranca** (`model_validator` lanza `ValueError`). Evita subir a producción con el secreto por defecto.
- `get_settings()` con `@lru_cache` expone una instancia única `settings`, importada en el resto de la app.
- **Tests (`tests/test_config.py`):**
  - `cors_origins` se separa correctamente por coma.
  - Producción rechaza el `jwt_secret` de ejemplo.
  - Producción acepta un `jwt_secret` propio.

---

## 4. `app/core/database.py` — Conexión a base de datos

- Motor asíncrono con `create_async_engine`, usando `settings.database_url` (por defecto `postgresql+psycopg://...`), `echo` y `pool_size` configurables por entorno.
- `AsyncSessionLocal`: fábrica de sesiones (`async_sessionmaker`) con `expire_on_commit=False` para poder seguir usando los objetos tras el commit.
- `Base(DeclarativeBase)`: clase base que usarán todos los modelos ORM que se agreguen más adelante.
- `get_db()`: dependencia de FastAPI (`Depends(get_db)`) que entrega una `AsyncSession` por request y la cierra automáticamente al terminar.
- Verificado que el módulo importa correctamente (`engine`, `AsyncSessionLocal`, `Base`, `get_db`) ejecutándolo desde `backend/`, que es el `cwd` esperado por `uvicorn app.main:app`.

Aún no hay modelos declarados (`class ... (Base)`), ni migraciones de Alembic, así que la conexión existe pero no hay tablas que crear todavía.

---

## 5. Dependencias (`pyproject.toml`)

Quedaron fijadas las dependencias base del proyecto:

| Categoría | Paquetes |
|---|---|
| Web | `fastapi`, `uvicorn[standard]`, `httpx` |
| Config/validación | `pydantic`, `pydantic-settings`, `pyyaml` |
| Base de datos | `sqlalchemy`, `alembic`, `psycopg[binary]`, `pgvector` |
| Cache / rate limit | `redis`, `slowapi` |
| Auth | `pyjwt`, `bcrypt` |
| Chatbot | `anthropic` |
| Dev | `ruff`, `pytest`, `pytest-cov` |

También quedó configurado `ruff` (línea 100, reglas `E,W,F,I,B,UP,SIM`, formato con comillas dobles) y `pytest` apuntando a `tests/`.

---

## 6. Infraestructura local

- **`docker-compose.yml`**: define `db` (`pgvector/pgvector:pg16`), `redis` (`redis:7-alpine`) y `backend` (build desde `backend/Dockerfile`, con hot-reload por volumen). Healthchecks configurados para Postgres y Redis.
- **`Dockerfile`**: imagen `python:3.11-slim`, instala el proyecto en modo editable con extras `dev`.
- **`Makefile`**: comandos para levantar servicios (`make up`/`down`/`logs`), correr el backend suelto (`make backend`), migraciones (`make migrate*`), seed, lint/format, tests (`make test`, `make test-cov`) y simulación de Pacha.
- **`.env.example`**: plantilla con todas las variables que `Settings` espera (app, CORS, DB, Redis, pgvector, JWT, Claude, Pacha, rate limiting, y las `VITE_*` del frontend).

---

## 7. Testing

- `tests/test_config.py` y `tests/test_health.py` ya cubren configuración y el endpoint `/health`.
- `GET /health` responde `{"status": "ok", "version": "0.1.0"}` — todavía sin verificar conexión real a Postgres/Redis (pendiente, ver sección 8).

---

## 8. Pendiente para cerrar la Fase 0

- [ ] Verificar `make up` de punta a punta (Postgres + Redis + backend) sin ajustes manuales — es el gate formal de la Fase 0.
- [ ] Inicializar Alembic (`alembic init`) y primera migración (al menos `CREATE EXTENSION IF NOT EXISTS vector`).
- [ ] Ampliar `/health` para reportar estado real de `db` y `redis` (ver `docs/api/endpoints-piloto.md`).
- [ ] Agregar cliente de Redis en `app/core/`.
- [ ] Tests para `database.py`.
- [ ] Scripts referenciados por el `Makefile` que aún no existen: `scripts/seed_content.py`, `scripts/simulate.py`, `scripts/validate_balance.py`.
- [ ] CI (`.github/workflows/`) con lint + tests.
- [ ] `content/balance.yaml` con las constantes económicas del piloto.

---

## 9. Próximos pasos (arranque de Fase 1, según `docs/ALCANCE-MVP.md`)

1. Modelos `Player` y `Classroom` + migración inicial.
2. Módulo `auth`: registro por alias + código de aula, login, JWT.
3. `PlayerEconomy` y `GET /pacha/state`.
4. Pipeline de ticks de Pacha como funciones puras (`income → expense → credit → savings → goals → stress → scoring → events → persist`).

---

## 10. Avance Fase 1 — Módulo de Autenticación (S1.BE.02)

Se ha completado la implementación de la autenticación propia (Custom Auth) para dar inicio a la Fase 1. La arquitectura del backend está estructurada y lista para conectarse a la base de datos de Supabase en el próximo paso de infraestructura, manteniendo la lógica construida intacta.

**Nuevos componentes implementados:**

* **Modelos (`app/modules/auth/models.py`):** Creación de la tabla y modelo ORM `User` heredando de `Base`, configurado con `id` (UUID), `email` único, `hashed_password`, `name` y `classroom_code` opcional.
* **Esquemas (`app/modules/auth/schemas.py`):** Definición de validadores Pydantic (`UserCreate`, `UserLogin`, `UserOut`, `AuthResponse`) con validación estricta de formato de correo electrónico mediante `pydantic[email]`.
* **Seguridad (`app/core/security.py`):** Funciones centralizadas utilizando `bcrypt` para el hasheo de contraseñas y `pyjwt` para la generación de tokens de acceso estáticos con una expiración de 24 horas.
* **Middleware (`app/modules/auth/dependencies.py`):** Implementación de la dependencia `get_current_user` para interceptar el header `Authorization: Bearer`, validar la firma del token, manejar errores de expiración (401) e inyectar el usuario autenticado en la sesión.
* **Endpoints (`app/modules/auth/router.py`):**
* `POST /register`: Validación de correos duplicados (HTTP 409), creación segura del usuario y generación del JWT.
* `POST /login`: Verificación de credenciales (HTTP 401 si son incorrectas) y retorno del JWT.
* `GET /me`: Endpoint protegido que valida el token y retorna los datos del usuario actual.



**Actualización del estado del proyecto:**

* **Dependencias:** Se agregaron formalmente `bcrypt`, `pyjwt` y `pydantic[email]`.
* **Delegación:** La conexión física de la cadena asíncrona hacia el pooler de Supabase y la ejecución de la primera migración de Alembic para crear la tabla `users` quedan como tareas de infraestructura pendientes para otro miembro del equipo.
* **Siguiente en la lista:** Desarrollar los modelos `Player` y `Classroom`, y avanzar con `PlayerEconomy` y `GET /pacha/state`.