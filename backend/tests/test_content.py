from collections import Counter

from app.core.content import get_balance, get_events


def test_balance_se_carga_como_diccionario() -> None:
    balance = get_balance()
    assert isinstance(balance, dict)
    assert balance["initial_state"]["score"] == 550
    assert balance["initial_state"]["league"] == "chaski"


def test_hay_15_eventos_validos() -> None:
    assert len(get_events()) == 15


def test_distribucion_de_eventos_por_categoria() -> None:
    counts = Counter(event.category for event in get_events().values())
    assert counts == {
        "emergencia": 3,
        "tentacion": 3,
        "oportunidad": 3,
        "macro": 3,
        "social": 3,
    }


def test_ids_de_opciones_unicos_por_evento() -> None:
    for event in get_events().values():
        ids = [choice.id for choice in event.choices]
        assert len(ids) == len(set(ids)), event.id
