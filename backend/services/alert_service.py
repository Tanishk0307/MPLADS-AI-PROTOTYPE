from __future__ import annotations

import json
from typing import Any

from backend.db.database import get_db_connection
from backend.schemas.alert import Alert, AlertSeverity


def list_alerts(
    severity: AlertSeverity | None = None,
    resolved: bool | None = None,
) -> list[Alert]:
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM alerts WHERE 1=1"
    params: list[Any] = []

    if severity:
        query += " AND severity = ?"
        params.append(severity.value)

    if resolved is not None:
        query += " AND resolved = ?"
        params.append(1 if resolved else 0)

    query += " ORDER BY resolved ASC, risk_score DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result: list[Alert] = []
    for r in rows:
        reasons_list = []
        try:
            reasons_list = json.loads(r["reasons"])
        except Exception:
            reasons_list = [r["reasons"]] if r["reasons"] else []

        result.append(
            Alert.model_validate(
                {
                    "id": r["id"],
                    "project_id": r["project_id"],
                    "type": r["type"],
                    "severity": r["severity"],
                    "title": r["title"],
                    "description": r["description"],
                    "metric_value": r["metric_value"],
                    "detected_at": r["detected_at"],
                    "resolved": bool(r["resolved"]),
                    "risk_score": r["risk_score"],
                    "reasons": reasons_list,
                }
            )
        )

    return result