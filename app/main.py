import os
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from tuntas.config import ALLOWED_ORIGINS, MODEL
from tuntas.runtime import AgentRuntimeError, run_quakeops_agent
from tuntas.scenarios import (
    SCENARIOS,
    ScenarioId,
    build_mission_prompt,
    get_scenario,
    list_scenarios,
)


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    architecture: str
    runtime: Literal["local", "google-cloud-run"]
    model: str
    gemini_configured: bool


class ReplayRequest(BaseModel):
    scenario_id: ScenarioId


class ReplayResponse(BaseModel):
    mission_id: str
    scenario: dict
    agent: str
    model: str
    command_brief: str
    human_approval: Literal["pending"]
    limitations: list[str] = Field(default_factory=list)


app = FastAPI(
    title="TUNTAS QuakeOps Mission API",
    version="0.2.0",
    description=(
        "ASEAN multi-agent aftershock and earthquake impact response API with "
        "mandatory human approval."
    ),
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/", tags=["system"])
async def root() -> dict:
    return {
        "service": "tuntas-quakeops",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="tuntas-quakeops",
        architecture="fastapi-google-adk-gemini",
        runtime="google-cloud-run" if os.getenv("K_SERVICE") else "local",
        model=MODEL,
        gemini_configured=bool(os.getenv("GOOGLE_API_KEY")),
    )


@app.get("/scenarios", tags=["missions"])
async def scenarios() -> list[dict]:
    return list_scenarios()


@app.post(
    "/missions/replay",
    response_model=ReplayResponse,
    tags=["missions"],
)
async def replay_mission(request: ReplayRequest) -> ReplayResponse:
    if request.scenario_id not in SCENARIOS:
        raise HTTPException(status_code=404, detail="Unknown replay scenario")

    scenario = get_scenario(request.scenario_id)
    try:
        command_brief = await run_quakeops_agent(build_mission_prompt(scenario))
    except AgentRuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail="Gemini agent is temporarily unavailable; inspect Cloud Run logs.",
        ) from exc

    return ReplayResponse(
        mission_id=f"replay-{request.scenario_id.lower()}",
        scenario=scenario,
        agent="tuntas_quakeops_commander",
        model=MODEL,
        command_brief=command_brief,
        human_approval="pending",
        limitations=[
            "Historical replay only; not a live emergency alert.",
            "No exact mainshock prediction.",
            "High-consequence actions require human approval.",
        ],
    )
