from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "mplads.db"
DATA_DIR = Path(__file__).resolve().parent.parent / "data"


_initialized = False


def get_db_connection() -> sqlite3.Connection:
    global _initialized
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    if not _initialized:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='projects'")
        table_exists = cursor.fetchone()
        if not table_exists:
            init_db()
        else:
            _initialized = True
    return conn


def init_db() -> None:
    global _initialized
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Sectors Table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS sectors (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            icon TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    # Constituencies Table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS constituencies (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            state TEXT NOT NULL,
            mp_name TEXT,
            district TEXT,
            created_at TEXT NOT NULL
        )
        """
    )

    # Projects Table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            sector_id TEXT,
            constituency_id TEXT,
            sanctioned_amount_cr REAL NOT NULL,
            spent_amount_cr REAL NOT NULL,
            status TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            benchmark_amount_cr REAL,
            estimated_days INTEGER,
            actual_days INTEGER,
            implementing_agency TEXT,
            location TEXT,
            is_starred INTEGER DEFAULT 0,
            is_noticed INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (sector_id) REFERENCES sectors(id),
            FOREIGN KEY (constituency_id) REFERENCES constituencies(id)
        )
        """
    )

    # Alerts Table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            type TEXT NOT NULL,
            severity TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            metric_value REAL,
            detected_at TEXT NOT NULL,
            resolved INTEGER DEFAULT 0,
            risk_score INTEGER NOT NULL,
            reasons TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
        """
    )

    # Citizen Proofs Table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS citizen_proofs (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            project_name TEXT NOT NULL,
            location TEXT NOT NULL,
            citizen_name TEXT NOT NULL,
            is_anonymous INTEGER DEFAULT 0,
            image_url TEXT NOT NULL,
            progress_percentage INTEGER NOT NULL,
            work_status TEXT NOT NULL,
            remarks TEXT NOT NULL,
            upvotes INTEGER DEFAULT 1,
            verified_by_cdo INTEGER DEFAULT 0,
            submitted_at TEXT NOT NULL,
            geo_lat REAL,
            geo_lng REAL
        )
        """
    )

    # Audit Logs Table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            role TEXT,
            action TEXT NOT NULL,
            project_id TEXT,
            details TEXT,
            timestamp TEXT NOT NULL
        )
        """
    )

    conn.commit()

    # Seed data if empty
    cursor.execute("SELECT COUNT(*) FROM projects")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_data(conn)

    _initialized = True
    conn.close()


def seed_data(conn: sqlite3.Connection) -> None:
    cursor = conn.cursor()
    projects_file = DATA_DIR / "projects.json"
    alerts_file = DATA_DIR / "alerts.json"
    proofs_file = DATA_DIR / "citizen_proofs.json"

    # 1. Seed Projects, Sectors, and Constituencies
    if projects_file.exists():
        with open(projects_file, "r", encoding="utf-8") as f:
            projects_data = json.load(f)

        for p in projects_data:
            sec = p.get("sector")
            if sec and sec.get("id"):
                cursor.execute(
                    """
                    INSERT OR IGNORE INTO sectors (id, name, icon, created_at)
                    VALUES (?, ?, ?, ?)
                    """,
                    (sec["id"], sec["name"], sec["icon"], sec["created_at"]),
                )

            const = p.get("constituency")
            if const and const.get("id"):
                cursor.execute(
                    """
                    INSERT OR IGNORE INTO constituencies (id, name, state, mp_name, district, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        const["id"],
                        const["name"],
                        const["state"],
                        const.get("mp_name"),
                        const.get("district"),
                        const["created_at"],
                    ),
                )

            cursor.execute(
                """
                INSERT OR REPLACE INTO projects (
                    id, name, sector_id, constituency_id, sanctioned_amount_cr,
                    spent_amount_cr, status, latitude, longitude, benchmark_amount_cr,
                    estimated_days, actual_days, implementing_agency, location,
                    is_starred, is_noticed, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    p["id"],
                    p["name"],
                    p.get("sector_id"),
                    p.get("constituency_id"),
                    p["sanctioned_amount_cr"],
                    p["spent_amount_cr"],
                    p["status"],
                    p.get("latitude"),
                    p.get("longitude"),
                    p.get("benchmark_amount_cr"),
                    p.get("estimated_days"),
                    p.get("actual_days"),
                    p.get("implementing_agency"),
                    p.get("location"),
                    1 if p.get("status") == "flagged" and "Solar" in p["name"] else 0,
                    1 if p.get("status") == "flagged" and "Solar" in p["name"] else 0,
                    p["created_at"],
                    p["updated_at"],
                ),
            )

    # 2. Seed Alerts
    if alerts_file.exists():
        with open(alerts_file, "r", encoding="utf-8") as f:
            alerts_data = json.load(f)

        for a in alerts_data:
            cursor.execute(
                """
                INSERT OR REPLACE INTO alerts (
                    id, project_id, type, severity, title, description,
                    metric_value, detected_at, resolved, risk_score, reasons
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    a["id"],
                    a["project_id"],
                    a["type"],
                    a["severity"],
                    a["title"],
                    a["description"],
                    a.get("metric_value"),
                    a["detected_at"],
                    1 if a.get("resolved") else 0,
                    a["risk_score"],
                    json.dumps(a.get("reasons", [])),
                ),
            )

    # 3. Seed Citizen Proofs
    if proofs_file.exists():
        with open(proofs_file, "r", encoding="utf-8") as f:
            proofs_data = json.load(f)

        for pr in proofs_data:
            cursor.execute(
                """
                INSERT OR REPLACE INTO citizen_proofs (
                    id, project_id, project_name, location, citizen_name,
                    is_anonymous, image_url, progress_percentage, work_status,
                    remarks, upvotes, verified_by_cdo, submitted_at, geo_lat, geo_lng
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    pr["id"],
                    pr["projectId"],
                    pr["projectName"],
                    pr["location"],
                    pr["citizenName"],
                    1 if pr.get("isAnonymous") else 0,
                    pr["imageUrl"],
                    pr["progressPercentage"],
                    pr["workStatus"],
                    pr["remarks"],
                    pr.get("upvotes", 1),
                    1 if pr.get("verifiedByCdo") else 0,
                    pr["submittedAt"],
                    pr.get("geoLat"),
                    pr.get("geoLng"),
                ),
            )

    conn.commit()
