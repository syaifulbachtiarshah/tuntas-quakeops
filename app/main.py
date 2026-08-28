from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    architecture: str


app = FastAPI(
    title="TUNTAS QuakeOps Mission API",
    version="0.1.0",
    description=(
        "ASEAN multi-agent aftershock and earthquake impact forecasting "
        "command-system API."
    ),
)


@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health() -> HealthResponse:
    """Return a secret-free readiness response for local and Cloud Run checks."""
    return HealthResponse(
        status="ok",
        service="tuntas-quakeops",
        architecture="fastapi-google-adk",
    )
