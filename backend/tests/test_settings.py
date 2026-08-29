from app.domain.entities import PlatformSettings
from app.infrastructure.repositories import PlatformSettingsRepository
from app.interfaces.system_router import get_system_status

def test_platform_settings():
    repo = PlatformSettingsRepository()
    settings = repo.get()
    assert settings.default_page_size >= 1
    assert settings.min_password_length >= 7

    settings.default_page_size = 25
    updated = repo.update(settings)
    assert updated.default_page_size == 25

def test_system_status_endpoint():
    data = get_system_status()
    assert data["api_status"] == "online"
    assert data["api_version"] == "2.12.8"
    assert "database" in data
    assert "system_metrics" in data

def test_health_check_and_security_headers():
    import asyncio
    import httpx
    from app.main import app

    async def _run():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            res = await client.get("/health")
            assert res.status_code == 200
            assert res.json()["status"] == "ok"
            assert res.json()["version"] == "2.12.8"
            assert "x-content-type-options" in res.headers
            assert "server" not in res.headers

    asyncio.run(_run())


