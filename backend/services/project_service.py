from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from backend.db.database import get_db_connection
from backend.schemas.project import Constituency, Project, ProjectStatus, Sector


def _row_to_project_dict(row: Any, sector_row: Any = None, const_row: Any = None) -> dict[str, Any]:
    sec_data = None
    if sector_row:
        sec_data = {
            "id": sector_row["id"],
            "name": sector_row["name"],
            "icon": sector_row["icon"],
            "created_at": sector_row["created_at"],
        }

    const_data = None
    if const_row:
        const_data = {
            "id": const_row["id"],
            "name": const_row["name"],
            "state": const_row["state"],
            "mp_name": const_row["mp_name"],
            "district": const_row["district"],
            "created_at": const_row["created_at"],
        }

    return {
        "id": row["id"],
        "name": row["name"],
        "sector_id": row["sector_id"],
        "constituency_id": row["constituency_id"],
        "sanctioned_amount_cr": row["sanctioned_amount_cr"],
        "spent_amount_cr": row["spent_amount_cr"],
        "status": row["status"],
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "benchmark_amount_cr": row["benchmark_amount_cr"],
        "estimated_days": row["estimated_days"],
        "actual_days": row["actual_days"],
        "implementing_agency": row["implementing_agency"],
        "location": row["location"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "sector": sec_data,
        "constituency": const_data,
    }


def list_projects(
    status: ProjectStatus | None = None,
    search: str | None = None,
) -> list[Project]:
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT p.*, 
               s.id as sec_id, s.name as sec_name, s.icon as sec_icon, s.created_at as sec_created_at,
               c.id as const_id, c.name as const_name, c.state as const_state, c.mp_name as const_mp, c.district as const_dist, c.created_at as const_created_at
        FROM projects p
        LEFT JOIN sectors s ON p.sector_id = s.id
        LEFT JOIN constituencies c ON p.constituency_id = c.id
        WHERE 1=1
    """
    params: list[Any] = []

    if status:
        query += " AND p.status = ?"
        params.append(status.value)

    if search:
        s_pattern = f"%{search.strip().lower()}%"
        query += """ AND (
            LOWER(p.name) LIKE ? OR
            LOWER(p.location) LIKE ? OR
            LOWER(p.implementing_agency) LIKE ? OR
            LOWER(s.name) LIKE ? OR
            LOWER(c.name) LIKE ?
        )"""
        params.extend([s_pattern, s_pattern, s_pattern, s_pattern, s_pattern])

    query += " ORDER BY p.created_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result: list[Project] = []
    for r in rows:
        sec_obj = None
        if r["sec_id"]:
            sec_obj = {
                "id": r["sec_id"],
                "name": r["sec_name"],
                "icon": r["sec_icon"],
                "created_at": r["sec_created_at"],
            }
        const_obj = None
        if r["const_id"]:
            const_obj = {
                "id": r["const_id"],
                "name": r["const_name"],
                "state": r["const_state"],
                "mp_name": r["const_mp"],
                "district": r["const_dist"],
                "created_at": r["const_created_at"],
            }

        p_dict = {
            "id": r["id"],
            "name": r["name"],
            "sector_id": r["sector_id"],
            "constituency_id": r["constituency_id"],
            "sanctioned_amount_cr": r["sanctioned_amount_cr"],
            "spent_amount_cr": r["spent_amount_cr"],
            "status": r["status"],
            "latitude": r["latitude"],
            "longitude": r["longitude"],
            "benchmark_amount_cr": r["benchmark_amount_cr"],
            "estimated_days": r["estimated_days"],
            "actual_days": r["actual_days"],
            "implementing_agency": r["implementing_agency"],
            "location": r["location"],
            "created_at": r["created_at"],
            "updated_at": r["updated_at"],
            "sector": sec_obj,
            "constituency": const_obj,
        }
        result.append(Project.model_validate(p_dict))

    return result


def get_project(project_id: str) -> Project | None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT p.*, 
               s.id as sec_id, s.name as sec_name, s.icon as sec_icon, s.created_at as sec_created_at,
               c.id as const_id, c.name as const_name, c.state as const_state, c.mp_name as const_mp, c.district as const_dist, c.created_at as const_created_at
        FROM projects p
        LEFT JOIN sectors s ON p.sector_id = s.id
        LEFT JOIN constituencies c ON p.constituency_id = c.id
        WHERE p.id = ?
        """,
        (project_id,),
    )
    r = cursor.fetchone()
    conn.close()

    if not r:
        return None

    sec_obj = {"id": r["sec_id"], "name": r["sec_name"], "icon": r["sec_icon"], "created_at": r["sec_created_at"]} if r["sec_id"] else None
    const_obj = {"id": r["const_id"], "name": r["const_name"], "state": r["const_state"], "mp_name": r["const_mp"], "district": r["const_dist"], "created_at": r["const_created_at"]} if r["const_id"] else None

    return Project.model_validate(
        {
            "id": r["id"],
            "name": r["name"],
            "sector_id": r["sector_id"],
            "constituency_id": r["constituency_id"],
            "sanctioned_amount_cr": r["sanctioned_amount_cr"],
            "spent_amount_cr": r["spent_amount_cr"],
            "status": r["status"],
            "latitude": r["latitude"],
            "longitude": r["longitude"],
            "benchmark_amount_cr": r["benchmark_amount_cr"],
            "estimated_days": r["estimated_days"],
            "actual_days": r["actual_days"],
            "implementing_agency": r["implementing_agency"],
            "location": r["location"],
            "created_at": r["created_at"],
            "updated_at": r["updated_at"],
            "sector": sec_obj,
            "constituency": const_obj,
        }
    )


