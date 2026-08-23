from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.db.models import ForensicCase, Evidence, TimelineEvent, Email
from backend.app.db.schemas import ForensicCaseCreate, ForensicCaseResponse

router = APIRouter()

@router.get("/", response_model=List[ForensicCaseResponse])
def list_cases(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ForensicCase)
    if status and status.upper() != "ALL":
        query = query.filter(ForensicCase.status == status)
    cases = query.order_by(ForensicCase.updated_at.desc()).all()
    
    res = []
    for c in cases:
        email_count = db.query(Email).filter(Email.case_id == c.id).count()
        res.append(ForensicCaseResponse(
            id=c.id,
            case_number=c.case_number,
            title=c.title,
            severity=c.severity,
            status=c.status,
            investigator_name=c.investigator_name,
            action_items=c.action_items or [],
            notes=c.notes,
            email_count=email_count,
            created_at=c.created_at,
            updated_at=c.updated_at
        ))
    return res

@router.get("/{case_id}")
def get_case_detail(case_id: str, db: Session = Depends(get_db)):
    c = db.query(ForensicCase).filter(ForensicCase.id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")

    emails = db.query(Email).filter(Email.case_id == c.id).all()
    evidence_items = db.query(Evidence).filter(Evidence.case_id == c.id).all()
    timeline = db.query(TimelineEvent).filter(TimelineEvent.case_id == c.id).order_by(TimelineEvent.occurred_at.asc()).all()

    return {
        "case": {
            "id": c.id,
            "case_number": c.case_number,
            "title": c.title,
            "severity": c.severity,
            "status": c.status,
            "investigator_name": c.investigator_name,
            "action_items": c.action_items or [],
            "notes": c.notes,
            "created_at": c.created_at,
            "updated_at": c.updated_at
        },
        "emails": [
            {
                "id": e.id,
                "subject": e.subject,
                "from_addr": e.from_addr,
                "risk_score": e.risk_score,
                "severity": e.severity,
                "classification": e.classification,
                "sha256": e.sha256,
                "created_at": e.created_at
            }
            for e in emails
        ],
        "evidence": [
            {
                "id": ev.id,
                "evidence_type": ev.evidence_type,
                "source": ev.source,
                "sha256": ev.sha256,
                "collected_by": ev.collected_by,
                "is_immutable": ev.is_immutable,
                "created_at": ev.created_at
            }
            for ev in evidence_items
        ],
        "timeline": [
            {
                "id": t.id,
                "event_type": t.event_type,
                "description": t.description,
                "occurred_at": t.occurred_at,
                "evidence_ref": t.evidence_ref,
                "severity": t.severity
            }
            for t in timeline
        ]
    }

@router.patch("/{case_id}/status")
def update_case_status(case_id: str, new_status: str, db: Session = Depends(get_db)):
    c = db.query(ForensicCase).filter(ForensicCase.id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")
    c.status = new_status
    db.commit()
    return {"status": "success", "new_status": c.status}

@router.patch("/{case_id}/actions/{action_id}")
def toggle_case_action(case_id: str, action_id: str, is_completed: bool, db: Session = Depends(get_db)):
    c = db.query(ForensicCase).filter(ForensicCase.id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")
    
    actions = list(c.action_items or [])
    for act in actions:
        if act.get("id") == action_id:
            act["is_completed"] = is_completed
            break
    c.action_items = actions
    db.commit()
    return {"status": "success", "action_items": c.action_items}
