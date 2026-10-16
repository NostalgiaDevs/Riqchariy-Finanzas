"""Immutable economic aggregate. No database, clock or filesystem dependencies."""

from decimal import Decimal
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

Money = Annotated[Decimal, Field(ge=0, allow_inf_nan=False)]
League = Literal["chaski", "qollqa", "amauta", "apu"]


class ValueObject(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")


class Loan(ValueObject):
    id: str
    principal: Money
    remaining: Money
    rate: Money = Decimal("0")
    term: int = Field(default=1, ge=1)
    paid: Money = Decimal("0")
    late: int = Field(default=0, ge=0)
    type: Literal["bank", "store", "lender"] = "bank"
    installment: Money = Decimal("0")
    next_due_tick: int = Field(default=0, ge=0)
    last_late_tick: int | None = Field(default=None, ge=0)


class InventoryItem(ValueObject):
    item: str
    bought_at_tick: int = Field(ge=0)
    category: str = "necesidad"


class PlayerEconomy(ValueObject):
    player_id: UUID
    version: int = Field(default=1, ge=1)
    wallet: Money = Decimal("0")
    savings_goal: Money = Decimal("0")
    savings_emergency: Money = Decimal("0")
    savings_free: Money = Decimal("0")
    job_id: str = "ayudante"
    job_performance: float = Field(default=0.5, ge=0, le=1)
    wage_per_period: Money = Decimal("60")
    loans: tuple[Loan, ...] = ()
    credit_score: int = Field(default=500, ge=300, le=850)
    stress: float = Field(default=0, ge=0, le=1)
    current_tick: int = Field(default=0, ge=0)
    score: int = Field(default=550, ge=0, le=1000)
    league: League = "chaski"
    goal_item: str | None = None
    goal_target: Money = Decimal("0")
    goal_saved: Money = Decimal("0")
    inventory: tuple[InventoryItem, ...] = ()
    flags: tuple[str, ...] = ()
    pending_events: tuple[str, ...] = ()
    active_missions: tuple[str, ...] = ()
    last_late_tick: int | None = Field(default=None, ge=0)
    last_fun_tick: int | None = Field(default=None, ge=0)
    unpaid_expenses: Money = Decimal("0")

    def evolve(self, **changes: object) -> "PlayerEconomy":
        """Validate replacements too (model_copy(update=...) skips validation)."""
        return type(self).model_validate({**self.model_dump(), **changes})
