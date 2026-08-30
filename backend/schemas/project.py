from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ProjectStatus(str, Enum):
    ongoing = "ongoing"
    completed = "completed"
    stalled = "stalled"
    flagged = "flagged"


class Sector(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    icon: str
    created_at: datetime


class Constituency(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    state: str
    mp_name: str | None = None
    district: str | None = None
    created_at: datetime


class Project(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    sector_id: str | None = None
    constituency_id: str | None = None
    sanctioned_amount_cr: float = Field(ge=0)
    spent_amount_cr: float = Field(ge=0)
    status: ProjectStatus
    latitude: float | None = None
    longitude: float | None = None
    benchmark_amount_cr: float | None = Field(default=None, ge=0)
    estimated_days: int | None = Field(default=None, ge=0)
    actual_days: int | None = Field(default=None, ge=0)
    implementing_agency: str | None = None
    location: str | None = None
    created_at: datetime
    updated_at: datetime
    sector: Sector | None = None
    constituency: Constituency | None = None


class ProjectsResponse(BaseModel):
    data: list[Project]
    count: int | None = None

    def model_post_init(self, __context: object) -> None:
        if self.count is None:
            self.count = len(self.data)