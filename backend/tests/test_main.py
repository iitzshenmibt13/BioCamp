"""Tests for auth, points, and check-in endpoints."""
import pytest
import pytest_asyncio
import asyncio
from httpx import AsyncClient, ASGITransport
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models import User, Group, RoleEnum
from app.auth.jwt import create_access_token

TEST_DB_URL = "sqlite+aiosqlite:///./test_camp.db"

engine = create_async_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

import uuid

async def override_get_db():
    async with TestSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Create sample staff and group
    async with TestSessionLocal() as db:
        staff = User(id="staff-001", line_user_id="U_STAFF_TEST", display_name="Test Staff", role=RoleEnum.staff)
        camper = User(id="camper-001", line_user_id="U_CAMPER_TEST", display_name="Test Camper", role=RoleEnum.camper, group_id="group-001")
        group = Group(id="group-001", name="TestGroup", color="#ff0000", join_code="TEST")
        db.add_all([group, staff, camper])
        await db.commit()
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client() -> AsyncGenerator:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


def staff_token():
    return create_access_token("staff-001", "staff", None)

def camper_token():
    return create_access_token("camper-001", "camper", "group-001")


# =================== AUTH TESTS ===================

@pytest.mark.asyncio
async def test_get_me_valid_token(client):
    """Valid JWT token returns user info."""
    r = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {staff_token()}"})
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == "staff-001"
    assert data["role"] == "staff"


@pytest.mark.asyncio
async def test_get_me_invalid_token(client):
    """Invalid JWT token returns 401."""
    r = await client.get("/api/auth/me", headers={"Authorization": "Bearer bad_token"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_get_me_no_token(client):
    """Missing token returns 401."""
    r = await client.get("/api/auth/me")
    assert r.status_code == 401


# =================== POINTS TESTS ===================

@pytest.mark.asyncio
async def test_create_transaction_staff(client):
    """Staff can create a point transaction."""
    r = await client.post(
        "/api/points/transactions",
        json={"group_id": "group-001", "delta_points": 5, "category": "game", "reason": "Won quiz"},
        headers={"Authorization": f"Bearer {staff_token()}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["delta_points"] == 5


@pytest.mark.asyncio
async def test_create_transaction_camper_forbidden(client):
    """Camper cannot create point transactions."""
    r = await client.post(
        "/api/points/transactions",
        json={"group_id": "group-001", "delta_points": 100, "category": "bonus", "reason": "Self-added"},
        headers={"Authorization": f"Bearer {camper_token()}"},
    )
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_leaderboard_returns_groups(client):
    """Leaderboard endpoint returns list with total_points."""
    r = await client.get("/api/points/leaderboard", headers={"Authorization": f"Bearer {camper_token()}"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "total_points" in data[0]


@pytest.mark.asyncio
async def test_undo_transaction(client):
    """Staff can undo a point transaction."""
    # Create transaction first
    r = await client.post(
        "/api/points/transactions",
        json={"group_id": "group-001", "delta_points": 3, "category": "game", "reason": "Test undo"},
        headers={"Authorization": f"Bearer {staff_token()}"},
    )
    tx_id = r.json()["id"]
    # Undo it
    r2 = await client.post(f"/api/points/transactions/{tx_id}/undo", headers={"Authorization": f"Bearer {staff_token()}"})
    assert r2.status_code == 200
    # Undo again should fail
    r3 = await client.post(f"/api/points/transactions/{tx_id}/undo", headers={"Authorization": f"Bearer {staff_token()}"})
    assert r3.status_code == 400


# =================== CHECK-IN TESTS ===================

@pytest.mark.asyncio
async def test_checkin_duplicate_blocked(client):
    """Duplicate check-in returns 409."""
    import secrets, hashlib, hmac
    qr_secret = secrets.token_hex(16)
    cp_id = str(uuid.uuid4())
    # Create checkpoint manually in DB
    async with TestSessionLocal() as db:
        from app.models import CheckinCheckpoint
        cp = CheckinCheckpoint(id=cp_id, title="Test CP", qr_secret=qr_secret, created_by="staff-001")
        db.add(cp)
        await db.commit()

    sig = hmac.new(qr_secret.encode(), cp_id.encode(), hashlib.sha256).hexdigest()[:16]
    payload = f"{cp_id}:{sig}"
    body = {"checkpoint_id": cp_id, "qr_payload": payload}

    r1 = await client.post("/api/checkin", json=body, headers={"Authorization": f"Bearer {camper_token()}"})
    assert r1.status_code == 200

    r2 = await client.post("/api/checkin", json=body, headers={"Authorization": f"Bearer {camper_token()}"})
    assert r2.status_code == 409
