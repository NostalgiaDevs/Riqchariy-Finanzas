from .balance import Balance
from .state import PlayerEconomy
from .systems import expense_system, income_system, stress_system


def advance_day(state: PlayerEconomy, balance: Balance) -> PlayerEconomy:
    """One explicit day, no clock, RNG, persistence or hidden mutation."""
    tick = state.current_tick + 1
    next_state = state.evolve(current_tick=tick, version=state.version + 1)
    next_state = income_system(next_state, balance, tick)
    next_state = expense_system(next_state, balance, tick)
    return stress_system(next_state, balance)
