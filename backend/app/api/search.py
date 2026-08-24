from typing import List, Dict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.db.session import get_db
from backend.app.db.models import Email, Domain, IP, EmailUrl, Attachment, ForensicCase, Campaign
from backend.app.db.schemas import UnifiedSearchResult, SearchItem

router = APIRouter()

@router.get("", response_model=UnifiedSearchResult)
@router.get("/unified", response_model=UnifiedSearchResult)
def universal_search(
    q: str = Query(..., min_length=1, description="Search query term across all forensics telemetry"),
    db: Session = Depends(get_db)
):
    """
    Universal database cross-table search across Emails, Senders, Subjects,
    Domains, IPs, URLs, SHA-256 Hashes, Cases, and Campaigns.
    """
    term = q.strip()
    like_term = f"%{term}%"
    results: List[SearchItem] = []
    category_counts: Dict[str, int] = {
        "emails": 0,
        "domains": 0,
        "ips": 0,
        "urls": 0,
        "attachments": 0,
        "cases": 0,
        "campaigns": 0
    }

    # 1. Emails (subject, sender, recipient, sha256)
    emails = (
        db.query(Email)
        .filter(
            or_(
                Email.subject.ilike(like_term),
                Email.from_addr.ilike(like_term),
                Email.to_addr.ilike(like_term),
                Email.sha256.ilike(like_term)
            )
        )
        .limit(10)
        .all()
    )
    for em in emails:
        category_counts["emails"] += 1
        results.append(
            SearchItem(
                id=em.id,
                type="email",
                title=em.subject or "Untitled Email",
                subtitle=f"From: {em.from_addr} • To: {em.to_addr}",
                risk_score=em.risk_score,
                severity=em.severity,
                link=f"/analyze?id={em.id}",
                metadata={"sha256": em.sha256, "classification": em.classification}
            )
        )

    # 2. Domains (domain name, brand)
    domains = (
        db.query(Domain)
        .filter(
            or_(
                Domain.domain.ilike(like_term),
                Domain.impersonated_brand.ilike(like_term)
            )
        )
        .limit(10)
        .all()
    )
    for d in domains:
        category_counts["domains"] += 1
        results.append(
            SearchItem(
                id=d.id,
                type="domain",
                title=d.domain,
                subtitle=f"Impersonating: {d.impersonated_brand or 'N/A'} • Registrar: {d.registrar or 'Privacy'}",
                risk_score=d.risk_score,
                severity="CRITICAL" if d.risk_score > 75 else ("HIGH" if d.risk_score > 40 else "CLEAN"),
                link=f"/threat-intel?q={d.domain}",
                metadata={"is_lookalike": d.is_lookalike, "age_days": d.age_days}
            )
        )

    # 3. IPs (ip address, ASN, ASN Org)
    ips = (
        db.query(IP)
        .filter(
            or_(
                IP.ip.ilike(like_term),
                IP.asn.ilike(like_term),
                IP.asn_org.ilike(like_term),
                IP.country.ilike(like_term)
            )
        )
        .limit(10)
        .all()
    )
    for ip_obj in ips:
        category_counts["ips"] += 1
        results.append(
            SearchItem(
                id=ip_obj.id,
                type="ip",
                title=ip_obj.ip,
                subtitle=f"{ip_obj.asn} {ip_obj.asn_org or ''} • {ip_obj.city or ''}, {ip_obj.country or 'Unknown'}",
                risk_score=ip_obj.risk_score,
                severity="CRITICAL" if ip_obj.risk_score > 75 else ("HIGH" if ip_obj.risk_score > 40 else "CLEAN"),
                link=f"/threat-intel?q={ip_obj.ip}",
                metadata={"country": ip_obj.country, "attribution_confidence": ip_obj.attribution_confidence}
            )
        )

    # 4. URLs
    urls = (
        db.query(EmailUrl)
        .filter(
            or_(
                EmailUrl.original_url.ilike(like_term),
                EmailUrl.domain.ilike(like_term)
            )
        )
        .limit(10)
        .all()
    )
    for u in urls:
        category_counts["urls"] += 1
        results.append(
            SearchItem(
                id=u.id,
                type="url",
                title=u.original_url[:60] + ("..." if len(u.original_url) > 60 else ""),
                subtitle=f"Domain: {u.domain} • Resolved IP: {u.resolved_ip or 'N/A'}",
                risk_score=u.risk_score,
                severity="CRITICAL" if u.risk_score > 75 else ("HIGH" if u.risk_score > 40 else "CLEAN"),
                link=f"/analyze?id={u.email_id}&tab=correlate",
                metadata={"original_url": u.original_url, "email_id": u.email_id}
            )
        )

    # 5. Attachments
    attachments = (
        db.query(Attachment)
        .filter(
            or_(
                Attachment.filename.ilike(like_term),
                Attachment.sha256.ilike(like_term),
                Attachment.threat_name.ilike(like_term)
            )
        )
        .limit(10)
        .all()
    )
    for att in attachments:
        category_counts["attachments"] += 1
        results.append(
            SearchItem(
                id=att.id,
                type="attachment",
                title=att.filename,
                subtitle=f"SHA-256: {att.sha256[:16]}... • Threat: {att.threat_name or 'None'}",
                risk_score=95 if att.is_malicious else 10,
                severity="CRITICAL" if att.is_malicious else "CLEAN",
                link=f"/analyze?id={att.email_id}",
                metadata={"sha256": att.sha256, "email_id": att.email_id}
            )
        )

    # 6. Cases
    cases = (
        db.query(ForensicCase)
        .filter(
            or_(
                ForensicCase.case_number.ilike(like_term),
                ForensicCase.title.ilike(like_term)
            )
        )
        .limit(10)
        .all()
    )
    for c in cases:
        category_counts["cases"] += 1
        results.append(
            SearchItem(
                id=c.id,
                type="case",
                title=f"{c.case_number}: {c.title}",
                subtitle=f"Status: {c.status} • Lead: {c.investigator_name or 'Analyst'}",
                risk_score=80 if c.severity == "CRITICAL" else 50,
                severity=c.severity,
                link="/cases",
                metadata={"case_number": c.case_number, "status": c.status}
            )
        )

    # 7. Campaigns
    campaigns = (
        db.query(Campaign)
        .filter(
            or_(
                Campaign.name.ilike(like_term),
                Campaign.description.ilike(like_term)
            )
        )
        .limit(10)
        .all()
    )
    for camp in campaigns:
        category_counts["campaigns"] += 1
        results.append(
            SearchItem(
                id=camp.id,
                type="campaign",
                title=camp.name,
                subtitle=f"Type: {camp.primary_threat_type} • Confidence: {camp.confidence}%",
                risk_score=camp.confidence,
                severity="CRITICAL",
                link="/campaigns",
                metadata={"confidence": camp.confidence, "primary_threat_type": camp.primary_threat_type}
            )
        )

    return UnifiedSearchResult(
        query=term,
        total_count=len(results),
        results=results,
        categories=category_counts
    )
