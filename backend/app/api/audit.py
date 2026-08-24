from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.db.models import AuditLog
from backend.app.db.schemas import AuditLogResponse

router = APIRouter()

@router.get("/logs", response_model=List[AuditLogResponse])
@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    """
    Returns actual, database-backed immutable security audit records.
    Records actions like LOGIN, RUN_ANALYSIS, COPILOT_QUERY, EXPORT_REPORT.
    """
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs
