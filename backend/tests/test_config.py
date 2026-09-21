import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_cors_origins_se_separan_por_coma() -> None:
    settings = Settings(cors_origins="http://a.com, http://b.com")
    assert settings.cors_origins == ["http://a.com", "http://b.com"]


def test_produccion_rechaza_jwt_secret_de_ejemplo() -> None:
    with pytest.raises(ValidationError):
        Settings(app_env="production")


def test_produccion_acepta_secret_propio() -> None:
    settings = Settings(app_env="production", jwt_secret="x" * 64)
    assert settings.app_env == "production"
