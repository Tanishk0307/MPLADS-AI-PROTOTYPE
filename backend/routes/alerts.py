from __future__ import annotations

from fastapi import APIRouter, Query

from backend.schemas.alert import AlertSeverity, AlertsResponse
from backend.services.alert_service import list_alerts

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=AlertsResponse)
def get_alerts(
    severity: AlertSeverity | None = Query(default=None),
    resolved: bool | None = Query(default=None),
) -> AlertsResponse:
    return AlertsResponse(
        data=list_alerts(severity=severity, resolved=resolved),
    )