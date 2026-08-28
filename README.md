# TUNTAS QuakeOps

**ASEAN Multi-Agent Aftershock and Earthquake Impact Forecasting System**

TUNTAS QuakeOps is a human-governed command-centre prototype for probabilistic aftershock forecasting, bounded impact assessment, and coordinated ASEAN response planning across Malaysia and Indonesia.

> **Safety boundary:** TUNTAS does not claim to predict the exact time, location, or magnitude of a future mainshock. Numeric forecasts must come from deterministic tools. Gemini agents may interpret verified results, explain uncertainty, and draft response plans, but they must not invent probabilities.

## Current status

- Google ADK root-agent prototype preserved.
- Model configuration: `gemini-3.6-flash`.
- Retry attempts: 3.
- QuakeOps foundation work is isolated from the baseline on a feature branch.
- Google Cloud deployment has not yet been completed.

## MVP workflow

1. Verify and normalize a seismic event.
2. Run deterministic aftershock and impact tools.
3. Let specialist Google ADK agents interpret verified outputs.
4. Draft a response plan.
5. Stop at a human approval gate.
6. Record sources, model version, tool outputs, approval, and audit history.

Planned orchestration:

```text
TUNTAS Commander
    ↓
Event Verification
    ↓
Parallel analysis
    ├── Aftershock Forecast → deterministic forecast tool
    └── Impact Intelligence → deterministic impact tool
    ↓
Response Orchestration
    ↓
Human approval
```

## Demo scenarios

- `IDN-01`: high-severity Indonesia historical replay.
- `MYS-01`: low-severity Malaysia historical replay.

Both scenarios will use the same schemas and workflow so that the resulting level of escalation is evidence-driven rather than hard-coded.

## Local foundation setup

Create and activate a Python 3.11 virtual environment, then install dependencies:

```bash
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
```

Create a local `.env` from `.env.example` and supply the required server-side secrets. Never commit `.env`.

Run the API:

```bash
python -m uvicorn app.main:app --reload --port 8080
```

Verify:

```text
GET http://localhost:8080/health
```

Run tests:

```bash
python -m pytest -q
```

## Target deployment

One Google Cloud Run container will host:

- React command dashboard;
- FastAPI mission API;
- Google ADK multi-agent workflow;
- deterministic forecast and impact engines.

Firestore will persist missions, agent runs, forecasts, approvals, and audit records. Secret Manager and Cloud Logging will provide secret protection and runtime evidence.

## Development order

1. Repository foundation and health API.
2. Shared mission schemas and replay fixtures.
3. Deterministic verification, forecast, and impact tools.
4. Five-agent ADK workflow.
5. Human approval API.
6. Turquoise tab-based command dashboard with a rotating red Earth.
7. Firestore persistence, tests, Docker image, and Cloud Run deployment.

## Tagline

*From seismic patterns to coordinated ASEAN response.*
