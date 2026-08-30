from __future__ import annotations

from typing import Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from backend.schemas.project import Project, ProjectStatus, ProjectsResponse
from backend.services.project_service import (
    get_project,
    list_projects,
    send_project_notice,
    toggle_project_star,
)

router = APIRouter(prefix="/projects", tags=["projects"])


class ActionResponse(BaseModel):
    success: bool
    data: dict[str, Any]


class StarRequest(BaseModel):
    starred: bool | None = None


@router.get("", response_model=ProjectsResponse)
def get_projects(
    status: ProjectStatus | None = Query(default=None),
    search: str | None = Query(default=None, min_length=1),
) -> ProjectsResponse:
    return ProjectsResponse(
        data=list_projects(status=status, search=search),
    )


@router.get("/{project_id}", response_model=Project)
def get_project_by_id(project_id: str) -> Project:
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
    return project


@router.post("/{project_id}/star", response_model=ActionResponse)
def star_project(project_id: str, req: StarRequest | None = None) -> ActionResponse:
    starred_val = req.starred if req else None
    result = toggle_project_star(project_id, starred=starred_val)
    if not result:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
    return ActionResponse(success=True, data=result)


@router.post("/{project_id}/notice", response_model=ActionResponse)
def issue_notice(project_id: str) -> ActionResponse:
    result = send_project_notice(project_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
    return ActionResponse(success=True, data=result)