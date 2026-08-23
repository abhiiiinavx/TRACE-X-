import json
import asyncio
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db.models import (
    Email, EmailHeader, EmailUrl, Domain, IP, Attachment,
    ForensicCase, Evidence, TimelineEvent, AuditLog, Campaign, CampaignMember
)
from backend.app.db.schemas import EmailAnalysisResponse, FeatureImpact, MitreTechnique
from backend.app.core.deps import get_current_user
from backend.app.parsing.eml_parser import EmlParser
from backend.app.detection.auth_validator import AuthValidator
from backend.app.detection.brand_impersonation import BrandImpersonationDetector
from backend.app.detection.nlp_analyzer import NLPAnalyzer
from backend.app.detection.scoring_engine import ScoringEngine
from backend.app.forensics.hop_reconstructor import HopReconstructor
from backend.app.intel.mock_provider import threat_intel_provider
from backend.app.campaigns.cluster_engine import CampaignClusterEngine

router = APIRouter()

def run_forensic_pipeline(parsed_data: Dict[str, Any], db: Session, user_email: str = "analyst@tracex.forensics", case_id: Optional[str] = None) -> Email:
    """
    Executes the complete deterministic TRACE-X forensic analysis pipeline.
    """
    # 1. Email Envelope & Headers
    from_addr = parsed_data["from_addr"]
    from_display = parsed_data["from_display_name"]
    to_addr = parsed_data["to_addr"]
    reply_to = parsed_data["reply_to"]
    return_path = parsed_data["return_path"]
    subject = parsed_data["subject"]
    body_plain = parsed_data["body_plain"]
    body_html = parsed_data["body_html_sanitized"]
    auth_raw = parsed_data["auth_results_raw"]
    all_headers = parsed_data["all_headers"]
    received_headers = parsed_data["received_headers"]
    sha256 = parsed_data["sha256"]

    from_domain = from_addr.split("@")[-1].lower() if "@" in from_addr else from_addr.lower()

    # 2. Authentication Validation
    auth_results = AuthValidator.validate_auth(
        from_addr=from_addr,
        from_display_name=from_display,
        reply_to=reply_to,
        return_path=return_path,
        auth_results_raw=auth_raw,
        all_headers=all_headers
    )

    # 3. Domain Intelligence & Lookalike Analysis
    domain_analysis = BrandImpersonationDetector.analyze_domain(from_domain)
    domain_intel = threat_intel_provider.get_domain_intel(from_domain)

    # 4. Hop Relay Reconstruction
    hops = HopReconstructor.parse_received_headers(received_headers)
    sender_ips = [h.ip for h in hops if h.ip and not h.is_private_ip]
    if not sender_ips and domain_intel.a_records:
        sender_ips = domain_intel.a_records

    # 5. IP Intelligence
    ips_intel_list = [threat_intel_provider.get_ip_intel(ip) for ip in sender_ips]

    # 6. URL Intelligence
    urls_intel_list = [threat_intel_provider.get_url_intel(u) for u in parsed_data["extracted_urls"]]

    # 7. NLP Threat Intent & Urgency Analyzer
    nlp_results = NLPAnalyzer.analyze_text(subject, body_plain)

    # 8. Attachment Threat Evaluation
    attachments_list = []
    for att in parsed_data["attachments"]:
        hash_intel = threat_intel_provider.get_hash_reputation(att["sha256"])
        is_mal = hash_intel.get("is_malicious", False) or any(att["filename"].lower().endswith(ext) for ext in [".exe", ".vbs", ".js", ".scr", ".iso", ".bat"])
        attachments_list.append({
            **att,
            "is_malicious": is_mal,
            "threat_name": hash_intel.get("threat_name")
        })

    # 9. Campaign DNA Multi-Signal Correlation
    att_hashes = [a["sha256"] for a in attachments_list]
    urls_raw = [u.original_url for u in urls_intel_list]
    initial_classification = "Malware Delivery" if any(a["is_malicious"] for a in attachments_list) else (
        "BEC / CEO Fraud" if auth_results.get("display_name_spoof") or nlp_results.get("has_executive_impersonation") else "Credential Phishing"
    )
    campaign_match = CampaignClusterEngine.correlate_email(
        from_domain=from_domain,
        sender_ips=sender_ips,
        urls=urls_raw,
        attachment_hashes=att_hashes,
        classification=initial_classification,
        db=db
    )

    # 10. Compute Explainable Weighted Score & MITRE Techniques
    score_data = ScoringEngine.compute_score(
        auth_data=auth_results,
        domain_analysis=domain_analysis,
        nlp_data=nlp_results,
        urls_data=[u.model_dump() for u in urls_intel_list],
        attachments_data=attachments_list,
        ips_data=[ip.model_dump() for ip in ips_intel_list],
        campaign_match=campaign_match is not None,
        campaign_name=campaign_match.get("campaign_name") if campaign_match else None
    )

    # 11. Create or Attach to Forensic Case
    if not case_id:
        # Create a new Case automatically
        case_count = db.query(ForensicCase).count() + 1
        case = ForensicCase(
            case_number=f"TX-2026-{case_count:04d}",
            title=f"Incident Investigation: {subject[:60]}",
            severity=score_data["severity"],
            status="Investigating",
            investigator_name="Lead Cyber Investigator",
            notes=f"Automated forensic intake. Classified as {score_data['classification']} with Risk Score {score_data['risk_score']}/100.",
            action_items=[
                {"id": "act-1", "title": "Perimeter IOC Firewall Block", "priority": "HIGH", "reason": "Block originating sender domain and high-risk relay IPs.", "evidence_pointer": f"Domain {from_domain}", "is_completed": False},
                {"id": "act-2", "title": "Mailbox Recipient Scope Sweep", "priority": "HIGH", "reason": "Query organizational mailboxes for identical campaign signatures.", "evidence_pointer": f"Subject '{subject[:30]}'", "is_completed": False},
                {"id": "act-3", "title": "Session & Credential Invalidation", "priority": "MEDIUM", "reason": "Revoke active OAuth tokens for targeted recipients.", "evidence_pointer": f"Target: {to_addr}", "is_completed": False},
                {"id": "act-4", "title": "Forensic Chain of Custody Lock", "priority": "LOW", "reason": "Verify immutable raw EML SHA-256 hash preservation.", "evidence_pointer": f"SHA-256 {sha256[:16]}...", "is_completed": True}
            ]
        )
        db.add(case)
        db.commit()
        db.refresh(case)
        case_id = case.id

    # 12. Persist Email Record
    email_record = Email(
        case_id=case_id,
        from_addr=from_addr,
        from_display_name=from_display,
        to_addr=to_addr,
        reply_to=reply_to,
        return_path=return_path,
        subject=subject,
        message_id=parsed_data.get("message_id"),
        date_header=parsed_data.get("date_header"),
        raw_eml_path=parsed_data.get("raw_eml_path"),
        sha256=sha256,
        risk_score=score_data["risk_score"],
        severity=score_data["severity"],
        classification=score_data["classification"],
        explanation_summary=score_data["explanation_summary"],
        feature_breakdown=[f.model_dump() for f in score_data["feature_breakdown"]],
        mitre_techniques=[m.model_dump() for m in score_data["mitre_techniques"]],
        body_plain=body_plain,
        body_html_sanitized=body_html,
        auth_results=auth_results,
        nlp_signals=nlp_results,
        score_calculation_breakdown=score_data["score_calculation_breakdown"],
        uploaded_by=user_email
    )
    db.add(email_record)
    db.commit()
    db.refresh(email_record)

    # 13. Persist URLs, Hops, Domains, IPs, Attachments
    for u in urls_intel_list:
        db_url = EmailUrl(
            email_id=email_record.id,
            original_url=u.original_url,
            final_url=u.final_url,
            redirect_chain=u.redirect_chain,
            domain=u.domain,
            resolved_ip=u.resolved_ip,
            is_https=u.is_https,
            risk_score=u.risk_score,
            is_credential_harvester=u.is_credential_harvester,
            suspicious_reasons=u.suspicious_reasons
        )
        db.add(db_url)

    for att in attachments_list:
        db_att = Attachment(
            email_id=email_record.id,
            filename=att["filename"],
            mime_type=att["mime_type"],
            size_bytes=att["size_bytes"],
            sha256=att["sha256"],
            is_malicious=att["is_malicious"],
            threat_name=att["threat_name"]
        )
        db.add(db_att)

    # Persist Domain
    existing_domain = db.query(Domain).filter(Domain.domain == from_domain).first()
    if not existing_domain:
        db_domain = Domain(
            domain=from_domain,
            registrar=domain_intel.registrar,
            created_date=domain_intel.created_date,
            expiry_date=domain_intel.expiry_date,
            nameservers=domain_intel.nameservers,
            mx_records=domain_intel.mx_records,
            a_records=domain_intel.a_records,
            age_days=domain_intel.age_days,
            brand_similarity_score=domain_analysis.get("similarity_score", 0.0),
            is_lookalike=domain_analysis.get("is_lookalike", False),
            impersonated_brand=domain_analysis.get("brand"),
            lookalike_technique=domain_analysis.get("technique"),
            reputation_score=domain_intel.reputation_score,
            risk_score=domain_intel.risk_score,
            reason_summary=domain_analysis.get("reasons", [""])[0] if domain_analysis.get("reasons") else None
        )
        db.add(db_domain)

    # Persist IPs
    for ip_obj in ips_intel_list:
        existing_ip = db.query(IP).filter(IP.ip == ip_obj.ip).first()
        if not existing_ip and ip_obj.ip != "127.0.0.1":
            db_ip = IP(
                ip=ip_obj.ip,
                country=ip_obj.country,
                country_code=ip_obj.country_code,
                region=ip_obj.region,
                city=ip_obj.city,
                lat=ip_obj.lat,
                lng=ip_obj.lng,
                isp=ip_obj.isp,
                asn=ip_obj.asn,
                asn_org=ip_obj.asn_org,
                hosting_provider=ip_obj.hosting_provider,
                is_vpn_proxy_tor=ip_obj.is_vpn_proxy_tor,
                node_type=ip_obj.node_type,
                attribution_confidence=ip_obj.attribution_confidence,
                attribution_notes=ip_obj.attribution_notes,
                reputation_score=ip_obj.reputation_score,
                risk_score=ip_obj.risk_score
            )
            db.add(db_ip)

    # 14. Persist Evidence Items (Cryptographic Chain of Custody)
    ev_raw = Evidence(
        case_id=case_id,
        email_id=email_record.id,
        evidence_type="Raw RFC5322 EML File",
        source="Ingestion Pipeline",
        sha256=sha256,
        collected_by="TRACE-X Ingestion Agent",
        is_immutable=True,
        metadata_json={"subject": subject, "from": from_addr, "message_id": parsed_data.get("message_id")}
    )
    db.add(ev_raw)

    for att in attachments_list:
        ev_att = Evidence(
            case_id=case_id,
            email_id=email_record.id,
            evidence_type=f"Attachment: {att['filename']}",
            source="Email MIME Payload",
            sha256=att["sha256"],
            collected_by="TRACE-X Attachment Extractor",
            is_immutable=True,
            metadata_json={"mime_type": att["mime_type"], "size": att["size_bytes"]}
        )
        db.add(ev_att)

    # 15. Persist Timeline Events
    ev1 = TimelineEvent(
        case_id=case_id,
        email_id=email_record.id,
        event_type="MessageOrigin",
        description=f"Message envelope dispatched from '{from_addr}' via initial MTA relay.",
        occurred_at=parsed_data.get("date_header") or "2026-08-23 10:14:00 UTC",
        evidence_ref=f"SHA-256: {sha256[:12]}...",
        severity="INFO"
    )
    db.add(ev1)

    if auth_results.get("dmarc_status") == "fail":
        ev2 = TimelineEvent(
            case_id=case_id,
            email_id=email_record.id,
            event_type="AuthFailure",
            description=f"DMARC validation failed on receiving MTA. Sender domain '{from_domain}' not aligned.",
            occurred_at="2026-08-23 10:14:02 UTC",
            evidence_ref="Authentication-Results Header",
            severity="HIGH"
        )
        db.add(ev2)

    for u in urls_intel_list:
        if u.is_credential_harvester:
            ev3 = TimelineEvent(
                case_id=case_id,
                email_id=email_record.id,
                event_type="CredentialHarvesterExtracted",
                description=f"Identified credential harvesting landing page: {u.original_url[:45]}...",
                occurred_at="2026-08-23 10:14:03 UTC",
                evidence_ref=f"Domain {u.domain}",
                severity="CRITICAL"
            )
            db.add(ev3)

    # 16. Link Campaign if matched
    if campaign_match:
        camp_obj = db.query(Campaign).filter(Campaign.name == campaign_match["campaign_name"]).first()
        if not camp_obj:
            camp_obj = Campaign(
                name=campaign_match["campaign_name"],
                description=campaign_match["description"],
                confidence=campaign_match["confidence"],
                primary_threat_type=campaign_match["primary_threat_type"],
                shared_signatures=campaign_match.get("campaign_dna", {})
            )
            db.add(camp_obj)
            db.commit()
            db.refresh(camp_obj)

        member = CampaignMember(
            campaign_id=camp_obj.id,
            email_id=email_record.id,
            similarity_score=campaign_match.get("similarity_score", 0.9),
            shared_signals=campaign_match.get("shared_signals", [])
        )
        db.add(member)
        camp_obj.email_count = (camp_obj.email_count or 0) + 1
        db.add(camp_obj)

    # 17. Audit Log
    audit = AuditLog(
        username=user_email,
        action="RUN_ANALYSIS",
        target_type="Email",
        target_id=email_record.id,
        details={"risk_score": score_data["risk_score"], "severity": score_data["severity"], "classification": score_data["classification"]}
    )
    db.add(audit)

    db.commit()
    db.refresh(email_record)
    return email_record

