from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

INSECURE_JWT_SECRET = "cambiar-esto-con-openssl-rand-hex-64"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"),
        extra="ignore",
    )

    # --- App ---
    app_name: str = "riqchariy"
    app_env: str = "development"  # development | staging | production
    app_debug: bool = False
    # Orígenes permitidos separados por coma: localhost (dev) + URL de Vercel (prod)
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173"]

    # --- Infraestructura ---
    database_url: str = "postgresql+psycopg://riqchariy:password@localhost:5432/riqchariy_db"
    database_pool_size: int = 5
    database_echo: bool = False
    redis_url: str = "redis://localhost:6379/0"
    pgvector_dimension: int = 1536

    # --- Auth ---
    jwt_secret: str = INSECURE_JWT_SECRET
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    # --- Qori (Claude API) ---
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-5"
    claude_max_tokens: int = 512
    claude_temperature: float = Field(default=0.7, ge=0, le=1)

    # --- Pacha ---
    pacha_default_seed: int = 42
    pacha_ticks_per_month: int = 28

    # --- Rate limiting (formato slowapi: "10/minute") ---
    rate_limit_chatbot: str = "10/minute"
    rate_limit_api: str = "100/minute"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @model_validator(mode="after")
    def require_real_secrets_outside_dev(self) -> "Settings":
        if self.app_env != "development" and self.jwt_secret == INSECURE_JWT_SECRET:
            raise ValueError("JWT_SECRET debe cambiarse fuera de development")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
