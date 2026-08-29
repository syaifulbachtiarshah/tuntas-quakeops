from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "tuntas-quakeops",
        "architecture": "fastapi-google-adk-gemini",
        "runtime": "local",
        "model": "gemini-3.7-flash",
        "gemini_configured": False,
    }


def test_health_does_not_expose_secrets() -> None:
    body = client.get("/health").json()

    assert "api_key" not in body
    assert "google_api_key" not in body
    assert all("key" not in str(value).lower() for value in body.values())
