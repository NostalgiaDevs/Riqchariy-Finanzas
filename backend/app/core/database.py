from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.core.config import get_settings

settings = get_settings()
DATABASE_URL = settings.database_url

engine = create_async_engine(
    DATABASE_URL,
    echo=settings.database_echo,
    pool_size=settings.database_pool_size,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

class Base(DeclarativeBase):
    """La base de datos declarativa para SQLAlchemy."""
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Devuelve una sesión de base de datos asincrónica."""
    async with AsyncSessionLocal() as session:     
        yield session
        
