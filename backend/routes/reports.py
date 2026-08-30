from __future__ import annotations

import csv
import io
from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, Response
from pydantic import BaseModel

from backend.services.alert_service import list_alerts
from backend.services.project_service import list_projects

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/export")
def export_csv_report() -> Response:
    projects = list_projects()
    alerts = list_alerts()
    alert_map = {a.project_id: a for a in alerts}

    output = io.StringIO()
    writer = csv.writer(output)

    # Header Row
    writer.writerow(
        [
            "Project ID",
            "Project Name",
            "Sector",
            "Location",
            "Implementing Agency",
            "Status",
            "Sanctioned (₹ Cr)",
            "Spent (₹ Cr)",
            "Utilization (%)",
            "Benchmark (₹ Cr)",
            "Est. Days",
            "Actual Days",
            "Days Overdue",
            "AI Risk Severity",
            "Risk Score (0-100)",
            "AI Flag Reasons",
            "GPS Coordinates",
            "Report Generated At",
        ]
    )

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    for p in projects:
        alt = alert_map.get(p.id)
        utilization = (p.spent_amount_cr / p.sanctioned_amount_cr * 100) if p.sanctioned_amount_cr else 0
        overdue_days = max(0, (p.actual_days or 0) - (p.estimated_days or 0)) if (p.actual_days and p.estimated_days) else 0
        reasons_text = "; ".join(alt.reasons) if alt else "Normal parameters"

        writer.writerow(
            [
                p.id,
                p.name,
                p.sector.name if p.sector else "N/A",
                p.location or "Ghaziabad",
                p.implementing_agency or "N/A",
                p.status.value.upper(),
                f"{p.sanctioned_amount_cr:.2f}",
                f"{p.spent_amount_cr:.2f}",
                f"{utilization:.1f}%",
                f"{p.benchmark_amount_cr:.2f}" if p.benchmark_amount_cr else "N/A",
                p.estimated_days or "N/A",
                p.actual_days or "N/A",
                overdue_days,
                alt.severity.value if alt else "NORMAL",
                alt.risk_score if alt else 0,
                reasons_text,
                f"{p.latitude}, {p.longitude}" if (p.latitude and p.longitude) else "N/A",
                now_str,
            ]
        )

    csv_data = output.getvalue()
    filename = f"MPLADS_Vigilance_Audit_Ghaziabad_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        },
    )


class ExecutiveSummaryResponse(BaseModel):
    district: str
    state: str
    total_projects: int
    total_sanctioned_cr: float
    total_spent_cr: float
    utilization_percent: float
    critical_risk_count: int
    flagged_projects_count: int
    top_risk_projects: list[dict[str, Any]]
    generated_at: str


@router.get("/summary", response_model=ExecutiveSummaryResponse)
def get_executive_summary() -> ExecutiveSummaryResponse:
    projects = list_projects()
    alerts = list_alerts(resolved=False)
    alert_map = {a.project_id: a for a in alerts}

    total_sanctioned = sum(p.sanctioned_amount_cr for p in projects)
    total_spent = sum(p.spent_amount_cr for p in projects)
    utilization = (total_spent / total_sanctioned * 100) if total_sanctioned else 0

    top_risks = []
    for a in alerts:
        p = next((p for p in projects if p.id == a.project_id), None)
        if p:
            top_risks.append(
                {
                    "project_id": p.id,
                    "name": p.name,
                    "agency": p.implementing_agency,
                    "severity": a.severity.value,
                    "risk_score": a.risk_score,
                    "reasons": a.reasons,
                }
            )

    return ExecutiveSummaryResponse(
        district="Ghaziabad",
        state="Uttar Pradesh",
        total_projects=len(projects),
        total_sanctioned_cr=round(total_sanctioned, 2),
        total_spent_cr=round(total_spent, 2),
        utilization_percent=round(utilization, 2),
        critical_risk_count=sum(1 for a in alerts if a.severity.value == "CRITICAL"),
        flagged_projects_count=sum(1 for p in projects if p.status.value == "flagged"),
        top_risk_projects=top_risks[:5],
        generated_at=datetime.now(timezone.utc).isoformat(),
    )
