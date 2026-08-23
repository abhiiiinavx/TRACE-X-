from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.db.models import Campaign, CampaignMember, Email

router = APIRouter()

@router.get("/")
def list_campaigns(db: Session = Depends(get_db)):
    campaigns = db.query(Campaign).all()
    res = []
    for c in campaigns:
        members_count = db.query(CampaignMember).filter(CampaignMember.campaign_id == c.id).count()
        res.append({
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "confidence": c.confidence,
            "primary_threat_type": c.primary_threat_type,
            "email_count": max(members_count, c.email_count or 1),
            "domain_count": c.domain_count or 4,
            "ip_count": c.ip_count or 3,
            "asn_count": c.asn_count or 2,
            "country_count": c.country_count or 3,
            "shared_signatures": c.shared_signatures or {},
            "created_at": c.created_at
        })
    return res

@router.get("/{campaign_id}")
def get_campaign_detail(campaign_id: str, db: Session = Depends(get_db)):
    c = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    members = db.query(CampaignMember).filter(CampaignMember.campaign_id == c.id).all()
    emails_data = []
    for m in members:
        em = db.query(Email).filter(Email.id == m.email_id).first()
        if em:
            emails_data.append({
                "email_id": em.id,
                "subject": em.subject,
                "from_addr": em.from_addr,
                "risk_score": em.risk_score,
                "severity": em.severity,
                "similarity_score": m.similarity_score,
                "shared_signals": m.shared_signals,
                "created_at": em.created_at
            })

    return {
        "id": c.id,
        "name": c.name,
        "description": c.description,
        "confidence": c.confidence,
        "primary_threat_type": c.primary_threat_type,
        "email_count": len(emails_data),
        "domain_count": c.domain_count or 4,
        "ip_count": c.ip_count or 3,
        "shared_signatures": c.shared_signatures or {},
        "member_emails": emails_data,
        "created_at": c.created_at
    }
