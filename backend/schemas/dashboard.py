from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class StatusCounts(BaseModel):
    ongoing: int
    completed: int
    stalled: int
    flagged: int


class DashboardResponse(BaseModel):
    total_projects: int
    total_sanctioned_amount_cr: float
    total_spent_amount_cr: float
    utilization_percent: float
    critical_risk_count: int
    medium_risk_count: int
    projects_by_status: StatusCounts
    last_updated_at: datetime