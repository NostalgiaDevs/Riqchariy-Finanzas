from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core import security
from app.modules.auth import schemas, models, dependencies

router = APIRouter()

@router.post("/register", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(user_create: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # Verifica si el usuario ya existe
    result = await db.execute(select(models.User).where(models.User.email == user_create.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario con este correo electrónico ya existe.",
        )

    # Crea un nuevo usuario
    new_user = models.User(
        email=user_create.email,
        hashed_password=security.hash_password(user_create.password),
        name=user_create.name,
        classroom_code=user_create.classroom_code
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Genera un token JWT para el nuevo usuario
    token = security.create_access_token(data={"sub": str(new_user.id)})

    return schemas.AuthResponse(token=token, user=new_user)

@router.post("/login", response_model=schemas.AuthResponse)
async def login(user_login: schemas.UserLogin, db: AsyncSession = Depends(get_db)):
    # Verifica si el usuario existe
    result = await db.execute(select(models.User).where(models.User.email == user_login.email))
    user = result.scalars().first()
    if not user or not security.verify_password(user_login.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos.",
        )

    # Genera un token JWT para el usuario
    token = security.create_access_token(data={"sub": str(user.id)})

    return schemas.AuthResponse(token=token, user=user)

@router.get("/me", response_model=schemas.UserOut)
async def get_current_user(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user