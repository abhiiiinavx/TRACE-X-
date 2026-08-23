import pytest
from backend.app.detection.auth_validator import AuthValidator
from backend.app.detection.brand_impersonation import BrandImpersonationDetector
from backend.app.detection.nlp_analyzer import NLPAnalyzer
from backend.app.detection.scoring_engine import ScoringEngine

def test_brand_impersonation_homoglyph():
    res = BrandImpersonationDetector.analyze_domain("paypa1-security.com")
    assert res["is_lookalike"] is True
    assert res["brand"] == "PayPal"
    assert res["similarity_score"] >= 0.85

def test_nlp_urgency_and_bec():
    text = "Kindly process an urgent wire transfer of $50,000 to the updated bank account details within 24 hours."
    res = NLPAnalyzer.analyze_text("Urgent Wire Request", text)
    assert res["has_urgency"] is True
    assert res["has_financial_request"] is True
    assert "Urgency & Coercion" in res["threat_categories"]
    assert "Financial / Wire Fraud" in res["threat_categories"]

def test_auth_validator_dmarc_fail():
    auth_res = AuthValidator.validate_auth(
        from_addr="spoofed@paypal.com",
        from_display_name="PayPal Support",
        reply_to="attacker@gmail.com",
        return_path="evil@attacker.ru",
        auth_results_raw="spf=fail; dmarc=fail (p=reject)",
        all_headers=[]
    )
    assert auth_res["dmarc_status"] == "fail"
    assert auth_res["return_path_aligned"] is False
    assert auth_res["reply_to_mismatch"] is True
    assert auth_res["auth_risk_penalty"] >= 30
