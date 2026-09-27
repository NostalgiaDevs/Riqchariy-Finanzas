import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import ARRAY, Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class PlayerEconomy(Base):
    __tablename__ = "player_economy"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    player_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("players.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    # Billetera y ahorro
    wallet: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    savings_goal: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    savings_emergency: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    savings_free: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Trabajo
    job_id: Mapped[str] = mapped_column(
        String(50), nullable=False, default="ayudante_kiosco"
    )
    job_performance: Mapped[float] = mapped_column(Float, nullable=False, default=0.70)

    # Crédito
    credit_score: Mapped[int] = mapped_column(Integer, nullable=False, default=500)

    # Estado
    stress: Mapped[float] = mapped_column(Float, nullable=False, default=0.15)
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    league: Mapped[str] = mapped_column(
        String(20), nullable=False, default="chaski"
    )

    # Tick y metas
    current_tick: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    goal_item: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    goal_target: Mapped[int] = mapped_column(Integer, nullable=False, default=80)
    goal_saved: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Arrays
    flags: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default="{}"
    )
    pending_events: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default="{}"
    )

    # RNG
    seed: Mapped[int] = mapped_column(Integer, nullable=False)

    # Timestamps
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default="now()"
    )

    # Relaciones
    player: Mapped["Player"] = relationship(back_populates="economy")
