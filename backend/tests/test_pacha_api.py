"""PostgreSQL integration tests in disposable schemas, never application tables.

Run explicitly with RUN_DB_TESTS=1; DATABASE_URL selects the PostgreSQL server.
"""

import asyncio
import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select, text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import NullPool

from app.core.config import get_settings
from app.core.database import get_db
from app.infrastructure.database.base import Base
from app.main import app
from app.modules.classroom.models import Classroom
from app.modules.pacha.models import EconomyEvent, PlayerEconomy

pytestmark = pytest.mark.skipif(os.getenv("RUN_DB_TESTS") != "1", reason="Requires PostgreSQL")


@pytest.fixture
def api():
    url = get_settings().database_url.replace("+asyncpg", "+psycopg")
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    admin = create_engine(url)
    schema = "test_pacha_" + uuid4().hex
    with admin.begin() as connection:
        connection.execute(text(f'CREATE SCHEMA "{schema}"'))
    options = {"options": f"-csearch_path={schema}"}
    engine = create_engine(url, connect_args=options)
    async_engine = create_async_engine(url, connect_args=options, poolclass=NullPool)
    sessions = async_sessionmaker(async_engine, expire_on_commit=False)

    async def database():
        async with sessions() as session:
            yield session

    try:
        Base.metadata.create_all(engine)
        with Session(engine) as session, session.begin():
            session.add(Classroom(code="TEST-AULA", name="Pruebas"))
        app.dependency_overrides[get_db] = database
        with TestClient(app) as client:
            yield client, engine
    finally:
        app.dependency_overrides.pop(get_db, None)
        asyncio.run(async_engine.dispose())
        engine.dispose()
        with admin.begin() as connection:
            connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        admin.dispose()


def register(client, alias="tester"):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "alias": alias,
            "password": "testpass123",
            "classroom_code": "TEST-AULA",
        },
    )
    assert response.status_code == 201, response.text
    return {"Authorization": "Bearer " + response.json()["token"]}


def test_register_login_and_state_contract(api):
    client, _ = api
    headers = register(client)
    login = client.post("/api/v1/auth/login", json={"alias": "tester", "password": "testpass123"})
    assert login.status_code == 200
    state = client.get("/api/v1/pacha/state", headers=headers)
    assert state.status_code == 200, state.text
    payload = state.json()
    assert isinstance(payload["wallet"], (float, int))
    assert set(payload["savings"]) == {"meta", "emergencias", "libre"}
    assert payload["current_tick"] == 0
    assert payload["job"]["wage_per_week"] == 60


def test_advance_persists_and_rejects_replay(api):
    client, engine = api
    headers = register(client)
    for tick in range(7):
        result = client.post(
            "/api/v1/pacha/next-day", headers=headers, json={"expected_tick": tick}
        )
        assert result.status_code == 200, result.text
    assert result.json()["summary"]["income"] == 60
    assert result.json()["new_state"]["wallet"] > 54
    replay = client.post("/api/v1/pacha/next-day", headers=headers, json={"expected_tick": 6})
    assert replay.status_code == 409
    assert client.get("/api/v1/pacha/state", headers=headers).json() == result.json()["new_state"]
    with Session(engine) as session:
        assert session.scalar(select(func.count()).select_from(EconomyEvent)) == 7
        assert session.scalar(select(PlayerEconomy.current_tick)) == 7


def test_accounts_are_isolated_and_auth_required(api):
    client, _ = api
    one = register(client, "first")
    two = register(client, "second")
    assert client.get("/api/v1/pacha/state").status_code in (401, 403)
    assert (
        client.post("/api/v1/pacha/next-day", headers=one, json={"expected_tick": 0}).status_code
        == 200
    )
    assert client.get("/api/v1/pacha/state", headers=two).json()["current_tick"] == 0
    assert client.post("/api/v1/pacha/next-day", headers=two, json={}).status_code == 422


def test_duplicate_alias_and_wrong_password(api):
    client, _ = api
    register(client)
    duplicate = client.post(
        "/api/v1/auth/register",
        json={
            "alias": "TESTER",
            "password": "testpass123",
            "classroom_code": "TEST-AULA",
        },
    )
    assert duplicate.status_code == 409
    wrong = client.post("/api/v1/auth/login", json={"alias": "tester", "password": "wrong"})
    assert wrong.status_code == 401


def test_concurrent_requests_only_advance_once(api):
    from concurrent.futures import ThreadPoolExecutor

    client, engine = api
    headers = register(client)

    def advance(_):
        return client.post(
            "/api/v1/pacha/next-day", headers=headers, json={"expected_tick": 0}
        ).status_code

    with ThreadPoolExecutor(max_workers=2) as pool:
        assert sorted(pool.map(advance, range(2))) == [200, 409]
    with Session(engine) as session:
        assert session.scalar(select(func.count()).select_from(EconomyEvent)) == 1
