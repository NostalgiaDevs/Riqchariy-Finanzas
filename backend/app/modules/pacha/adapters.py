"""Explicit boundary between storage, the domain and the frontend contract."""

from decimal import Decimal

from .domain.balance import Balance, initial_economy
from .domain.state import PlayerEconomy
from .models import PlayerEconomy as EconomyRow


def to_domain(row: EconomyRow, balance: Balance) -> PlayerEconomy:
    defaults = initial_economy(row.player_id, balance).model_dump()
    values = {name: getattr(row, name, None) for name in PlayerEconomy.model_fields}
    values = {name: value for name, value in values.items() if value is not None}
    # Older rows used {} for empty arrays. Nonempty inventory maps are preserved as items.
    if isinstance(values.get("inventory"), dict):
        values["inventory"] = [{"item": key, "bought_at_tick": 0} for key in values["inventory"]]
    if isinstance(values.get("flags"), dict):
        values["flags"] = [key for key, enabled in values["flags"].items() if enabled]
    loans = []
    for raw in values.get("loans", []):
        loan = dict(raw)
        if "remaining" not in loan:
            loan["remaining"] = max(
                Decimal("0"), Decimal(str(loan["principal"])) - Decimal(str(loan.get("paid", 0)))
            )
        loans.append(loan)
    values["loans"] = loans
    return PlayerEconomy.model_validate({**defaults, **values})


def write_state(row: EconomyRow, state: PlayerEconomy) -> None:
    values = state.model_dump()
    json_values = state.model_dump(mode="json")
    for name, value in values.items():
        setattr(row, name, json_values[name] if isinstance(value, tuple) else value)


def new_row(state: PlayerEconomy) -> EconomyRow:
    row = EconomyRow()
    write_state(row, state)
    return row


def present_state(state: PlayerEconomy, balance: Balance) -> dict:
    job = balance.job(state.job_id)
    products = {"bank": "banco", "store": "tienda", "lender": "prestamista"}
    return {
        "player_id": str(state.player_id),
        "version": state.version,
        "wallet": float(state.wallet),
        "savings": {
            "meta": {
                "balance": float(state.savings_goal),
                "goal_item": state.goal_item,
                "goal_target": float(state.goal_target),
            },
            "emergencias": {"balance": float(state.savings_emergency)},
            "libre": {"balance": float(state.savings_free)},
        },
        "job": {
            "id": job.id,
            "name": job.name,
            "performance": state.job_performance,
            "wage_per_week": float(state.wage_per_period),
        },
        "loans": [
            {
                "id": loan.id,
                "product": products[loan.type],
                "principal": float(loan.principal),
                "remaining": float(loan.remaining),
                "monthly_rate": float(loan.rate),
                "installment": float(loan.installment),
                "next_due_tick": loan.next_due_tick,
            }
            for loan in state.loans
        ],
        "credit_score": state.credit_score,
        "stress": state.stress,
        "score": state.score,
        "league": state.league,
        "current_tick": state.current_tick,
        "inventory": [item.item for item in state.inventory],
        "flags": list(state.flags),
        "pending_events": list(state.pending_events),
        "active_missions": list(state.active_missions),
        "unpaid_expenses": float(state.unpaid_expenses),
    }
