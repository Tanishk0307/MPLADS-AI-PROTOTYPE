from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from backend.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="mplads-backend",
        database="mock-data",
        timestamp=datetime.now(timezone.utc),
    )