from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class CitizenWorkStatus(str, Enum):
    on_track = "on_track"
    stalled = "stalled"
    slow = "slow"
    poor_quality = "poor_quality"
    completed = "completed"


class CitizenProofReport(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    projectId: str
    projectName: str
    location: str
    citizenName: str
    isAnonymous: bool = False
    imageUrl: str
    progressPercentage: int = Field(ge=0, le=100)
    workStatus: CitizenWorkStatus
    remarks: str
    upvotes: int = 0
    verifiedByCdo: bool = False
    submittedAt: datetime
    geoLat: float | None = None
    geoLng: float | None = None


class CitizenProofCreateRequest(BaseModel):
    projectId: str
    projectName: str
    location: str
    citizenName: str
    isAnonymous: bool = False
    imageUrl: str
    progressPercentage: int = Field(ge=0, le=100)
    workStatus: CitizenWorkStatus
    remarks: str
    geoLat: float | None = None
    geoLng: float | None = None


class CitizenProofsResponse(BaseModel):
    data: list[CitizenProofReport]
    count: int | None = None

    def model_post_init(self, __context: object) -> None:
        if self.count is None:
            self.count = len(self.data)
