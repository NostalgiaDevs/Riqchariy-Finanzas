"""
S1.DB.03 — Script de seed y datos iniciales (versión SYNC)
===========================================================
Versión sincrónica con psycopg2. Usa esta si no tienes asyncpg instalado.

Uso:
  cd backend && python -m scripts.seed_content_sync
  o cambiar el Makefile para apuntar aquí
"""

import json
import os
import sys
from pathlib import Path
from uuid import uuid4

import yaml
from passlib.context import CryptContext
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

# ──────────────────────────────────────────────
# Configuración
# ──────────────────────────────────────────────

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://riqchariy:password@localhost:5432/riqchariy_db",
)

# Asegurar driver sync
if "+asyncpg" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("+asyncpg", "+psycopg")
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://")

CONTENT_DIR = Path(os.getenv("CONTENT_DIR", "/app/content"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ──────────────────────────────────────────────
# Datos de seed
# ──────────────────────────────────────────────

DEMO_CLASSROOM_CODE = "RIQCHARIY-DEMO"
DEMO_CLASSROOM_NAME = "Piloto Riqchariy — Aula Demo"
NUM_STUDENTS = 10
DEFAULT_PASSWORD = "demo1234"
DEFAULT_SEED_BASE = 42


def main():
    print("=" * 50)
    print("🌱 Riqchariy — Seed de datos iniciales")
    print("=" * 50)

    # ── Validar contenido ──
    print("\n📂 Validando archivos de contenido...")
    _validate_content()

    # ── Conectar a BD ──
    print("\n📦 Conectando a la base de datos...")
    try:
        engine = create_engine(DATABASE_URL, echo=False)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("  ✅ Conexión exitosa")
    except Exception as e:
        print(f"  ❌ No se pudo conectar: {e}")
        print("\n  Verifica:")
        print("  1. docker compose up db")
        print("  2. DATABASE_URL correcto")
        sys.exit(1)

    # ── Seed ──
    print("\n📦 Insertando datos...")
    engine = create_engine(DATABASE_URL, echo=False)

    with Session(engine) as session:
        # 1. Verificar si ya existe
        result = session.execute(
            text("SELECT id FROM classrooms WHERE code = :code"),
            {"code": DEMO_CLASSROOM_CODE},
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"\n⚠️  El aula '{DEMO_CLASSROOM_CODE}' ya existe (id: {existing})")
            print("   Usa --force para borrar y re-crear, o borra manualmente:")
            print("   DELETE FROM player_economy; DELETE FROM players; DELETE FROM classrooms;")

            if "--force" in sys.argv:
                print("\n🔄 --force detectado, borrando datos existentes...")
                session.execute(text("DELETE FROM player_economy"))
                session.execute(text("DELETE FROM players"))
                session.execute(text("DELETE FROM classrooms"))
                session.commit()
                print("   ✅ Datos borrados")
            else:
                return

        # 2. Crear classroom
        classroom_id = str(uuid4())
        session.execute(
            text("INSERT INTO classrooms (id, code, name) VALUES (:id, :code, :name)"),
            {"id": classroom_id, "code": DEMO_CLASSROOM_CODE, "name": DEMO_CLASSROOM_NAME},
        )
        print(f"\n🏫 Aula creada: {DEMO_CLASSROOM_CODE}")

        # 3. Crear alumnos + economy
        password_hash = pwd_context.hash(DEFAULT_PASSWORD)

        for i in range(1, NUM_STUDENTS + 1):
            player_id = str(uuid4())

            # Player
            session.execute(
                text("""
                    INSERT INTO players (id, alias, password_hash, classroom_id, is_active)
                    VALUES (:id, :alias, :pw, :cid, true)
                """),
                {
                    "id": player_id,
                    "alias": f"alumno{i}",
                    "pw": password_hash,
                    "cid": classroom_id,
                },
            )

            # PlayerEconomy
            session.execute(
                text("""
                    INSERT INTO player_economy (
                        id, player_id, wallet,
                        savings_goal, savings_emergency, savings_free,
                        job_id, job_performance, credit_score,
                        stress, score, league,
                        current_tick, goal_target, goal_saved,
                        flags, pending_events, seed
                    ) VALUES (
                        :id, :pid, 0,
                        0, 0, 0,
                        'ayudante_kiosco', 0.70, 500,
                        0.15, 550, 'chaski',
                        0, 80, 0,
                        '{}', '{}', :seed
                    )
                """),
                {
                    "id": str(uuid4()),
                    "pid": player_id,
                    "seed": DEFAULT_SEED_BASE + i,
                },
            )

        session.commit()
        print(f"👥 {NUM_STUDENTS} alumnos creados (alumno1..alumno{NUM_STUDENTS})")
        print(f"   Password: {DEFAULT_PASSWORD}")
        print(f"💰 PlayerEconomy inicializado (wallet=0, score=550, league=chaski)")

    print("\n" + "=" * 50)
    print("✅ Seed completado")
    print("=" * 50)
    print(f"\nPrueba login:")
    print(f'  curl -X POST http://localhost:8000/api/v1/auth/login \\')
    print(f'    -H "Content-Type: application/json" \\')
    print(f'    -d \'{{"alias": "alumno1", "password": "demo1234"}}\'')


def _validate_content():
    """Valida que los archivos de contenido existan y sean parseables."""
    checks = [
        ("balance.yaml", CONTENT_DIR / "balance.yaml", "yaml"),
        ("shop.yaml", CONTENT_DIR / "items" / "shop.yaml", "yaml"),
        ("jobs.yaml", CONTENT_DIR / "jobs" / "jobs.yaml", "yaml"),
    ]

    for name, path, fmt in checks:
        if not path.exists():
            print(f"  ⚠️  {name} no encontrado")
            continue
        try:
            data = yaml.safe_load(path.read_text(encoding="utf-8"))
            print(f"  ✅ {name} ({len(data)} keys)" if isinstance(data, dict) else f"  ✅ {name}")
        except Exception as e:
            print(f"  ❌ {name}: {e}")

    events_dir = CONTENT_DIR / "events"
    if events_dir.exists():
        for f in sorted(events_dir.glob("*.json")):
            try:
                data = json.loads(f.read_text(encoding="utf-8"))
                count = len(data.get("events", [])) if isinstance(data, dict) else len(data)
                print(f"  ✅ {f.name} ({count} eventos)")
            except Exception as e:
                print(f"  ❌ {f.name}: {e}")
    else:
        print("  ⚠️  events/ no encontrado")


if __name__ == "__main__":
    main()
