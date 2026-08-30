from __future__ import annotations

import os
import uuid
from pathlib import Path
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class UploadResponse(BaseModel):
    url: str
    filename: str
    size: int


@router.post("", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)) -> UploadResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    size = len(content)
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of 10MB (file is {size / 1024 / 1024:.1f}MB)",
        )

    unique_name = f"{uuid.uuid4().hex[:12]}{ext}"
    destination = UPLOAD_DIR / unique_name

    with open(destination, "wb") as f:
        f.write(content)

    file_url = f"/uploads/{unique_name}"

    return UploadResponse(
        url=file_url,
        filename=unique_name,
        size=size,
    )
