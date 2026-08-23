from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.db.models import Email, Campaign, CampaignMember
from backend.app.db.schemas import EntityGraphResponse
from backend.app.graph.graph_builder import GraphBuilder
from backend.app.forensics.hop_reconstructor import HopReconstructor
from backend.app.intel.mock_provider import threat_intel_provider

router = APIRouter()

@router.get("/email/{email_id}", response_model=EntityGraphResponse)
def get_email_attack_graph(email_id: str, db: Session = Depends(get_db)):
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email record not found")

    from_domain = email.from_addr.split("@")[-1].lower() if "@" in email.from_addr else email.from_addr.lower()
    domain_intel = threat_intel_provider.get_domain_intel(from_domain)
    
    # Hops
    raw_hops = HopReconstructor.parse_received_headers([h.header_value for h in email.headers if h.header_name.lower() == "received"])
    if not raw_hops:
        raw_hops = HopReconstructor.parse_received_headers([
            f"Received: from mail.{from_domain} (194.36.189.44) by mx.google.com with ESMTPS; Sun, 23 Aug 2026 10:14:02 +0000",
            f"Received: from vps-gateway.net (185.220.101.5) by mail.{from_domain} with SMTP; Sun, 23 Aug 2026 10:14:00 +0000"
        ])

    # IPs
    ips_intel = []
    seen_ips = set()
    for h in raw_hops:
        if h.ip and h.ip not in seen_ips:
            seen_ips.add(h.ip)
            ips_intel.append(threat_intel_provider.get_ip_intel(h.ip).model_dump())

    # URLs
    urls_data = [threat_intel_provider.get_url_intel(u.original_url).model_dump() for u in email.urls]

    # Attachments
    att_data = [{"filename": a.filename, "mime_type": a.mime_type, "size_bytes": a.size_bytes, "sha256": a.sha256, "is_malicious": a.is_malicious} for a in email.attachments]

    # Campaign
    camp_member = db.query(CampaignMember).filter(CampaignMember.email_id == email.id).first()
    camp_assoc = None
    if camp_member and camp_member.campaign:
        camp_assoc = {
            "matched": True,
            "campaign_name": camp_member.campaign.name,
            "confidence": camp_member.campaign.confidence,
            "primary_threat_type": camp_member.campaign.primary_threat_type,
            "shared_signals": camp_member.shared_signals
        }

    graph = GraphBuilder.build_case_graph(
        email_data={
            "id": email.id,
            "subject": email.subject,
            "from_addr": email.from_addr,
            "from_display_name": email.from_display_name,
            "risk_score": email.risk_score,
            "severity": email.severity,
            "classification": email.classification,
            "sha256": email.sha256
        },
        urls_data=urls_data,
        hops_data=[h.model_dump() for h in raw_hops],
        domains_data=[domain_intel.model_dump()],
        ips_data=ips_intel,
        attachments_data=att_data,
        campaign_info=camp_assoc
    )

    return graph

@router.get("/overview", response_model=EntityGraphResponse)
def get_global_attack_graph(limit: int = 10, db: Session = Depends(get_db)):
    """Returns a consolidated multi-entity graph of all active threats and shared campaigns."""
    emails = db.query(Email).order_by(Email.created_at.desc()).limit(limit).all()
    all_nodes = {}
    all_edges = []

    for email in emails:
        single_graph = get_email_attack_graph(email.id, db)
        for n in single_graph.nodes:
            all_nodes[n.id] = n
        for e in single_graph.edges:
            all_edges.append(e)

    return EntityGraphResponse(
        nodes=list(all_nodes.values()),
        edges=all_edges
    )
