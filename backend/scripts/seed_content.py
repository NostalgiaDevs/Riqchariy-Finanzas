"""Idempotent demo seed using the same tables and initial state as registration."""

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.content import get_economy_balance, get_events
from app.core.security import hash_password
from app.modules.auth.models import User
from app.modules.classroom.models import Classroom
from app.modules.pacha.adapters import new_row
from app.modules.pacha.domain.balance import initial_economy
from app.modules.pacha.models import PlayerEconomy


def main():
    balance = get_economy_balance()
    get_events()
    url = get_settings().database_url.replace("+asyncpg", "+psycopg")
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    engine = create_engine(url)
    with Session(engine) as session, session.begin():
        code = "RIQCHARIY-DEMO"
        classroom = session.scalar(select(Classroom).where(Classroom.code == code))
        if classroom is None:
            session.add(Classroom(code=code, name="Piloto Riqchariy — Aula Demo"))
        password_hash = hash_password("demo1234")
        for index in range(1, 11):
            alias = f"alumno{index}"
            user = session.scalar(select(User).where(User.alias == alias))
            if user is None:
                # Link legacy demo users without replacing passwords or balances.
                user = session.scalar(select(User).where(User.email == f"{alias}@demo.pe"))
                if user is None:
                    user = User(name=alias, classroom_code=code, password_hash=password_hash)
                    session.add(user)
                user.alias = alias
                session.flush()
            if session.get(PlayerEconomy, user.id) is None:
                session.add(new_row(initial_economy(user.id, balance)))
    engine.dispose()
    print("Seed listo: RIQCHARIY-DEMO, alumno1..alumno10 / demo1234. Datos existentes conservados.")


if __name__ == "__main__":
    main()
