from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.content import get_economy_balance
from app.core.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User

from .adapters import new_row, present_state, to_domain, write_state
from .domain.balance import Balance, initial_economy
from .domain.pipeline import advance_day
from .models import EconomyEvent, PlayerEconomy

router = APIRouter()
CurrentUser = Annotated[User, Depends(get_current_user)]
Database = Annotated[AsyncSession, Depends(get_db)]
EconomyBalance = Annotated[Balance, Depends(get_economy_balance)]


class NextDayRequest(BaseModel):
    expected_tick: int = Field(ge=0)


async def locked_economy(db: AsyncSession, user: User, balance: Balance) -> PlayerEconomy:
    # The user lock also serializes first-time creation when an old user has no economy.
    await db.execute(select(User.id).where(User.id == user.id).with_for_update())
    row = (
        await db.execute(
            select(PlayerEconomy).where(PlayerEconomy.player_id == user.id).with_for_update()
        )
    ).scalar_one_or_none()
    if row is None:
        row = new_row(initial_economy(user.id, balance))
        db.add(row)
        await db.flush()
    return row


@router.get("/state")
async def get_state(
    user: CurrentUser,
    db: Database,
    balance: EconomyBalance,
):
    row = await locked_economy(db, user, balance)
    result = present_state(to_domain(row, balance), balance)
    await db.commit()
    return result


@router.post("/next-day")
async def next_day(
    body: NextDayRequest,
    user: CurrentUser,
    db: Database,
    balance: EconomyBalance,
):
    row = await locked_economy(db, user, balance)
    state = to_domain(row, balance)
    if body.expected_tick != state.current_tick:
        raise HTTPException(409, "El día ya cambió. Actualiza tu estado antes de continuar.")
    updated = advance_day(state, balance)
    income = updated.wage_per_period if updated.current_tick % balance.ticks.per_week == 0 else 0
    summary = {
        "income": float(income),
        "expenses": float(state.wallet + income - updated.wallet),
        "unpaid_expenses": float(updated.unpaid_expenses - state.unpaid_expenses),
        "interest_earned": 0,
        "loan_payments": 0,
        "events_triggered": [],
        "missions_progress": {},
        "score_change": 0,
        "stress_change": updated.stress - state.stress,
    }
    write_state(row, updated)
    db.add(
        EconomyEvent(
            player_id=user.id,
            tick=updated.current_tick,
            event_type="day_advanced",
            event_data=summary,
        )
    )
    await db.commit()
    return {
        "tick": updated.current_tick,
        "summary": summary,
        "new_state": present_state(updated, balance),
    }
