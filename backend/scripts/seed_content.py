"""Puebla la BD con el aula demo y 10 alumnos. Idempotente: se puede correr varias veces."""

import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.content import get_balance, get_events
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.modules.auth.models import User
from app.modules.classroom.models import Classroom
from app.modules.pacha.domain.state import PlayerEconomy

CLASSROOM_CODE = "RIQCHARIY-DEMO"
CLASSROOM_NAME = "Aula Demo Riqchariy"
STUDENT_COUNT = 10
STUDENT_PASSWORD = "demo1234"


async def seed_classroom(db: AsyncSession) -> bool:
    result = await db.execute(select(Classroom).where(Classroom.code == CLASSROOM_CODE))
    if result.scalars().first():
        return False
    db.add(Classroom(code=CLASSROOM_CODE, name=CLASSROOM_NAME))
    return True


async def seed_students(db: AsyncSession, initial_state: dict) -> int:
    emails = [f"alumno{i}@demo.pe" for i in range(1, STUDENT_COUNT + 1)]
    result = await db.execute(select(User.email).where(User.email.in_(emails)))
    existing = set(result.scalars().all())

    password_hash = hash_password(STUDENT_PASSWORD)
    created = 0
    for i, email in enumerate(emails, start=1):
        if email in existing:
            continue
        user = User(
            email=email,
            password_hash=password_hash,
            name=f"Alumno {i}",
            classroom_code=CLASSROOM_CODE,
        )
        db.add(user)
        await db.flush()
        db.add(PlayerEconomy(player_id=user.id, **initial_state))
        created += 1
    return created


async def seed() -> None:
    balance = get_balance()
    events = get_events()
    print(f"📄 Contenido válido: balance.yaml v{balance['version']}, {len(events)} eventos")

    async with AsyncSessionLocal() as db:
        classroom_created = await seed_classroom(db)
        students_created = await seed_students(db, balance["initial_state"])
        await db.commit()

    print(f"🏫 Aula {CLASSROOM_CODE}: {'creada' if classroom_created else 'ya existía'}")
    existing = STUDENT_COUNT - students_created
    print(f"👥 Alumnos creados: {students_created} (ya existían: {existing})")


if __name__ == "__main__":
    asyncio.run(seed())