def list_sectors() -> list[Sector]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sectors ORDER BY name ASC")
    rows = cursor.fetchall()
    conn.close()
    return [Sector.model_validate(dict(r)) for r in rows]


def get_constituency() -> Constituency | None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM constituencies LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return Constituency.model_validate(dict(row))


def toggle_project_star(project_id: str, starred: bool | None = None) -> dict[str, Any] | None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT is_starred FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    current_val = bool(row["is_starred"])
    new_val = (not current_val) if starred is None else starred

    # When starred by CDO, notice automatically
    if new_val:
        cursor.execute(
            """
            UPDATE projects 
            SET is_starred = 1, is_noticed = 1, updated_at = ?
            WHERE id = ?
            """,
            (datetime.now(timezone.utc).isoformat(), project_id),
        )
    else:
        cursor.execute(
            "UPDATE projects SET is_starred = 0, updated_at = ? WHERE id = ?",
            (datetime.now(timezone.utc).isoformat(), project_id),
        )

    # Log to audit_logs
    cursor.execute(
        """
        INSERT INTO audit_logs (user_email, role, action, project_id, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            "cdo.ghaziabad@up.gov.in",
            "CDO",
            "TOGGLE_STAR",
            project_id,
            f"Vigilance star {'placed (notice dispatched)' if new_val else 'removed'}",
            datetime.now(timezone.utc).isoformat(),
        ),
    )

    conn.commit()
    conn.close()
    return {"project_id": project_id, "is_starred": new_val}


def send_project_notice(project_id: str) -> dict[str, Any] | None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name, implementing_agency FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    cursor.execute(
        "UPDATE projects SET is_noticed = 1, updated_at = ? WHERE id = ?",
        (datetime.now(timezone.utc).isoformat(), project_id),
    )

    cursor.execute(
        """
        INSERT INTO audit_logs (user_email, role, action, project_id, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            "cdo.ghaziabad@up.gov.in",
            "CDO",
            "DISPATCH_NOTICE",
            project_id,
            f"Statutory Show-Cause Vigilance Notice dispatched to {row['implementing_agency']}",
            datetime.now(timezone.utc).isoformat(),
        ),
    )

    conn.commit()
    conn.close()
    return {"project_id": project_id, "is_noticed": True, "agency": row["implementing_agency"]}