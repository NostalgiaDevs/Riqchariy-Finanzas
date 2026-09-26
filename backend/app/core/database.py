import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://riqchariy:password@localhost:5432/riqchariy_db",
)

# SQLAlchemy async requiere asyncpg
if DATABASE_URL.startswith("postgresql://"):
    _async_url = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql+asyncpg://"):
    _async_url = DATABASE_URL
else:
    _async_url = DATABASE_URL

engine = create_async_engine(_async_url, echo=False)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency de FastAPI para obtener una sesión de BD."""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
