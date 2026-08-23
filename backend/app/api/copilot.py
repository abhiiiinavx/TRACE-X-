from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.db.models import Email, ForensicCase, AuditLog
from backend.app.db.schemas import CopilotQuery, CopilotResponse
from backend.app.api.analysis import get_email_analysis
from backend.app.copilot.copilot_engine import ForensicCopilotEngine

router = APIRouter()

@router.post("/query", response_model=CopilotResponse)
def query_copilot(payload: CopilotQuery, db: Session = Depends(get_db)):
    email_data = {}
    case_data = {}

    if payload.email_id:
        email_resp = get_email_analysis(payload.email_id, db)
        email_data = email_resp.model_dump()
        if email_resp.case_id:
            c = db.query(ForensicCase).filter(ForensicCase.id == email_resp.case_id).first()
            if c:
                case_data = {"case_number": c.case_number, "title": c.title, "severity": c.severity}
    elif payload.case_id:
        c = db.query(ForensicCase).filter(ForensicCase.id == payload.case_id).first()
        if c:
            case_data = {"case_number": c.case_number, "title": c.title, "severity": c.severity}
            first_email = db.query(Email).filter(Email.case_id == c.id).first()
            if first_email:
                email_data = get_email_analysis(first_email.id, db).model_dump()
    else:
        # Get most recent email
        recent = db.query(Email).order_by(Email.created_at.desc()).first()
        if recent:
            email_data = get_email_analysis(recent.id, db).model_dump()

    response = ForensicCopilotEngine.answer_query(
        question=payload.question,
        email_data=email_data,
        case_data=case_data
    )

    # Log copilot query to AuditLog
    audit = AuditLog(
        username="Investigator Copilot Session",
        action="COPILOT_QUERY",
        target_type="Case",
        target_id=payload.case_id or payload.email_id,
        details={"question": payload.question, "query_id": response.query_id}
    )
    db.add(audit)
    db.commit()

    return response
