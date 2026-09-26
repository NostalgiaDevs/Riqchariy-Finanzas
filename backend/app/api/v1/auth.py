"""Endpoints de autenticación: registro y login."""

import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.classroom import Classroom
from app.models.economy import PlayerEconomy
from app.models.player import Player
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_SECONDS = int(os.getenv("JWT_EXPIRE_SECONDS", "86400"))


def _create_token(player_id: str) -> str:
    """Genera un JWT con player_id y expiración."""
    payload = {
        "sub": player_id,
        "exp": datetime.now(timezone.utc) + timedelta(seconds=JWT_EXPIRE_SECONDS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Registrar nuevo jugador."""
    # Verificar que el aula existe
    result = await db.execute(
        select(Classroom).where(Classroom.code == body.classroom_code)
    )
    classroom = result.scalar_one_or_none()
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Aula '{body.classroom_code}' no encontrada",
        )

    # Verificar alias único
    result = await db.execute(select(Player).where(Player.alias == body.alias))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El alias '{body.alias}' ya está en uso",
        )

    # Crear jugador
    player = Player(
        alias=body.alias,
        password_hash=pwd_context.hash(body.password),
        classroom_id=classroom.id,
    )
    db.add(player)
    await db.flush()  # Para obtener el id generado

    # Crear economy inicial
    import random
    economy = PlayerEconomy(
        player_id=player.id,
        wallet=0,
        score=550,
        league="chaski",
        seed=random.randint(1, 999999),
    )
    db.add(economy)
    await db.commit()

    token = _create_token(str(player.id))
    return AuthResponse(
        player_id=player.id,
        alias=player.alias,
        token=token,
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Iniciar sesión."""
    result = await db.execute(select(Player).where(Player.alias == body.alias))
    player = result.scalar_one_or_none()

    if not player or not pwd_context.verify(body.password, player.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Alias o contraseña incorrectos",
        )

    if not player.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada",
        )

    # Actualizar last_login
    player.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    token = _create_token(str(player.id))
    return AuthResponse(
        player_id=player.id,
        alias=player.alias,
        token=token,
    )
