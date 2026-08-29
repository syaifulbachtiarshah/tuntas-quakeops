from fastapi.testclient import TestClient

import app.main as mission_api


client = TestClient(mission_api.app)


def test_health_is_secret_free() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["architecture"] == "fastapi-google-adk-gemini"
    assert "api_key" not in body


def test_scenarios_expose_authoritative_sources() -> None:
    response = client.get("/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert {item["scenario_id"] for item in scenarios} == {
        "IDN-FLORES-2026",
        "MYS-AUG-2026",
    }
    assert all(item["sources"] for item in scenarios)


def test_replay_runs_agent_and_keeps_approval_pending(monkeypatch) -> None:
    async def fake_agent(prompt: str) -> str:
        assert "HUMAN APPROVAL REQUIRED" in prompt
        return "SITUATION\nVerified replay.\nHUMAN APPROVAL REQUIRED\nPending."

    monkeypatch.setattr(mission_api, "run_quakeops_agent", fake_agent)
    response = client.post(
        "/missions/replay",
        json={"scenario_id": "IDN-FLORES-2026"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["human_approval"] == "pending"
    assert body["model"] == "gemini-3.7-flash"
    assert body["scenario"]["sources"]
