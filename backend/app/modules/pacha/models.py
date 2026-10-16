from sqlalchemy import Column, DateTime, Float, ForeignKey, Index, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func

from app.infrastructure.database.base import Base


class PlayerEconomy(Base):
    __tablename__ = "player_economy"

    player_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    version = Column(Integer, default=1)
    wallet = Column(Numeric(20, 2), default=0)
    savings_goal = Column(Numeric(20, 2), default=0)
    savings_emergency = Column(Numeric(20, 2), default=0)
    savings_free = Column(Numeric(20, 2), default=0)
    job_id = Column(String)
    job_performance = Column(Float, default=0.0)
    wage_per_period = Column(Numeric(20, 2), default=0)
    loans = Column(JSONB, default=list)
    credit_score = Column(Integer, default=500)
    stress = Column(Float, default=0.0)
    current_tick = Column(Integer, default=0)
    score = Column(Integer, default=0)
    league = Column(String)
    goal_item = Column(String)
    goal_target = Column(Numeric(20, 2), default=0)
    goal_saved = Column(Numeric(20, 2), default=0)
    inventory = Column(JSONB, default=list)
    flags = Column(JSONB, default=list)
    pending_events = Column(JSONB, nullable=False, default=list, server_default="[]")
    active_missions = Column(JSONB, nullable=False, default=list, server_default="[]")
    last_late_tick = Column(Integer)
    last_fun_tick = Column(Integer)
    unpaid_expenses = Column(Numeric(20, 2), nullable=False, default=0, server_default="0")
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

    __table_args__ = (Index("ix_economy_events_player_tick", "player_id", "tick"),)
