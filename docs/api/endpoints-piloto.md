# API Endpoints — Piloto Riqchariy v0.1

Base URL: `{API_URL}/api/v1`

---

## Auth

### `POST /auth/register`
Registrar nuevo jugador.

**Body:**
```json
{
  "alias": "valeria_14",
  "password": "min8chars",
  "classroom_code": "AULA-001"
}
```

**Response 201:**
```json
{
  "player_id": "uuid",
  "alias": "valeria_14",
  "token": "jwt..."
}
```

### `POST /auth/login`
Iniciar sesión.

**Body:**
```json
{
  "alias": "valeria_14",
  "password": "min8chars"
}
```

**Response 200:**
```json
{
  "player_id": "uuid",
  "alias": "valeria_14",
  "token": "jwt...",
  "expires_in": 86400
}
```

---

## Pacha (Motor de simulación)

### `GET /pacha/state`
Obtener estado completo del jugador.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "player_id": "uuid",
  "wallet": 135,
  "savings": {
    "meta": { "balance": 140, "goal_item": "laptop", "goal_target": 900 },
    "emergencias": { "balance": 80 },
    "libre": { "balance": 0 }
  },
  "job": {
    "id": "ayudante_kiosco",
    "name": "Ayudante de kiosco",
    "wage_per_week": 60,
    "performance": 0.75
  },
  "loans": [
    {
      "id": "uuid",
      "product": "banco",
      "principal": 100,
      "remaining": 65,
      "monthly_rate": 0.05,
      "installment": 55,
      "next_due_tick": 21
    }
  ],
  "credit_score": 610,
  "stress": 0.25,
  "score": 642,
  "league": "chaski",
  "current_tick": 14,
  "inventory": ["candado"],
  "flags": ["decision_informada"],
  "pending_events": ["EMR-001"],
  "active_missions": ["MSN-001", "MSN-004", "MSN-009"]
}
```

### `POST /pacha/next-day`
Avanzar un día (tick). El backend ejecuta el pipeline completo.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "tick": 15,
  "summary": {
    "income": 0,
    "expenses": 25,
    "interest_earned": 0.56,
    "loan_payments": 0,
    "events_triggered": [],
    "missions_progress": {
      "MSN-001": { "current": 15, "target": 20, "complete": false }
    },
    "score_change": 3,
    "stress_change": -0.01
  },
  "new_state": { "...PlayerEconomy completo..." }
}
```

