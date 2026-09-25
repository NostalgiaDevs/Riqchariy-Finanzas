import uuid
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.infrastructure.database.base import Base

class PlayerEconomy(Base):
    __tablename__ = "player_economy"

    player_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    version = Column(Integer, default=1)
    wallet = Column(Float, default=0.0)
    savings_goal = Column(Float, default=0.0)
    savings_emergency = Column(Float, default=0.0)
    savings_free = Column(Float, default=0.0)
    job_id = Column(String)
    job_performance = Column(Float, default=0.0)
    wage_per_period = Column(Float, default=0.0)
    loans = Column(JSONB, default=list)
    credit_score = Column(Integer, default=500)
    stress = Column(Float, default=0.0)
    current_tick = Column(Integer, default=0)
    score = Column(Integer, default=0)
    league = Column(String)
    goal_item = Column(String)
    goal_target = Column(Float, default=0.0)
    goal_saved = Column(Float, default=0.0)
    inventory = Column(JSONB, default=dict)
    flags = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class EconomyEvent(Base):
    __tablename__ = "economy_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    player_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    tick = Column(Integer, nullable=False)
    event_type = Column(String, nullable=False)
    event_data = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_economy_events_player_tick", "player_id", "tick"),
    )