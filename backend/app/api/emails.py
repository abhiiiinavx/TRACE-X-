from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.db.models import Email

router = APIRouter()

@router.get("/")
def list_emails(
    skip: int = 0,
    limit: int = 50,
    severity: Optional[str] = None,
    classification: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Email)
    if severity and severity.upper() != "ALL":
        query = query.filter(Email.severity == severity.upper())
    if classification and classification.upper() != "ALL":
        query = query.filter(Email.classification == classification)
    if search:
        query = query.filter(
            (Email.subject.ilike(f"%{search}%")) |
            (Email.from_addr.ilike(f"%{search}%")) |
            (Email.to_addr.ilike(f"%{search}%")) |
            (Email.sha256.ilike(f"%{search}%"))
        )
    
    total = query.count()
    emails = query.order_by(Email.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "items": [
            {
                "id": e.id,
                "case_id": e.case_id,
                "subject": e.subject,
                "from_addr": e.from_addr,
                "from_display_name": e.from_display_name,
                "to_addr": e.to_addr,
                "risk_score": e.risk_score,
                "severity": e.severity,
                "classification": e.classification,
                "sha256": e.sha256,
                "created_at": e.created_at
            }
            for e in emails
        ]
    }

@router.delete("/{email_id}")
def delete_email(email_id: str, db: Session = Depends(get_db)):
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    db.delete(email)
    db.commit()
    return {"status": "deleted", "id": email_id}
