import bcrypt
import jwt
from datetime import datetime, timedelta
from app.core.config import get_settings

settings = get_settings()

def hash_password(password: str) -> str:
    """Genera un hash seguro para la contraseña proporcionada."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña proporcionada coincide con el hash almacenado."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(data: dict) -> str:
    """Crea un token de acceso JWT."""
    to_encode = data.copy()
    # Expiración fija a 24 horas según los requerimientos
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    
    # settings.jwt_secret viene de app/core/config.py
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")
    return encoded_jwt