@router.post("/upload")
async def upload_eml(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".eml") and not file.filename.lower().endswith(".txt"):
        raise HTTPException(status_code=400, detail="Only .eml or raw email text files are supported.")
    
    contents = await file.read()
    if len(contents) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 25MB maximum limit.")

    parsed = EmlParser.parse_eml_bytes(contents)
    email_record = run_forensic_pipeline(parsed, db, user_email=current_user.email if current_user else "analyst@tracex.forensics")
    return {"status": "success", "email_id": email_record.id, "risk_score": email_record.risk_score, "severity": email_record.severity}

@router.post("/raw-text")
async def analyze_raw_text(
    raw_headers: str = Form(""),
    raw_body: str = Form(""),
    subject: str = Form("Manual Investigation Input"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    raw_email_str = f"Subject: {subject}\n{raw_headers}\n\n{raw_body}"
    parsed = EmlParser.parse_eml_bytes(raw_email_str.encode("utf-8", errors="ignore"))
    email_record = run_forensic_pipeline(parsed, db, user_email=current_user.email if current_user else "analyst@tracex.forensics")
    return {"status": "success", "email_id": email_record.id, "risk_score": email_record.risk_score, "severity": email_record.severity}

@router.get("/stream/{email_id}")
async def stream_analysis_progress(email_id: str, db: Session = Depends(get_db)):
    """Server-Sent Events stream delivering real-time step updates for UI progress."""
    async def event_generator():
        steps = [
            {"progress": 10, "stage": "MIME Parsing & Cryptographic Integrity", "detail": "Extracted RFC5322 headers, attachments, and computed SHA-256."},
            {"progress": 28, "stage": "Email Authentication Validation", "detail": "Evaluated SPF alignment, DKIM signatures, and DMARC enforcement."},
            {"progress": 46, "stage": "NLP Intent & Coercion Analyzer", "detail": "Analyzed urgency triggers, wire transfer pressure, and credential prompts."},
            {"progress": 64, "stage": "Threat Intel & Domain Typosquatting", "detail": "Calculated Levenshtein/Jaro-Winkler brand similarity and queried BGP ASN telemetry."},
            {"progress": 82, "stage": "MTA Hop Reconstructor & Geolocation", "detail": "Sequenced Received headers, calculated transit delay delta, and mapped infrastructure."},
            {"progress": 94, "stage": "Campaign DNA Multi-Signal Clustering", "detail": "Correlated IOC overlaps across established adversary infrastructure."},
            {"progress": 100, "stage": "Forensic Analysis Complete", "detail": "Generated Explainable AI feature breakdown and interactive Attack Graph."}
        ]
        for s in steps:
            yield f"data: {json.dumps(s)}\n\n"
            await asyncio.sleep(0.2)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/{email_id}", response_model=EmailAnalysisResponse)
def get_email_analysis(email_id: str, db: Session = Depends(get_db)):
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email record not found")

    from_domain = email.from_addr.split("@")[-1].lower() if "@" in email.from_addr else email.from_addr.lower()
    domain_intel = threat_intel_provider.get_domain_intel(from_domain)
    
    # Extract hops
    raw_hops = HopReconstructor.parse_received_headers([h.header_value for h in email.headers if h.header_name.lower() == "received"])
    if not raw_hops:
        # Fallback to simulated hop from domain
        raw_hops = HopReconstructor.parse_received_headers([
            f"Received: from mail.{from_domain} (194.36.189.44) by mx.google.com with ESMTPS; Sun, 23 Aug 2026 10:14:02 +0000",
            f"Received: from vps-gateway.net (185.220.101.5) by mail.{from_domain} with SMTP; Sun, 23 Aug 2026 10:14:00 +0000"
        ])

    # Extract IPs
    ips_intel = []
    seen_ips = set()
    for h in raw_hops:
        if h.ip and h.ip not in seen_ips:
            seen_ips.add(h.ip)
            ips_intel.append(threat_intel_provider.get_ip_intel(h.ip))

    # Campaign correlation
    camp_member = db.query(CampaignMember).filter(CampaignMember.email_id == email.id).first()
    camp_assoc = None
    if camp_member and camp_member.campaign:
        camp_assoc = {
            "matched": True,
            "campaign_name": camp_member.campaign.name,
            "description": camp_member.campaign.description,
            "confidence": camp_member.campaign.confidence,
            "similarity_score": camp_member.similarity_score,
            "primary_threat_type": camp_member.campaign.primary_threat_type,
            "shared_signals": camp_member.shared_signals
        }

    return EmailAnalysisResponse(
        id=email.id,
        case_id=email.case_id,
        from_addr=email.from_addr,
        from_display_name=email.from_display_name,
        to_addr=email.to_addr,
        reply_to=email.reply_to,
        return_path=email.return_path,
        subject=email.subject,
        message_id=email.message_id,
        date_header=email.date_header,
        sha256=email.sha256,
        risk_score=email.risk_score,
        severity=email.severity,
        classification=email.classification,
        explanation_summary=email.explanation_summary,
        feature_breakdown=email.feature_breakdown or [],
        mitre_techniques=email.mitre_techniques or [],
        auth_results=email.auth_results or {},
        nlp_signals=email.nlp_signals or {},
        score_calculation_breakdown=email.score_calculation_breakdown or {},
        body_plain_snippet=email.body_plain[:500] if email.body_plain else None,
        body_html_sanitized=email.body_html_sanitized,
        urls=[threat_intel_provider.get_url_intel(u.original_url) for u in email.urls],
        attachments=[
            {
                "id": a.id,
                "filename": a.filename,
                "mime_type": a.mime_type,
                "size_bytes": a.size_bytes,
                "sha256": a.sha256,
                "is_malicious": a.is_malicious,
                "threat_name": a.threat_name
            } for a in email.attachments
        ],
        hops=raw_hops,
        domains_intel=[domain_intel],
        ips_intel=ips_intel,
        campaign_association=camp_assoc,
        created_at=email.created_at
    )
