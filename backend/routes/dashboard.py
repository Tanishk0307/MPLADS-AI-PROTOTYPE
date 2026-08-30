from __future__ import annotations

from fastapi import APIRouter

from backend.schemas.dashboard import DashboardResponse
from backend.services.dashboard_service import get_dashboard

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard_summary() -> DashboardResponse:
    return get_dashboard()