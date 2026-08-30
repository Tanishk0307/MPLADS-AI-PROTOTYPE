from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.schemas.project import Constituency
from backend.services.project_service import get_constituency

router = APIRouter(prefix="/constituency", tags=["constituency"])


@router.get("", response_model=Constituency)
def get_current_constituency() -> Constituency:
    constituency = get_constituency()
    if not constituency:
        raise HTTPException(status_code=404, detail="Constituency details not found")
    return constituency
