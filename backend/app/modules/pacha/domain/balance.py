"""Validated configuration supplied by the application, never loaded here."""

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from .state import Money, PlayerEconomy, ValueObject


class Ticks(ValueObject):
    per_month: int = Field(default=28, gt=0)
    per_week: int = Field(default=7, gt=0)


class Job(ValueObject):
    id: str
    name: str
    wage_per_period: Money
    period_ticks: int = Field(default=7, gt=0)


class FixedExpense(ValueObject):
    id: str
    amount: Money
    every_ticks: int = Field(gt=0)


class StressWeights(ValueObject):
    debt_ratio: float = Field(ge=0, le=1)
    no_emergency: float = Field(ge=0, le=1)
    recent_late: float = Field(ge=0, le=1)
    no_recent_fun: float = Field(ge=0, le=1)

    @model_validator(mode="after")
    def normalized(self):
        if abs(sum(self.model_dump().values()) - 1) > 1e-9:
            raise ValueError("Stress weights must sum to 1")
        return self


class StressBalance(ValueObject):
    weights: StressWeights
    emergency_target: Money = Field(gt=0)
    late_window: int = Field(default=14, gt=0)
    fun_window: int = Field(default=28, gt=0)


class InitialState(ValueObject):
    wallet: Money = Decimal("0")
    savings_goal: Money = Decimal("0")
    savings_emergency: Money = Decimal("0")
    savings_free: Money = Decimal("0")
    current_tick: int = Field(default=0, ge=0)
    credit_score: int = Field(default=500, ge=300, le=850)
    stress: float = Field(default=0, ge=0, le=1)
    score: int = Field(default=550, ge=0, le=1000)
    league: str = "chaski"


class Balance(BaseModel):
    model_config = ConfigDict(frozen=True, extra="ignore")
    initial_state: InitialState = InitialState()
    ticks: Ticks
    jobs: tuple[Job, ...] = Field(min_length=1)
    fixed_expenses: tuple[FixedExpense, ...]
    stress: StressBalance

    @model_validator(mode="after")
    def unique_jobs(self):
        if len({job.id for job in self.jobs}) != len(self.jobs):
            raise ValueError("Job IDs must be unique")
        if any(job.period_ticks != self.ticks.per_week for job in self.jobs):
            raise ValueError("This pipeline supports weekly pay periods")
        return self

    def job(self, job_id: str) -> Job:
        job_id = {"ayudante_kiosco": "ayudante", "kiosco_ayudante": "ayudante"}.get(job_id, job_id)
        return next(job for job in self.jobs if job.id == job_id)


def initial_economy(player_id: UUID, balance: Balance) -> PlayerEconomy:
    job = balance.jobs[0]
    return PlayerEconomy(
        player_id=player_id,
        job_id=job.id,
        wage_per_period=job.wage_per_period,
        **balance.initial_state.model_dump(),
    )
