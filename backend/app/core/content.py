import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Literal

import yaml
from pydantic import BaseModel, Field

from app.core.config import get_settings

BACKEND_DIR = Path(__file__).resolve().parents[2]


class ChoiceEffects(BaseModel):
    wallet_change: float = 0
    stress_change: float = 0
    score_change: int = 0
    flags_added: list[str] = []
    teaches: list[str] = []


class Choice(BaseModel):
    id: str
    label: str
    outcome: str
    effects: ChoiceEffects


class GameEvent(BaseModel):
    id: str = Field(pattern=r"^(EMR|TMP|OPP|MAC|SOC)-\d{3}$")
    category: Literal["emergencia", "tentacion", "oportunidad", "macro", "social"]
    title: str
    description: str
    choices: list[Choice] = Field(min_length=2)


def get_content_dir() -> Path:
    """En Docker el contenido está en /app/content; en local, en ../content."""
    configured = get_settings().content_dir
    if configured:
        return Path(configured)
    for candidate in (BACKEND_DIR / "content", BACKEND_DIR.parent / "content"):
        if candidate.is_dir():
            return candidate
    raise FileNotFoundError("No se encontró la carpeta content/")


@lru_cache
def get_balance() -> dict[str, Any]:
    with open(get_content_dir() / "balance.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)


@lru_cache
def get_events() -> dict[str, GameEvent]:
    events: dict[str, GameEvent] = {}
    for path in sorted((get_content_dir() / "events").glob("*.json")):
        with open(path, encoding="utf-8") as f:
            for raw in json.load(f):
                event = GameEvent.model_validate(raw)
                if event.id in events:
                    raise ValueError(f"Evento duplicado: {event.id} en {path.name}")
                events[event.id] = event
    return events
