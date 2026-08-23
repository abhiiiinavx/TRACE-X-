from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.db.models import Email, ForensicCase
from backend.seed.seed_data import (
    seed_database,
    RAW_PAYPAL_EML,
    RAW_CEO_BEC_EML,
    RAW_DHL_MALWARE_EML,
    RAW_M365_OAUTH_EML,
    RAW_CLEAN_CORP_EML
)

router = APIRouter()

@router.post("/load-investigation")
@router.post("/load")
def load_demo_investigation(db: Session = Depends(get_db)):
    """One-click instant demo loader for judges and reviewers."""
    seed_database(db)
    # Return the PayPal high-profile investigation as default demo
    paypal_email = db.query(Email).filter(Email.subject.ilike("%PayPal%")).first()
    if not paypal_email:
        paypal_email = db.query(Email).order_by(Email.created_at.desc()).first()

    return {
        "status": "success",
        "message": "Full high-fidelity demo dataset loaded successfully.",
        "active_email_id": paypal_email.id if paypal_email else None,
        "case_id": paypal_email.case_id if paypal_email else None
    }

@router.get("/samples")
def get_sample_scenarios():
    """Provides sample EML payloads for instant 1-click testing in the UI."""
    return [
        {
            "id": "paypal-phish",
            "name": "PayPal Credential Phishing (Homoglyph & Tor Relay)",
            "threat_type": "Credential Phishing",
            "severity": "CRITICAL",
            "raw_eml": RAW_PAYPAL_EML
        },
        {
            "id": "ceo-bec",
            "name": "Executive CEO Wire Fraud (BEC & Display Name Spoof)",
            "threat_type": "BEC / CEO Fraud",
            "severity": "HIGH",
            "raw_eml": RAW_CEO_BEC_EML
        },
        {
            "id": "dhl-malware",
            "name": "DHL Shipping Manifest (AgentTesla InfoStealer)",
            "threat_type": "Malware Delivery",
            "severity": "CRITICAL",
            "raw_eml": RAW_DHL_MALWARE_EML
        },
        {
            "id": "m365-oauth",
            "name": "Microsoft 365 Password Expired (Multi-Hop Redirect)",
            "threat_type": "Credential Phishing",
            "severity": "HIGH",
            "raw_eml": RAW_M365_OAUTH_EML
        },
        {
            "id": "clean-newsletter",
            "name": "Legitimate TechInsider Newsletter (SPF/DKIM Valid)",
            "threat_type": "Legitimate",
            "severity": "CLEAN",
            "raw_eml": RAW_CLEAN_CORP_EML
        }
    ]
