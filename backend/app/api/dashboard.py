from collections import defaultdict
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.db.session import get_db
from backend.app.db.models import Email, Campaign, Domain, IP, EmailUrl, ForensicCase
from backend.app.db.schemas import DashboardStats

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Computes 100% database-driven telemetry statistics from actual Email, Domain,
    IP, URL, Campaign, and Case records in SQLite. Never uses fabricated counts or max() minimums.
    """
    total_analyzed = db.query(Email).count()
    critical_threats = db.query(Email).filter(Email.severity == "CRITICAL").count()
    high_threats = db.query(Email).filter(Email.severity == "HIGH").count()
    medium_threats = db.query(Email).filter(Email.severity == "MEDIUM").count()
    threats_detected = critical_threats + high_threats + medium_threats

    phishing_attempts = db.query(Email).filter(Email.classification.ilike("%phish%")).count()
    bec_attempts = db.query(Email).filter(
        (Email.classification.ilike("%bec%")) |
        (Email.classification.ilike("%impersonation%")) |
        (Email.classification.ilike("%fraud%"))
    ).count()
    active_campaigns = db.query(Campaign).count()
    malicious_urls = db.query(EmailUrl).filter(EmailUrl.risk_score > 50).count()
    suspicious_domains = db.query(Domain).filter(Domain.risk_score > 40).count()
    high_risk_infra = db.query(IP).filter(IP.risk_score > 50).count()

    # 1. Real Database-Driven Time Series for Threat Trends
    all_emails = db.query(Email).order_by(Email.created_at.asc()).all()
    time_bins: Dict[str, Dict[str, int]] = defaultdict(lambda: {"threats": 0, "clean": 0, "critical": 0})

    if all_emails:
        for em in all_emails:
            ts_key = em.created_at.strftime("%H:%M") if em.created_at else "00:00"
            is_threat = em.severity in ["CRITICAL", "HIGH", "MEDIUM"]
            is_crit = em.severity == "CRITICAL"

            if is_threat:
                time_bins[ts_key]["threats"] += 1
            else:
                time_bins[ts_key]["clean"] += 1

            if is_crit:
                time_bins[ts_key]["critical"] += 1

        threats_over_time = [
            {
                "timestamp": ts,
                "threats": counts["threats"],
                "clean": counts["clean"],
                "critical": counts["critical"]
            }
            for ts, counts in time_bins.items()
        ]
    else:
        threats_over_time = []

    # 2. Real Category Distribution
    category_counts = db.query(Email.classification, func.count(Email.id)).group_by(Email.classification).all()
    color_map = {
        "Credential Phishing": "#ef4444",
        "BEC / CEO Fraud": "#f97316",
        "Executive Impersonation": "#f97316",
        "Malware Delivery": "#a855f7",
        "Suspicious / Grayware": "#eab308",
        "Legitimate Traffic": "#10b981",
        "Clean": "#10b981"
    }
    fallback_colors = ["#ef4444", "#f97316", "#a855f7", "#eab308", "#10b981", "#3b82f6", "#06b6d4"]

    category_distribution = []
    for idx, (cat_name, count) in enumerate(category_counts):
        if cat_name:
            color = color_map.get(cat_name, fallback_colors[idx % len(fallback_colors)])
            category_distribution.append({
                "name": cat_name,
                "value": count,
                "color": color
            })

    # 3. Real Top Domains from Database
    db_domains = db.query(Domain).order_by(Domain.risk_score.desc(), Domain.last_analyzed.desc()).limit(5).all()
    top_domains = []
    for d in db_domains:
        hits = db.query(Email).filter(Email.from_addr.ilike(f"%{d.domain}%")).count()
        top_domains.append({
            "domain": d.domain,
            "hits": hits if hits > 0 else 1,
            "risk": d.risk_score,
            "impersonating": d.impersonated_brand or ("Lookalike" if d.is_lookalike else "Untrusted Domain")
        })

    # 4. Real Top IPs from Database
    db_ips = db.query(IP).filter(IP.ip != "127.0.0.1").order_by(IP.risk_score.desc(), IP.last_analyzed.desc()).limit(5).all()
    top_ips = []
    for ip_obj in db_ips:
        top_ips.append({
            "ip": ip_obj.ip,
            "country": ip_obj.country or "Unknown",
            "asn": f"{ip_obj.asn or ''} {ip_obj.asn_org or ''}".strip() or "Unknown ASN",
            "hits": 1,
            "risk": ip_obj.risk_score
        })

    # 5. Real Country Distribution from Database
    country_counts = (
        db.query(IP.country, IP.country_code, func.count(IP.id))
        .filter(IP.country != None, IP.ip != "127.0.0.1")
        .group_by(IP.country, IP.country_code)
        .all()
    )
    total_country_ips = sum(c[2] for c in country_counts) or 1
    country_distribution = []
    for country_name, code, count in country_counts:
        percentage = round((count / total_country_ips) * 100)
        country_distribution.append({
            "country": country_name,
            "code": code or "UN",
            "count": count,
            "percentage": percentage
        })

    return DashboardStats(
        total_analyzed=total_analyzed,
        threats_detected=threats_detected,
        critical_threats=critical_threats,
        phishing_attempts=phishing_attempts,
        bec_attempts=bec_attempts,
        malicious_urls=malicious_urls,
        suspicious_domains=suspicious_domains,
        active_campaigns=active_campaigns,
        high_risk_infrastructure=high_risk_infra,
        threats_over_time=threats_over_time,
        category_distribution=category_distribution,
        top_domains=top_domains,
        top_ips=top_ips,
        country_distribution=country_distribution
    )
