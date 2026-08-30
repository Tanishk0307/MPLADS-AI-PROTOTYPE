from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from backend.services.alert_service import list_alerts
from backend.services.citizen_proof_service import list_citizen_proofs
from backend.services.project_service import list_projects

router = APIRouter(prefix="/agencies", tags=["agencies"])


class AgencyScorecardItem(BaseModel):
    agency_name: str
    total_projects: int
    total_sanctioned_cr: float
    total_spent_cr: float
    utilization_percent: float
    avg_delay_days: int
    avg_cost_overrun_pct: float
    flagged_count: int
    stalled_count: int
    completed_count: int
    citizen_proofs_count: int
    performance_grade: str  # A+, A, B, C, Critical Risk (F)
    risk_level: str  # LOW, MEDIUM, CRITICAL


class AgencyScorecardResponse(BaseModel):
    data: list[AgencyScorecardItem]
    count: int


@router.get("/scorecard", response_model=AgencyScorecardResponse)
def get_agency_scorecard() -> AgencyScorecardResponse:
    projects = list_projects()
    alerts = list_alerts()
    proofs = list_citizen_proofs()

    alert_map = {a.project_id: a for a in alerts}

    # Group by agency
    agencies_map: dict[str, list] = {}
    for p in projects:
        agency = p.implementing_agency or "Unassigned Contractor"
        agencies_map.setdefault(agency, []).append(p)

    scorecard: list[AgencyScorecardItem] = []

    for agency_name, p_list in agencies_map.items():
        total_sanctioned = sum(p.sanctioned_amount_cr for p in p_list)
        total_spent = sum(p.spent_amount_cr for p in p_list)
        utilization = (total_spent / total_sanctioned * 100) if total_sanctioned else 0

        delays: list[int] = []
        overruns: list[float] = []

        flagged = 0
        stalled = 0
        completed = 0

        for p in p_list:
            if p.status.value == "flagged":
                flagged += 1
            elif p.status.value == "stalled":
                stalled += 1
            elif p.status.value == "completed":
                completed += 1

            if p.actual_days and p.estimated_days:
                delays.append(max(0, p.actual_days - p.estimated_days))

            if p.sanctioned_amount_cr > 0:
                cost_diff = (p.spent_amount_cr - p.sanctioned_amount_cr) / p.sanctioned_amount_cr
                if cost_diff > 0:
                    overruns.append(cost_diff * 100)

        avg_delay = int(sum(delays) / len(delays)) if delays else 0
        avg_overrun = round(sum(overruns) / len(overruns), 1) if overruns else 0.0

        # Citizen proof count for this agency
        p_ids = {p.id for p in p_list}
        agency_proofs = sum(1 for pr in proofs if pr.projectId in p_ids)

        # Performance Grade & Risk
        if flagged >= 2 or avg_overrun > 25 or avg_delay > 100:
            grade = "Critical Risk (F)"
            risk = "CRITICAL"
        elif flagged >= 1 or stalled >= 1 or avg_overrun > 10 or avg_delay > 30:
            grade = "Moderate Watch (C)"
            risk = "MEDIUM"
        elif completed == len(p_list):
            grade = "Exemplary (A+)"
            risk = "LOW"
        else:
            grade = "Satisfactory (B)"
            risk = "LOW"

        scorecard.append(
            AgencyScorecardItem(
                agency_name=agency_name,
                total_projects=len(p_list),
                total_sanctioned_cr=round(total_sanctioned, 2),
                total_spent_cr=round(total_spent, 2),
                utilization_percent=round(utilization, 2),
                avg_delay_days=avg_delay,
                avg_cost_overrun_pct=avg_overrun,
                flagged_count=flagged,
                stalled_count=stalled,
                completed_count=completed,
                citizen_proofs_count=agency_proofs,
                performance_grade=grade,
                risk_level=risk,
            )
        )

    # Sort critical risk first, then by project count
    scorecard.sort(key=lambda item: (item.risk_level == "CRITICAL", item.flagged_count), reverse=True)

    return AgencyScorecardResponse(data=scorecard, count=len(scorecard))
