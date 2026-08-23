from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.db.models import Email, ForensicCase, AuditLog
from backend.app.api.analysis import get_email_analysis
from backend.app.reports.report_generator import ForensicReportGenerator

router = APIRouter()

@router.get("/html/{email_id}", response_class=HTMLResponse)
def view_html_report(email_id: str, db: Session = Depends(get_db)):
    email_resp = get_email_analysis(email_id, db)
    case_number = "TX-2026-0001"
    if email_resp.case_id:
        c = db.query(ForensicCase).filter(ForensicCase.id == email_resp.case_id).first()
        if c:
            case_number = c.case_number

    html_content = ForensicReportGenerator.generate_html_report(
        case_number=case_number,
        email_data=email_resp.model_dump()
    )

    # Log report generation in Audit Log
    audit = AuditLog(
        username="Forensic Report Exporter",
        action="EXPORT_REPORT",
        target_type="Email",
        target_id=email_id,
        details={"case_number": case_number}
    )
    db.add(audit)
    db.commit()

    return HTMLResponse(content=html_content)
