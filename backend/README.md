# MPLADS FastAPI Backend

FastAPI backend for the **MPLADS AI Surveillance & Citizen Photo Proof Portal** (District Administration Ghaziabad, UP).

## Integrated Architecture

- **Backend Framework**: FastAPI with Pydantic v2 schemas and CORS middleware
- **Frontend**: React + Vite + TypeScript with MapLibre 4K Satellite & Lucide icons
- **Data Layer**: Static JSON schemas with dynamic service managers for projects, sectors, alerts, and citizen proof reports

## Running Locally

### 1. Run full stack (Backend + Frontend together):
```bash
npm run dev
```
Or on Windows:
```cmd
start.bat
```

### 2. Run backend only:
```bash
npm run server
```
Or directly:
```bash
python -m uvicorn backend.main:app --reload --port 8000
```

Backend will be active at: `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

## API Endpoints

- `GET /api/health` — Service health & diagnostic status
- `GET /api/dashboard` — High-level summary metrics (totals, budgets, utilization, risks)
- `GET /api/projects` — All monitored projects (supports `status` and `search` query parameters)
- `GET /api/projects/{id}` — Single project dossier
- `GET /api/sectors` — Monitored infrastructure sectors
- `GET /api/constituency` — Constituency metadata
- `GET /api/alerts` — AI anomaly alerts (supports `severity` and `resolved` filters)
- `GET /api/citizen-proofs` — Jan Sunwai ground truth photo verification reports
- `POST /api/citizen-proofs` — Submit citizen photo evidence
- `POST /api/citizen-proofs/{id}/upvote` — Upvote citizen proof report
- `POST /api/citizen-proofs/{id}/verify` — CDO administrative endorsement