### `POST /pacha/decisions`
Tomar una decisión en un evento.

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "event_id": "EMR-001",
  "choice_id": "farmacia"
}
```

**Response 200:**
```json
{
  "outcome": "Te recuperas rápido. Dinero bien gastado en tu salud.",
  "effects": {
    "wallet_change": -40,
    "stress_change": -0.03,
    "score_change": 5,
    "flags_added": [],
    "teaches": ["fondo_de_emergencia", "prevencion"]
  },
  "new_state": { "...PlayerEconomy actualizado..." }
}
```

### `POST /pacha/decisions/preview`
Ver el impacto de una decisión ANTES de tomarla.

**Body:**
```json
{
  "event_id": "TMP-001",
  "choice_id": "contado"
}
```

**Response 200:**
```json
{
  "preview": {
    "wallet_after": 9,
    "stress_after": 0.20,
    "warning": "Te quedarías con ⵊ9 hasta el viernes. Sin colchón si pasa algo.",
    "risk_level": "medium"
  }
}
```

---

## Ahorro

### `POST /pacha/savings/transfer`
Transferir intis entre billetera y frascos.

**Body:**
```json
{
  "from": "wallet",
  "to": "meta",
  "amount": 20
}
```

**Response 200:**
```json
{
  "success": true,
  "wallet": 115,
  "jar_balance": 160,
  "friction_warning": null
}
```

> Si `from` es "emergencias", incluye `friction_warning`: "¿Seguro? Este frasco te protege."

---

## Tienda

### `GET /shop/items`
Items disponibles esta semana (rotación de 4).

**Response 200:**
```json
{
  "rotation_week": 2,
  "items": [
    {
      "id": "zapatillas",
      "name": "Zapatillas nuevas",
      "price": 180,
      "icon": "👟",
      "description": "Las que todos quieren.",
      "installment_available": true,
      "installment_detail": {
        "per_month": 48,
        "months": 3,
        "total": 144
      },
      "can_afford": true
    }
  ]
}
```

### `POST /shop/buy`
Comprar un item.

**Body:**
```json
{
  "item_id": "zapatillas",
  "payment_method": "contado"
}
```

**Response 200:**
```json
{
  "success": true,
  "item": "zapatillas",
  "cost": 180,
  "payment_method": "contado",
  "new_wallet": 9,
  "stress_change": -0.05
}
```

---

## Minijuegos

### `POST /games/results`
Enviar resultado de un minijuego.

**Body:**
```json
{
  "game_id": "kiosco",
  "data": {
    "score": 850,
    "items_sold": 12,
    "time_seconds": 45,
    "perfect": false
  }
}
```

**Response 200:**
```json
{
  "reward": 28,
  "performance_update": 0.82,
  "missions_progress": {
    "MSN-007": { "complete": false, "reason": "Need perfect score" }
  },
  "message": "¡Buen turno en el kiosco! Ganaste ⵊ28."
}
```

---

## Leaderboard

### `GET /leaderboard`
Ranking del aula.

**Query params:** `?limit=20&sort=score`

**Response 200:**
```json
{
  "classroom": "AULA-001",
  "rankings": [
    {
      "rank": 1,
      "alias": "andres_15",
      "score": 780,
      "league": "qollqa",
      "league_icon": "🏛️"
    },
    {
      "rank": 2,
      "alias": "valeria_14",
      "score": 642,
      "league": "chaski",
      "league_icon": "🏃"
    }
  ],
  "my_rank": 2,
  "total_players": 30
}
```

---

## Chatbot Qori

### `POST /chatbot/message`
Enviar mensaje a Qori.

**Body:**
```json
{
  "message": "¿Qué es el interés compuesto?"
}
```

**Response 200:**
```json
{
  "response": "📚 Es cuando ganas interés sobre tu interés. Si tienes ⵊ100 al 4% mensual, el primer mes ganas ⵊ4. Pero el segundo mes ganas 4% sobre ⵊ104 — y así va creciendo como una bola de nieve.\n\n¿Quieres ver cuánto crecería tu ahorro actual en 3 meses?",
  "concepts_referenced": ["interes"],
  "sources": ["04-interes.md"]
}
```

**Rate limit:** 10 mensajes/minuto por usuario.

---

## Misiones

### `GET /missions`
Misiones activas del jugador.

**Response 200:**
```json
{
  "active": [
    {
      "id": "MSN-001",
      "name": "Hormiguita",
      "description": "Ahorra al menos ⵊ20 esta semana.",
      "icon": "🐜",
      "progress": { "current": 15, "target": 20 },
      "reward": 15,
      "expires_tick": 21
    }
  ],
  "completed_this_week": [],
  "claimable": []
}
```

### `POST /missions/{id}/claim`
Reclamar recompensa de misión completada.

**Response 200:**
```json
{
  "mission_id": "MSN-001",
  "reward": 15,
  "new_wallet": 150,
  "message": "🐜 ¡Misión cumplida! +ⵊ15"
}
```

---

## Health

### `GET /health`
Estado del servicio. Sin autenticación (fuera del prefijo `/api/v1`).

> Estado actual: solo devuelve `status` y `version`. Los campos `db`, `redis` y `uptime_seconds` se agregan cuando existan esas conexiones.

**Response 200:**
```json
{
  "status": "ok",
  "version": "0.1.0-piloto",
  "db": "connected",
  "redis": "connected",
  "uptime_seconds": 3600
}
```

---

## Códigos de error comunes

| Código | Significado |
|--------|-------------|
| 400 | Bad Request — body inválido o acción no permitida (ej: comprar sin dinero) |
| 401 | Unauthorized — token faltante o expirado |
| 404 | Not Found — recurso no existe |
| 409 | Conflict — acción contradictoria (ej: transferir más de lo que tienes) |
| 429 | Too Many Requests — rate limit excedido (chatbot) |
| 500 | Internal Server Error — bug del servidor |

## Notas de implementación
- Todos los endpoints requieren `Authorization: Bearer {token}` excepto `/auth/*` y `/health`
- Respuestas siempre en JSON
- Fechas en ISO 8601
- Montos en enteros (intis, sin decimales excepto interés)
- El frontend debe manejar el estado optimistamente y reconciliar con la respuesta del server
