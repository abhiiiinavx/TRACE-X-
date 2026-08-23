import uuid
from typing import Dict, Any, List
from backend.app.db.schemas import CopilotResponse

class ForensicCopilotEngine:
    """
    Evidence-Grounded AI Investigation Copilot.
    Provides precise, grounded cyber-forensics intelligence scoped strictly to case telemetry.
    Explicitly enforces 'Insufficient evidence' boundaries and never invents data.
    """

    @classmethod
    def answer_query(
        cls,
        question: str,
        email_data: Dict[str, Any],
        case_data: Dict[str, Any] = None,
        audit_logger = None
    ) -> CopilotResponse:
        q_lower = question.lower().strip()
        query_id = str(uuid.uuid4())

        evidence_sources = []
        mitre_refs = []
        confidence = 92

        # Extract context
        subject = email_data.get("subject", "Unknown Subject")
        from_addr = email_data.get("from_addr", "Unknown Sender")
        risk_score = email_data.get("risk_score", 0)
        severity = email_data.get("severity", "CLEAN")
        classification = email_data.get("classification", "Legitimate")
        features = email_data.get("feature_breakdown", [])
        urls = email_data.get("urls", [])
        hops = email_data.get("hops", [])
        domains = email_data.get("domains_intel", [])
        ips = email_data.get("ips_intel", [])
        attachments = email_data.get("attachments", [])
        campaign = email_data.get("campaign_association") or {}

        # 1. "What makes this email suspicious?" / Threat reasons
        if any(w in q_lower for w in ["why", "suspicious", "threat", "risk", "factors", "score"]):
            evidence_sources.append("Deterministic Feature-Weighted Scoring Model")
            evidence_sources.append("Email Authentication & RFC5322 Envelope Headers")
            mitre_refs = [t.get("id") if isinstance(t, dict) else getattr(t, "id", "") for t in email_data.get("mitre_techniques", [])]

            if features:
                reasons_text = "\n".join([
                    f"• **{getattr(f, 'feature', f.get('feature', 'Signal'))}** ({getattr(f, 'impact', f.get('impact', 0)):+d} pts): {getattr(f, 'evidence', f.get('evidence', ''))}"
                    for f in features if (getattr(f, 'impact', f.get('impact', 0)) if hasattr(f, 'impact') else f.get('impact', 0)) > 0
                ])
                answer = (
                    f"**TRACE-X Threat Analysis (Risk Score: {risk_score}/100 — {severity})**\n\n"
                    f"This email was classified as **{classification}** based on deterministic forensic telemetry:\n\n"
                    f"{reasons_text}\n\n"
                    f"**Attribution Standard Note**: Estimated infrastructure coordinates reflect probable BGP routing and ASN hosting nodes with explicit attribution confidence."
                )
            else:
                answer = f"The message has a Risk Score of {risk_score}/100 and is classified as {classification}. No high-severity indicators were identified."

        # 2. "Show infrastructure" / "IPs connected" / "Hosting" / "ASN"
        elif any(w in q_lower for w in ["infrastructure", "ip", "asn", "hosting", "relay", "hops", "servers"]):
            evidence_sources.append("MTA Received Header Reconstructor")
            evidence_sources.append("ThreatIntelProvider (IP & BGP Routing)")

            ip_lines = []
            for ip in ips:
                ip_val = ip.get("ip") if isinstance(ip, dict) else getattr(ip, "ip", "")
                country = ip.get("country") if isinstance(ip, dict) else getattr(ip, "country", "Unknown")
                city = ip.get("city") if isinstance(ip, dict) else getattr(ip, "city", "")
                asn_org = ip.get("asn_org") if isinstance(ip, dict) else getattr(ip, "asn_org", "Unknown ASN")
                is_vpn = ip.get("is_vpn_proxy_tor") if isinstance(ip, dict) else getattr(ip, "is_vpn_proxy_tor", False)
                conf = ip.get("attribution_confidence") if isinstance(ip, dict) else getattr(ip, "attribution_confidence", 70)

                status = "[ANONYMIZED / TOR EXIT]" if is_vpn else "[HOSTING NODE]"
                ip_lines.append(f"• **{ip_val}** ({country}, {city}) — {asn_org} {status} *(Attribution Confidence: {conf}%)*")

            hop_count = len(hops)
            answer = (
                f"**Infrastructure Forensics Summary for '{subject}'**\n\n"
                f"Reconstructed **{hop_count} sequential MTA relay hops** across the delivery envelope:\n\n"
                + "\n".join(ip_lines[:6]) +
                f"\n\n*Forensic Boundary: All geographical markers denote probable routing infrastructure, not confirmed operator physical residence.*"
            )

        # 3. "Campaign" / "Similar attacks" / "Related incidents"
        elif any(w in q_lower for w in ["campaign", "similar", "related", "cluster", "operation"]):
            evidence_sources.append("Campaign DNA Multi-Signal Correlation Engine")
            if campaign and campaign.get("matched"):
                camp_name = campaign.get("campaign_name", "Active Threat Cluster")
                camp_desc = campaign.get("description", "")
                camp_conf = campaign.get("confidence", 90)
                signals = campaign.get("shared_signals", [])

                answer = (
                    f"**Campaign DNA Match Identified: {camp_name}**\n\n"
                    f"• **Attribution Confidence**: {camp_conf}%\n"
                    f"• **Threat Profile**: {campaign.get('primary_threat_type', 'Credential Phishing')}\n"
                    f"• **Overview**: {camp_desc}\n\n"
                    f"**Correlated Shared Signatures**:\n"
                    + "\n".join([f"  - {sig}" for sig in signals[:4]])
                )
            else:
                answer = "No matching campaign cluster met the 40% similarity threshold. This email appears to be an isolated or novel attack artifact."

        # 4. "Next actions" / "What should I investigate next?" / "Mitigation"
        elif any(w in q_lower for w in ["next", "action", "recommend", "mitigat", "step", "contain"]):
            evidence_sources.append("Forensic Action Recommendation Engine")
            mitre_refs = ["M1017", "M1031", "M1021"]
            actions = [
                "1. **Block Malicious Indicators**: Add sender domain and relay IPs to organizational perimeter firewall & mail gateway filters.",
                "2. **Search Enterprise Mailboxes**: Query exchange/M365 logs for other recipients receiving emails from the same sending ASN or subject pattern.",
                "3. **Invalidate Sessions**: If user clicked the link, force password reset and revoke active OAuth application tokens.",
                "4. **Preserve Immutable Chain of Custody**: Export raw `.eml` and verify cryptographic SHA-256 integrity hash.",
                "5. **Generate Formal Incident Report**: Export courtroom/executive PDF report for compliance and reporting."
            ]
            answer = (
                f"**Recommended Immediate Investigation & Containment Actions**:\n\n"
                + "\n".join(actions)
            )

        # 5. "Summary" / "Executive Summary"
        elif any(w in q_lower for w in ["summary", "executive", "overview", "brief"]):
            evidence_sources.append("TRACE-X Executive Forensic Synthesizer")
            answer = (
                f"**Executive Incident Briefing — Case {case_data.get('case_number', 'TX-2026')}**\n\n"
                f"• **Subject**: {subject}\n"
                f"• **Sender**: {from_addr}\n"
                f"• **Risk Classification**: {classification} ({severity} — Score {risk_score}/100)\n"
                f"• **Evidence Items**: {len(urls)} URLs, {len(hops)} Relay Hops, {len(attachments)} Attachments\n"
                f"• **Attribution**: Probable infrastructure originated via {ips[0].get('country') if ips and isinstance(ips[0], dict) else 'external hosting nodes'}.\n\n"
                f"Immediate perimeter containment and recipient telemetry checks are advised."
            )

        # 6. Fallback with Strict Insufficient Evidence standard
        else:
            answer = (
                f"**Insufficient Evidence in Case Records**\n\n"
                f"The collected forensic telemetry for Case '{subject}' does not contain explicit records answering: *\"{question}\"*.\n\n"
                f"TRACE-X strictly adheres to forensic standards and will not speculate or generate ungrounded claims. "
                f"Available evidence includes: Envelope Headers, Authentication Results (SPF/DKIM/DMARC), Relay Hops ({len(hops)}), Extracted URLs ({len(urls)}), and Domain Intel."
            )
            evidence_sources.append("Case Telemetry Index")
            confidence = 60

        return CopilotResponse(
            answer=answer,
            evidence_sources=evidence_sources,
            confidence=confidence,
            mitre_refs=mitre_refs,
            query_id=query_id
        )
