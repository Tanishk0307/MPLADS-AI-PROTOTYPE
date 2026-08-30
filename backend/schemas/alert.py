from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class AlertType(str, Enum):
    cost_overrun = "cost_overrun"
    geo_duplicate = "geo_duplicate"
    timeline_delay = "timeline_delay"
    vendor_irregular = "vendor_irregular"
    fund_diversion = "fund_diversion"
    fund_stagnation = "fund_stagnation"


class AlertSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    CRITICAL = "CRITICAL"


class Alert(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    project_id: str
    type: AlertType
    severity: AlertSeverity
    title: str
    description: str
    metric_value: float | None = None
    detected_at: datetime
    resolved: bool
    risk_score: int
    reasons: list[str]


class AlertsResponse(BaseModel):
    data: list[Alert]
    count: int | None = None

    def model_post_init(self, __context: object) -> None:
        if self.count is None:
            self.count = len(self.data)