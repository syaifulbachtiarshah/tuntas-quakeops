# TUNTAS QuakeOps Frontend

Frontend-only React + TypeScript prototype for an ASEAN Emergency Command Centre.

## Scope of this milestone

- Nine keyboard-accessible command tabs in one interface.
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

Operational mission panels use deterministic demo data; the Tsunami & Sejarah module uses cited historical records and study summaries. The UI does not call Gemini, Google Cloud, live seismic feeds, emergency agencies, or external dispatch systems. Approval records a browser-memory audit event only.

## Tsunami & Sejarah (Earth Q)

Open `#tsunami` for a Malay-language coastal comparison, an offline context map and a source-linked timeline. The atlas distinguishes the observed 2004 Sumatra–Andaman tsunami from the conditional Manila Trench scenarios studied for Terengganu. Natural Earth 1:110m public-domain coastlines are bundled, so this module does not require map tiles or API calls.

The fault traces and propagation arrows are coarse schematic interpretations, not a finite-fault dataset, tsunami propagation model, arrival-time forecast, inundation footprint or evacuation boundary. The 2023 study's Kuala Terengganu values are explicitly conditional simulation results. This module does not provide current warnings or an address-specific risk rating. Official source links and a review date are included. Existing operational panels retain their prior data modes.
