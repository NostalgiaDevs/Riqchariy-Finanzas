"""Alias authentication backed by the same users table as Pacha."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.content import get_economy_balance
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.models import User
from app.modules.classroom.models import Classroom
from app.modules.pacha.adapters import new_row
from app.modules.pacha.domain.balance import initial_economy
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])
Database = Annotated[AsyncSession, Depends(get_db)]


def response(user: User) -> AuthResponse:
    return AuthResponse(
        player_id=user.id, alias=user.alias, token=create_access_token({"sub": str(user.id)})
    )


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(body: RegisterRequest, db: Database):
    code = body.classroom_code.strip().upper()
    classroom = (
        await db.execute(select(Classroom).where(Classroom.code == code))
    ).scalar_one_or_none()
    if classroom is None:
        raise HTTPException(404, "Aula no encontrada")
    alias = body.alias.strip().lower()
    if (await db.execute(select(User.id).where(User.alias == alias))).scalar_one_or_none():
        raise HTTPException(409, "El alias ya está en uso")
    user = User(
        alias=alias, name=alias, classroom_code=code, password_hash=hash_password(body.password)
    )
    db.add(user)
    try:
        await db.flush()
        db.add(new_row(initial_economy(user.id, get_economy_balance())))
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(409, "El alias ya está en uso") from exc
    return response(user)


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: Database):
    user = (
        await db.execute(select(User).where(User.alias == body.alias.strip().lower()))
    ).scalar_one_or_none()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Alias o contraseña incorrectos")
    return response(user)
