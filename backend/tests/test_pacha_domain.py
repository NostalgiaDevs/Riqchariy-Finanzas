from decimal import Decimal
from uuid import UUID

import pytest
from pydantic import ValidationError

from app.modules.pacha.domain.balance import Balance, initial_economy
from app.modules.pacha.domain.pipeline import advance_day
from app.modules.pacha.domain.state import InventoryItem, Loan, PlayerEconomy
from app.modules.pacha.domain.systems import (
    daily_expenses,
    expense_system,
    income_system,
    stress_system,
)


@pytest.fixture
def balance():
    # No file loader or database is needed for these unit tests.
    return Balance.model_validate(
        {
            "ticks": {"per_month": 28, "per_week": 7},
            "jobs": [{"id": "ayudante", "name": "Ayudante", "wage_per_period": "60"}],
            "fixed_expenses": [
                {"id": "comida", "amount": "100", "every_ticks": 28},
                {"id": "celular", "amount": "25", "every_ticks": 28},
                {"id": "pasajes", "amount": "40", "every_ticks": 28},
            ],
            "stress": {
                "weights": {
                    "debt_ratio": 0.35,
                    "no_emergency": 0.25,
                    "recent_late": 0.25,
                    "no_recent_fun": 0.15,
                },
                "emergency_target": "150",
                "late_window": 14,
                "fun_window": 28,
            },
        }
    )


@pytest.fixture
def state():
    return PlayerEconomy(player_id=UUID(int=1), wallet="100")


@pytest.mark.parametrize("tick", [7, 14, 21, 28])
def test_payday(state, balance, tick):
    assert income_system(state, balance, tick).wallet == Decimal("160")


@pytest.mark.parametrize("tick", [0, 1, 6, 8])
def test_no_pay_on_other_days(state, balance, tick):
    assert income_system(state, balance, tick).wallet == state.wallet


@pytest.mark.parametrize("wage", ["48", "60", "72", "0"])
def test_effective_wage_is_not_multiplied_twice(state, balance, wage):
    state = state.evolve(wage_per_period=wage, job_performance=0.8)
    assert income_system(state, balance, 7).wallet == state.wallet + Decimal(wage)


def test_daily_expense_and_shortfall(state, balance):
    assert expense_system(state, balance, 1).wallet == Decimal("94.11")
    poor = expense_system(state.evolve(wallet="2"), balance, 1)
    assert poor.wallet == 0
    assert poor.unpaid_expenses == Decimal("3.89")
    assert expense_system(state, balance, 0) == state


def test_monthly_rounding_is_exact(balance):
    assert sum(daily_expenses(balance, tick) for tick in range(1, 29)) == Decimal("165")
    assert sum(daily_expenses(balance, tick) for tick in range(29, 57)) == Decimal("165")


def test_low_stress(state, balance):
    state = state.evolve(current_tick=10, savings_emergency="150", last_fun_tick=9)
    assert stress_system(state, balance).stress == 0


def test_high_stress(state, balance):
    state = state.evolve(
        current_tick=10,
        last_late_tick=9,
        loans=[Loan(id="loan", principal="1000", remaining="1000")],
    )
    assert stress_system(state, balance).stress == 1


@pytest.mark.parametrize("debt, expected", [("0", 0), ("1", 0.35)])
def test_zero_income_is_defined(state, balance, debt, expected):
    state = state.evolve(
        wage_per_period="0",
        savings_emergency="150",
        last_fun_tick=0,
        loans=[Loan(id="loan", principal=debt, remaining=debt)],
    )
    assert stress_system(state, balance).stress == pytest.approx(expected)


@pytest.mark.parametrize("age, expected", [(13, 0.25), (14, 0), (-1, 0)])
def test_late_window(state, balance, age, expected):
    state = state.evolve(
        current_tick=30, last_late_tick=30 - age, savings_emergency="150", last_fun_tick=30
    )
    assert stress_system(state, balance).stress == pytest.approx(expected)


@pytest.mark.parametrize("age, expected", [(27, 0), (28, 0.15), (-1, 0.15)])
def test_fun_window(state, balance, age, expected):
    state = state.evolve(
        current_tick=30,
        savings_emergency="150",
        inventory=[InventoryItem(item="salida", bought_at_tick=30 - age, category="gusto")],
    )
    assert stress_system(state, balance).stress == pytest.approx(expected)


def test_debt_ratio_uses_remaining_and_monthly_income(state, balance):
    state = state.evolve(
        savings_emergency="150",
        last_fun_tick=0,
        loans=[Loan(id="loan", principal="240", remaining="120")],
    )
    assert stress_system(state, balance).stress == pytest.approx(0.175)


def test_pure_immutable_and_deterministic(state, balance):
    before = state.model_dump_json()
    config = balance.model_dump_json()
    for system, args in [(income_system, (7,)), (expense_system, (1,)), (stress_system, ())]:
        result = system(state, balance, *args)
        assert result is not state
        assert result == system(state, balance, *args)
    assert state.model_dump_json() == before
    assert balance.model_dump_json() == config
    with pytest.raises(ValidationError):
        state.wallet = Decimal("2")


def test_pipeline_pays_before_expenses_and_advances_once(state, balance):
    state = state.evolve(current_tick=6, wallet="0")
    result = advance_day(state, balance)
    assert result.current_tick == 7
    assert result.version == state.version + 1
    assert result.wallet == Decimal("60") - daily_expenses(balance, 7)
    assert result.unpaid_expenses == 0
    assert advance_day(state, balance) == result


def test_invalid_inputs(state, balance):
    with pytest.raises(ValidationError):
        state.evolve(wallet="-1")
    with pytest.raises(ValidationError):
        state.evolve(wallet="NaN")
    with pytest.raises(ValueError):
        income_system(state, balance, -1)
    with pytest.raises(ValueError):
        expense_system(state, balance, -1)


def test_initial_state_comes_from_balance(balance):
    result = initial_economy(UUID(int=2), balance)
    assert result.wallet == balance.initial_state.wallet
    assert result.wage_per_period == balance.jobs[0].wage_per_period


def test_domain_imports_no_io_modules():
    import ast
    from pathlib import Path

    root = Path(__file__).parents[1] / "app/modules/pacha/domain"
    prohibited = {"sqlalchemy", "fastapi", "os", "pathlib", "random", "requests", "httpx"}
    for path in root.glob("*.py"):
        for node in ast.walk(ast.parse(path.read_text(encoding="utf-8"))):
            if isinstance(node, ast.Import):
                assert not {alias.name.split(".")[0] for alias in node.names} & prohibited
            elif isinstance(node, ast.ImportFrom):
                assert (node.module or "").split(".")[0] not in prohibited
