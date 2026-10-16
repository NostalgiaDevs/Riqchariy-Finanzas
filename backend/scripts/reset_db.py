"""Borra todas las tablas, re-aplica las migraciones y corre el seed. Solo para desarrollo."""

import asyncio
import sys

from alembic import command
from alembic.config import Config

from app.core.config import get_settings
from scripts.seed_content import seed


def reset() -> None:
    if get_settings().app_env != "development":
        sys.exit("❌ reset solo está permitido con APP_ENV=development")

    alembic_cfg = Config("alembic.ini")
    command.downgrade(alembic_cfg, "base")
    command.upgrade(alembic_cfg, "head")
    print("🗑️  Base de datos re-creada")

    asyncio.run(seed())


if __name__ == "__main__":
    reset()
