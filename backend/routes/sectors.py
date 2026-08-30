from __future__ import annotations

from pydantic import BaseModel
from fastapi import APIRouter

from backend.schemas.project import Sector
from backend.services.project_service import list_sectors

router = APIRouter(prefix="/sectors", tags=["sectors"])


class SectorsResponse(BaseModel):
    data: list[Sector]
    count: int | None = None

    def model_post_init(self, __context: object) -> None:
        if self.count is None:
            self.count = len(self.data)


@router.get("", response_model=SectorsResponse)
def get_sectors() -> SectorsResponse:
    return SectorsResponse(data=list_sectors())
