from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from backend.db.database import get_db_connection
from backend.schemas.citizen_proof import CitizenProofCreateRequest, CitizenProofReport


def _row_to_proof(r: Any) -> CitizenProofReport:
    return CitizenProofReport.model_validate(
        {
            "id": r["id"],
            "projectId": r["project_id"],
            "projectName": r["project_name"],
            "location": r["location"],
            "citizenName": r["citizen_name"],
            "isAnonymous": bool(r["is_anonymous"]),
            "imageUrl": r["image_url"],
            "progressPercentage": r["progress_percentage"],
            "workStatus": r["work_status"],
            "remarks": r["remarks"],
            "upvotes": r["upvotes"],
            "verifiedByCdo": bool(r["verified_by_cdo"]),
            "submittedAt": r["submitted_at"],
            "geoLat": r["geo_lat"],
            "geoLng": r["geo_lng"],
        }
    )


def list_citizen_proofs(project_id: str | None = None) -> list[CitizenProofReport]:
    conn = get_db_connection()
    cursor = conn.cursor()

    if project_id:
        cursor.execute(
            "SELECT * FROM citizen_proofs WHERE project_id = ? ORDER BY submitted_at DESC",
            (project_id,),
        )
    else:
        cursor.execute("SELECT * FROM citizen_proofs ORDER BY submitted_at DESC")

    rows = cursor.fetchall()
    conn.close()
    return [_row_to_proof(r) for r in rows]


def add_citizen_proof(data: CitizenProofCreateRequest) -> CitizenProofReport:
    conn = get_db_connection()
    cursor = conn.cursor()

    proof_id = f"proof-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    cursor.execute(
        """
        INSERT INTO citizen_proofs (
            id, project_id, project_name, location, citizen_name,
            is_anonymous, image_url, progress_percentage, work_status,
            remarks, upvotes, verified_by_cdo, submitted_at, geo_lat, geo_lng
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            proof_id,
            data.projectId,
            data.projectName,
            data.location,
            data.citizenName,
            1 if data.isAnonymous else 0,
            data.imageUrl,
            data.progressPercentage,
            data.workStatus.value,
            data.remarks,
            1,
            0,
            now_iso,
            data.geoLat,
            data.geoLng,
        ),
    )

    # Log to audit_logs
    cursor.execute(
        """
        INSERT INTO audit_logs (user_email, role, action, project_id, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            "citizen.portal@ghaziabad.gov.in" if not data.isAnonymous else "anonymous@citizen.in",
            "Citizen",
            "SUBMIT_PROOF",
            data.projectId,
            f"Citizen photo verification submitted by {data.citizenName}: {data.remarks[:60]}...",
            now_iso,
        ),
    )

    conn.commit()
    conn.close()

    return CitizenProofReport.model_validate(
        {
            "id": proof_id,
            "projectId": data.projectId,
            "projectName": data.projectName,
            "location": data.location,
            "citizenName": data.citizenName,
            "isAnonymous": data.isAnonymous,
            "imageUrl": data.imageUrl,
            "progressPercentage": data.progressPercentage,
            "workStatus": data.workStatus,
            "remarks": data.remarks,
            "upvotes": 1,
            "verifiedByCdo": False,
            "submittedAt": now_iso,
            "geoLat": data.geoLat,
            "geoLng": data.geoLng,
        }
    )


def upvote_citizen_proof(proof_id: str) -> CitizenProofReport | None:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE citizen_proofs SET upvotes = upvotes + 1 WHERE id = ?", (proof_id,))
    cursor.execute("SELECT * FROM citizen_proofs WHERE id = ?", (proof_id,))
    row = cursor.fetchone()
    conn.commit()
    conn.close()

    if not row:
        return None
    return _row_to_proof(row)


def verify_citizen_proof(proof_id: str, verified: bool = True) -> CitizenProofReport | None:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE citizen_proofs SET verified_by_cdo = ? WHERE id = ?",
        (1 if verified else 0, proof_id),
    )
    cursor.execute("SELECT * FROM citizen_proofs WHERE id = ?", (proof_id,))
    row = cursor.fetchone()

    # Log to audit_logs
    if row:
        cursor.execute(
            """
            INSERT INTO audit_logs (user_email, role, action, project_id, details, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                "cdo.ghaziabad@up.gov.in",
                "CDO",
                "VERIFY_PROOF",
                row["project_id"],
                f"CDO {'Endorsed' if verified else 'Revoked Endorsement'} for proof report {proof_id}",
                datetime.now(timezone.utc).isoformat(),
            ),
        )

    conn.commit()
    conn.close()

    if not row:
        return None
    return _row_to_proof(row)
