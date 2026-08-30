from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.db.database import init_db
from backend.routes.agencies import router as agencies_router
from backend.routes.ai_chat import router as ai_chat_router
from backend.routes.alerts import router as alerts_router
from backend.routes.citizen_proofs import router as citizen_proofs_router
from backend.routes.constituencies import router as constituency_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.health import router as health_router
from backend.routes.projects import router as projects_router
from backend.routes.reports import router as reports_router
from backend.routes.sectors import router as sectors_router
from backend.routes.upload import router as upload_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite Database with schemas and seed data on startup
    init_db()
    upload_dir = Path(__file__).resolve().parent / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    yield


def _allowed_origins() -> list[str]:
    configured_origins = os.getenv("FRONTEND_ORIGINS", "")
    if configured_origins.strip():
        return [
            origin.strip()
            for origin in configured_origins.split(",")
            if origin.strip()
        ]

    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*",
    ]


app = FastAPI(
    title="MPLADS AI Surveillance API",
    description="Full-stack FastAPI backend with SQLite persistence for MPLADS Surveillance & Citizen Proof Portal.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Uploads directory
upload_dir = Path(__file__).resolve().parent / "uploads"
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

# API Routes
app.include_router(health_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(sectors_router, prefix="/api")
app.include_router(constituency_router, prefix="/api")
app.include_router(citizen_proofs_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(ai_chat_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(agencies_router, prefix="/api")