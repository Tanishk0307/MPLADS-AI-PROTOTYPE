from __future__ import annotations

from datetime import datetime, timezone

from backend.schemas.dashboard import DashboardResponse, StatusCounts
from backend.services.alert_service import list_alerts
from backend.services.project_service import list_projects


def get_dashboard() -> DashboardResponse:
    projects = list_projects()
    alerts = list_alerts(resolved=False)

    total_sanctioned = sum(project.sanctioned_amount_cr for project in projects)
    total_spent = sum(project.spent_amount_cr for project in projects)
    utilization = (
        (total_spent / total_sanctioned) * 100 if total_sanctioned else 0.0
    )
    status_counts = {
        "ongoing": 0,
        "completed": 0,
        "stalled": 0,
        "flagged": 0,
    }
    for project in projects:
        status_counts[project.status.value] += 1

    return DashboardResponse(
        total_projects=len(projects),
        total_sanctioned_amount_cr=round(total_sanctioned, 2),
        total_spent_amount_cr=round(total_spent, 2),
        utilization_percent=round(utilization, 2),
        critical_risk_count=sum(
            alert.severity.value == "CRITICAL" for alert in alerts
        ),
        medium_risk_count=sum(
            alert.severity.value == "MEDIUM" for alert in alerts
        ),
        projects_by_status=StatusCounts(**status_counts),
        last_updated_at=datetime.now(timezone.utc),
    )