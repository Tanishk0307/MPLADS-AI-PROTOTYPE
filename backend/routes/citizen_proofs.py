from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from backend.schemas.citizen_proof import (
    CitizenProofCreateRequest,
    CitizenProofReport,
    CitizenProofsResponse,
)
from backend.services.citizen_proof_service import (
    add_citizen_proof,
    list_citizen_proofs,
    upvote_citizen_proof,
    verify_citizen_proof,
)

router = APIRouter(prefix="/citizen-proofs", tags=["citizen-proofs"])


@router.get("", response_model=CitizenProofsResponse)
def get_citizen_proofs(
    project_id: str | None = Query(default=None),
) -> CitizenProofsResponse:
    return CitizenProofsResponse(
        data=list_citizen_proofs(project_id=project_id),
    )


@router.post("", response_model=CitizenProofReport)
def create_citizen_proof(
    payload: CitizenProofCreateRequest,
) -> CitizenProofReport:
    return add_citizen_proof(payload)


@router.post("/{proof_id}/upvote", response_model=CitizenProofReport)
def upvote_proof(proof_id: str) -> CitizenProofReport:
    updated = upvote_citizen_proof(proof_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Proof report not found")
    return updated


@router.post("/{proof_id}/verify", response_model=CitizenProofReport)
def verify_proof(
    proof_id: str,
    verified: bool = Query(default=True),
) -> CitizenProofReport:
    updated = verify_citizen_proof(proof_id, verified=verified)
    if not updated:
        raise HTTPException(status_code=404, detail="Proof report not found")
    return updated
