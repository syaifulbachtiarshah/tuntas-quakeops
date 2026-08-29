from copy import deepcopy
from typing import Literal


ScenarioId = Literal["IDN-FLORES-2026", "MYS-AUG-2026"]

SCENARIOS: dict[str, dict] = {
    "IDN-FLORES-2026": {
        "scenario_id": "IDN-FLORES-2026",
        "title": "Flores M7.7 mainshock and aftershock response",
        "country": "Indonesia",
        "severity": "high",
        "event_time": "2026-08-15T04:58:23+07:00",
        "verified_facts": [
            "BMKG updated the mainshock magnitude to M7.7 at 15 km depth.",
            "The source was shallow Flores Back-Arc tectonic activity with a thrust mechanism.",
            "BMKG observed a tsunami and recorded a continuing aftershock sequence.",
        ],
        "sources": [
            {
                "authority": "BMKG",
                "url": "https://www.bmkg.go.id/siaran-pers/bmkg-1624-gempa-bumi-susulan-pasca-tsunami-flores-masih-terjadi-masyarakat-diimbau-tetap-tenang-dan-waspada",
            }
        ],
    },
    "MYS-AUG-2026": {
        "scenario_id": "MYS-AUG-2026",
        "title": "Malaysia August 2026 seismic monitoring",
        "country": "Malaysia",
        "severity": "monitor",
        "event_time": "2026-08-28T00:06:00+08:00",
        "verified_facts": [
            "METMalaysia reported an M3.4 earthquake at 10 km depth near Temenggor, Gerik, Perak.",
            "The event was felt around Gerik and METMalaysia continued official monitoring.",
            "A separate western Johor waters event earlier that week provides regional comparison context.",
        ],
        "sources": [
            {
                "authority": "METMalaysia",
                "url": "https://www.met.gov.my/data/IWR31004.html",
            },
            {
                "authority": "METMalaysia MyGempa",
                "url": "https://mygempa.met.gov.my/",
            },
        ],
    },
}


def list_scenarios() -> list[dict]:
    return [deepcopy(value) for value in SCENARIOS.values()]


def get_scenario(scenario_id: str) -> dict:
    return deepcopy(SCENARIOS[scenario_id])


def build_mission_prompt(scenario: dict) -> str:
    facts = "\n".join(f"- {fact}" for fact in scenario["verified_facts"])
    sources = "\n".join(
        f'- {source["authority"]}: {source["url"]}'
        for source in scenario["sources"]
    )
    return f"""
Prepare an ASEAN emergency command-centre situation brief for this fixed replay.

SCENARIO
ID: {scenario['scenario_id']}
Title: {scenario['title']}
Country: {scenario['country']}
Operational severity: {scenario['severity']}
Event time: {scenario['event_time']}

VERIFIED FACTS
{facts}

AUTHORITATIVE SOURCES
{sources}

Return these exact sections:
SITUATION
EVIDENCE
OPERATIONAL PRIORITIES
RESPONSE PLAN
HUMAN APPROVAL REQUIRED
LIMITATIONS

Rules:
- Treat this as a historical replay, not a live emergency alert.
- Do not invent casualty counts, probabilities, sensor readings, or official actions.
- Distinguish verified facts from agent recommendations.
- Keep every high-consequence action pending human approval.
- State clearly that exact mainshock prediction is outside system capability.
""".strip()
