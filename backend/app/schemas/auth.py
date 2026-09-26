from uuid import UUID

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    alias: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(..., min_length=8, max_length=100)
    classroom_code: str = Field(..., min_length=1, max_length=20)


class LoginRequest(BaseModel):
    alias: str = Field(..., min_length=1, max_length=30)
    password: str = Field(..., min_length=1, max_length=100)


class AuthResponse(BaseModel):
    player_id: UUID
    alias: str
    token: str
    expires_in: int = 86400
