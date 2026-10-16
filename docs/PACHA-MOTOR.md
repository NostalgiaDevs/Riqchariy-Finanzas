# Motor Pacha: ingresos, gastos y estrés

`app/modules/pacha/domain/` es independiente de SQLAlchemy, FastAPI, archivos,
reloj y red. `PlayerEconomy`, `Loan`, `InventoryItem` y `Balance` son modelos
Pydantic inmutables; sus colecciones son tuplas. Los sistemas devuelven un
estado nuevo y no modifican la configuración. Los importes usan `Decimal`.

## Reglas del piloto

- Tick 0 representa el estado inicial y no paga ni cobra gastos. El pipeline
  procesa `current_tick + 1`: ingresos → gastos → estrés. Incrementa `version`
  una vez por día. Cada función individual deja el tick y la versión intactos.
- Cada 7 ticks se paga `wage_per_period`, que ya es el sueldo efectivo.
  Un sistema futuro de trabajo calculará el efecto del rendimiento; no se
  vuelve a multiplicar ese sueldo por `job_performance` en ingresos.
- Comida 100, celular 25 y pasajes 40 intis cada 28 ticks. El cargo diario de
  cada categoría es la diferencia entre dos importes acumulados redondeados
  a céntimos (ROUND_HALF_UP). Así 28 cargos suman exactamente 165 intis.
- La billetera nunca es negativa. Lo que no se puede pagar se acumula en
  `unpaid_expenses`; no se inventa un préstamo ni se cobra ese atraso de nuevo.
  La política futura de recuperación de impagos queda fuera de estos sistemas.
- Estrés: `clamp(0.35*D + 0.25*E + 0.25*M + 0.15*G, 0, 1)`.
  Los pesos y ventanas están en `content/balance.yaml`.

Decisiones explícitas para completar las ambigüedades del documento del piloto:

| Factor | Regla adoptada |
|---|---|
| D | Deuda pendiente de préstamos / sueldo efectivo mensual (`wage_per_period * 28/7`), limitado a 1. Sin ingresos: 1 si hay deuda, 0 en caso contrario. |
| E | 1 si el fondo de emergencia es menor que el objetivo configurable de 150; 0 si lo alcanza. Este umbral es una decisión de balance, no una deducción de la fórmula original. |
| M | 1 si `last_late_tick` del jugador o de algún préstamo está en `[tick-13, tick]`; 0 de lo contrario. |
| G | 1 si no hay un gusto en `[tick-27, tick]`, usando `last_fun_tick` o el inventario; 0 de lo contrario. Sin historial de gustos, vale 1 desde el primer día. |

Los timestamps de base de datos permanecen en el ORM; nunca se generan dentro
del dominio. No se recalculan score, intereses, eventos o misiones en esta etapa.

## Integración

`get_economy_balance()` carga y valida YAML fuera del dominio. `adapters.py`
convierte filas ORM ↔ agregado y presenta el contrato del frontend con montos
JSON numéricos. `models.py` contiene el ORM usado por Alembic, sobre las tablas
existentes `users`, `classrooms`, `player_economy` y `economy_events`.
Los antiguos modelos en `app/models/` no se usan en este flujo.

- `POST /api/v1/auth/register`: alias, password y classroom_code; crea usuario
  y economía en una transacción. No requiere inventar un email.
- `POST /api/v1/auth/login`: alias/password, devuelve JWT con el ID de `users`.
- La autenticación anterior por email sigue disponible bajo
  `/api/v1/auth/email/{register,login,me}` para evitar rutas duplicadas.
- `GET /api/v1/pacha/state`: estado del usuario autenticado. Inicializa la
  economía de usuarios anteriores que aún no tengan una.
- `POST /api/v1/pacha/next-day`: cuerpo obligatorio `{"expected_tick": 0}`.
  Bloquea la fila del usuario/economía, verifica el tick y guarda estado y evento
  en una transacción. Si el cliente está desactualizado responde 409 sin avanzar.
  El cliente debe recargar el estado, no reintentar automáticamente el POST.
- Respuesta: `{tick, summary, new_state}`; el resumen incluye gastos efectivamente
  pagados y `unpaid_expenses` del día. El estado expone el total acumulado impago.
- Home consume esta respuesta con TanStack Query y actualiza el estado compartido.
  No calcula ingresos, gastos ni estrés en TypeScript.

La migración `20261014_pacha` conserva las tablas/cuentas y añade los campos
necesarios; convierte importes Float a Numeric(20,2), redondeando a céntimos.
No hace reset de datos. Su downgrade rechaza cuentas sin email para no borrarlas.

## Desarrollo y validación

Desde la raíz:

```sh
docker compose up -d
docker compose exec backend alembic upgrade head
docker compose exec backend python -m scripts.seed_content
```

El seed es idempotente: aula `RIQCHARIY-DEMO`, alias `alumno1` a `alumno10`,
contraseña `demo1234` para cuentas nuevas. Las cuentas existentes conservan sus
contraseñas y saldos. No admite un modo de borrado `--force`.

```sh
docker compose exec backend pytest -q
docker compose exec -e RUN_DB_TESTS=1 backend pytest -q
```

Las pruebas unitarias no necesitan PostgreSQL. Las pruebas de integración se
habilitan explícitamente y crean/eliminan esquemas `test_pacha_<uuid>` aislados;
no escriben en las tablas de la aplicación. Incluyen concurrencia y aislamiento
entre usuarios. Para tests locales: `cd backend` y `python -m pytest -q`.

El frontend usa el backend real. MSW está limitado a `src/test/mocks/`; se retiró
el simulador económico de TypeScript, los handlers de funciones futuras y el
service worker del navegador. Tienda, crédito, misiones y eventos siguen siendo
funciones pendientes, sin respuestas ficticias en la aplicación.
