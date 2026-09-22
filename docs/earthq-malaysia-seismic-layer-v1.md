# Earth Q Malaysia Seismic Layer v1

Design contract — 22 September 2026. This module is decision support, not an official warning service.

## Map and command panel
Seven independent toggles: live earthquakes (METMalaysia, BMKG, USGS), JMG mapped faults, long-term seismic hazard/PGA, historical earthquakes, ground vulnerability, population and critical-asset exposure, and modelled impact zones. Each layer shows source, licence/attribution, coverage, version, last update and legend. Filter events by UTC time, magnitude, depth and verification. Event panel shows evidence, uncertainty, revision history, source disagreement and a response-plan action gated by human approval. Use a dark command-centre theme with turquoise controls and accessible labels.

Keep hazard (potential shaking), exposure (people/assets), vulnerability (susceptibility) and operational risk (calibrated combination plus uncertainty) separate. PGA is acceleration, not magnitude. Unknown coverage is unknown, not zero. Never publish numeric risk without calibrated inputs.

## Verification pipeline
Ingest raw provider payloads with event IDs, UTC origin and fetch times, magnitudes with type, km depth, WGS84 coordinates, uncertainty, revision and source URL. Normalize while preserving originals. Deduplicate using event identity, time and distance, never magnitude/depth alone. States: `PENDING_VERIFICATION`, `SOURCE_REPORTED`, `CROSS_VERIFIED`, `CONFLICTED`, `RETRACTED`. A single feed is source reported; independent matching records enable cross verification; conflicting locations remain conflicted. Preserve immutable revisions. Lack of a second feed is not proof an event did not happen. Do not invent a confidence percentage.

The purported Selat Melaka M4.7 at ~10 km has no confirmed event ID and coordinates in this project. Keep it as `HYPOTHETICAL` only, excluded from live and historical catalogues. JMG mapped-fault proximity does not attribute an earthquake to that fault.

## API contract
- `GET /api/v1/earthq/layers`: IDs, source, version, coverage, update time, legend and GeoJSON/tile reference.
- `GET /api/v1/earthq/events?bbox=&from=&to=&status=`: paginated verified-status event GeoJSON; longitude then latitude.
- `GET /api/v1/earthq/events/{id}`: provenance, revisions, hazard, exposure, vulnerability, impact and limits.
- `POST /api/v1/earthq/scenarios`: analyst-provided WGS84 coordinate and parameters; explicitly hypothetical.
- `POST /api/v1/earthq/events/{id}/response-plans`: draft response plan only, with approval pending.

Every result includes data-as-of, sources, coverage and limitations. Unknown values are null with a reason. No estimated shaking, fault distance or exposed-facility count without a deterministic model and versioned data. No outward alert before human approval.

## Feature property schema
```json
{
  "event_type": "OBSERVED",
  "verification_status": "SOURCE_REPORTED",
  "origin_time_utc": "ISO-8601",
  "magnitude": 4.0,
  "magnitude_type": "Mw",
  "depth_km": 10.0,
  "sources": [{"provider": "METMalaysia", "event_id": "provider-id", "url": "source-url", "fetched_at_utc": "ISO-8601"}],
  "revisions": [],
  "hazard": {"status": "NOT_ASSESSED"},
  "exposure": {"status": "DATA_UNAVAILABLE"},
  "vulnerability": {"status": "DATA_UNAVAILABLE"},
  "operational_risk": {"status": "WITHHELD", "reason": "Insufficient calibrated inputs"}
}
```
The values above describe a schema example, not a real event. A live GeoJSON Feature requires valid coordinates and verified provenance.

## Implementation sequence and acceptance
1. Event source adapters, fixture tests, revision audit and cross-source verification.
2. JMG overlay with attribution and versioned cache; check CRS and geodesic proximity.
3. Historical events and long-term hazard with separate legends and timestamps.
4. Dated exposure/vulnerability inventories and coverage indicators.
5. Validated deterministic shaking/impact calculations with uncertainty.
6. Dashboard, scenario labelling and human approval audit.

Acceptance: conflicting events cannot be promoted by an AI narrative; hypothetical scenarios never enter live history; missing vulnerability withholds numeric risk; all shown values have source/time; outbound action requires recorded human approval.
