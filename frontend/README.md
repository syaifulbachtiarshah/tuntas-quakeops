# TUNTAS QuakeOps Frontend

Frontend-only React + TypeScript prototype for an ASEAN Emergency Command Centre.

## Scope of this milestone

- Eight keyboard-accessible command tabs in one interface.
- Indonesia and Malaysia historical replay fixtures.
- Probabilistic aftershock windows with confidence bands and safety language.
- Comparative impact matrix and five-agent operations view.
- Structured response plan with Reject, Request Revision, and confirmed local Approve flows.
- Local audit events; no external dispatch or persistent storage.
- Technical architecture view that separates implemented foundation, demo mock, and planned integration.

The existing Python FastAPI and Google ADK backend remains outside this folder and is not changed by this milestone.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:4173`.

## Production build

```bash
npm run build
```

## Safety boundary

All mission data is deterministic demo data. The UI does not call Gemini, Google Cloud, live seismic feeds, emergency agencies, or external dispatch systems. Approval records a browser-memory audit event only.
