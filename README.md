# TUNTAS QuakeOps

**ASEAN Multi-Agent Aftershock and Earthquake Impact Forecasting System**

TUNTAS QuakeOps is a human-governed command-centre prototype for probabilistic aftershock forecasting, bounded impact assessment, and coordinated ASEAN response planning across Malaysia and Indonesia.

> **Safety boundary:** TUNTAS does not claim to predict the exact time, location, or magnitude of a future mainshock. Numeric forecasts must come from deterministic tools. Gemini agents may interpret verified results, explain uncertainty, and draft response plans, but they must not invent probabilities.

## Current status

- Google ADK 2.7.1 commander connected to the FastAPI mission API.
- Model configuration: `gemini-3.7-flash`.
- Fixed evidence-grounded replay scenarios: Flores 2026 and Malaysia August 2026.
- Every high-consequence action stops at a human approval gate.
- Docker and Cloud Run source-deployment configuration included.
- Google Cloud deployment is the next operational checkpoint; no live Cloud Run URL is claimed until verification passes.

## Runtime architecture

```text
ASEAN Command Dashboard
        |
        v
Cloud Run / FastAPI Mission API
        |
        v
Google ADK Runner -> Gemini 3.7 Flash
        |
        v
Evidence-grounded command brief
        |
        v
Human approval: PENDING
```

The Gemini API key is server-side only. The browser never receives it, and the populated `.env` file is excluded from Git and Docker build context.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Service discovery |
| GET | `/health` | Secret-free Cloud Run and Gemini readiness evidence |
| GET | `/scenarios` | Authoritative fixed replay inputs |
| POST | `/missions/replay` | Execute the Google ADK commander for one replay |

Example replay request:

```json
{
  "scenario_id": "IDN-FLORES-2026"
}
```

Supported scenario IDs:

- `IDN-FLORES-2026`
- `MYS-AUG-2026`

## Local setup

Use Python 3.11.

```bash
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set `GOOGLE_API_KEY`. Never commit the populated file.

Run the API:

```bash
python -m uvicorn app.main:app --reload --port 8080
```

Verify:

```text
GET  http://localhost:8080/health
GET  http://localhost:8080/scenarios
POST http://localhost:8080/missions/replay
```

Run tests:

```bash
python -m pytest -q
```

## Cloud Run deployment

Required Google Cloud services:

- Cloud Run
- Cloud Build
- Artifact Registry
- Secret Manager
- Cloud Logging

Store the existing AI Studio key as a Secret Manager secret named `TUNTAS_GOOGLE_API_KEY`, then expose it to the container only as `GOOGLE_API_KEY`.

A source deployment can use:

```bash
gcloud run deploy tuntas-quakeops \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_GENAI_USE_ENTERPRISE=0,TUNTAS_MODEL=gemini-3.7-flash \
  --set-secrets GOOGLE_API_KEY=TUNTAS_GOOGLE_API_KEY:latest
```

After deployment, verify that `/health` reports:

```json
{
  "status": "ok",
  "runtime": "google-cloud-run",
  "model": "gemini-3.7-flash",
  "gemini_configured": true
}
```

Then execute both replay scenarios and record the Cloud Run service page, URL, logs, and agent response for the under-four-minute demo video.

## Evidence sources

- METMalaysia earthquake information: https://www.met.gov.my/data/IWR31004.html
- METMalaysia MyGempa: https://mygempa.met.gov.my/
- BMKG Flores 2026 statement: https://www.bmkg.go.id/siaran-pers/bmkg-1624-gempa-bumi-susulan-pasca-tsunami-flores-masih-terjadi-masyarakat-diimbau-tetap-tenang-dan-waspada

## Tagline

*From seismic patterns to coordinated ASEAN response.*
