"""Pure transitions; money is rounded only at accounting boundaries."""

from decimal import ROUND_HALF_UP, Decimal, localcontext

from .balance import Balance
from .state import PlayerEconomy

CENT = Decimal("0.01")


def income_system(state: PlayerEconomy, balance: Balance, tick: int) -> PlayerEconomy:
    if tick < 0:
        raise ValueError("tick must be nonnegative")
    income = state.wage_per_period if tick > 0 and tick % balance.ticks.per_week == 0 else 0
    return state.evolve(wallet=state.wallet + income)


def daily_expenses(balance: Balance, tick: int) -> Decimal:
    """Rounded cumulative differences: 28 days sum to the exact monthly bill."""
    if tick < 0:
        raise ValueError("tick must be nonnegative")
    if tick == 0:
        return Decimal("0")
    with localcontext() as ctx:
        ctx.prec = 28
        total = Decimal("0")
        for expense in balance.fixed_expenses:
            day = (tick - 1) % expense.every_ticks + 1
            due = expense.amount * day / expense.every_ticks
            previous = expense.amount * (day - 1) / expense.every_ticks
            total += due.quantize(CENT, rounding=ROUND_HALF_UP) - previous.quantize(
                CENT, rounding=ROUND_HALF_UP
            )
        return total


def expense_system(state: PlayerEconomy, balance: Balance, tick: int) -> PlayerEconomy:
    due = daily_expenses(balance, tick)
    paid = min(state.wallet, due)
    return state.evolve(
        wallet=state.wallet - paid,
        unpaid_expenses=state.unpaid_expenses + due - paid,
    )


def stress_system(state: PlayerEconomy, balance: Balance) -> PlayerEconomy:
    debt = sum((loan.remaining for loan in state.loans), Decimal("0"))
    with localcontext() as ctx:
        ctx.prec = 28
        income = state.wage_per_period * balance.ticks.per_month / balance.ticks.per_week
        debt_ratio = min(Decimal("1"), debt / income) if income else Decimal(bool(debt))

    def recent(tick: int | None, window: int) -> bool:
        return tick is not None and 0 <= state.current_tick - tick < window

    late = recent(state.last_late_tick, balance.stress.late_window) or any(
        recent(loan.last_late_tick, balance.stress.late_window) for loan in state.loans
    )
    fun = recent(state.last_fun_tick, balance.stress.fun_window) or any(
        item.category == "gusto" and recent(item.bought_at_tick, balance.stress.fun_window)
        for item in state.inventory
    )
    weights = balance.stress.weights
    stress = (
        weights.debt_ratio * float(debt_ratio)
        + weights.no_emergency * (state.savings_emergency < balance.stress.emergency_target)
        + weights.recent_late * late
        + weights.no_recent_fun * (not fun)
    )
    return state.evolve(stress=max(0.0, min(1.0, stress)))
