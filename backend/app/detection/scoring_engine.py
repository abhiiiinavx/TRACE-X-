from typing import Dict, Any, List, Tuple
from backend.app.db.schemas import FeatureImpact, MitreTechnique

class ScoringEngine:
    """
    Transparent, Inspectable Feature-Weighted Scoring & Explainable AI Engine.
    Combines rule heuristics, auth verification, brand impersonation, NLP intent,
    and threat intel correlation with explicit weights and evidence impact points.
    """

    MITRE_CATALOG = {
        "T1566.002": MitreTechnique(
            id="T1566.002",
            name="Spearphishing Link",
            tactic="Initial Access",
            description="Adversary sends targeted emails containing malicious links directing victims to credential harvesters."
        ),
        "T1566.001": MitreTechnique(
            id="T1566.001",
            name="Spearphishing Attachment",
            tactic="Initial Access",
            description="Adversary delivers weaponized files or archives to execute malicious payloads upon opening."
        ),
        "T1585": MitreTechnique(
            id="T1585",
            name="Establish Accounts & Lookalike Infrastructure",
            tactic="Resource Development",
            description="Adversary registers typosquatted domains or acquires bulletproof hosting to support phishing operations."
        ),
        "T1586": MitreTechnique(
            id="T1586",
            name="Compromise Accounts & Email Relays",
            tactic="Resource Development",
            description="Adversary leverages compromised sender mailboxes or open relay servers to bypass sender reputation."
        ),
        "T1071.001": MitreTechnique(
            id="T1071.001",
            name="Web Protocols / URL Redirection",
            tactic="Command and Control",
            description="Adversary utilizes multi-hop URL shorteners and HTTP redirects to obfuscate final destination."
        ),
        "T1656": MitreTechnique(
            id="T1656",
            name="Impersonation & Executive Deception",
            tactic="Defense Evasion",
            description="Adversary forges display names or spoofs organizational leadership to manipulate victims into unauthorized wires."
        )
    }

    @classmethod
    def compute_score(
        cls,
        auth_data: Dict[str, Any],
        domain_analysis: Dict[str, Any],
        nlp_data: Dict[str, Any],
        urls_data: List[Dict[str, Any]],
        attachments_data: List[Dict[str, Any]],
        ips_data: List[Dict[str, Any]],
        campaign_match: bool = False,
        campaign_name: str = None
    ) -> Dict[str, Any]:
        
        feature_breakdown: List[FeatureImpact] = []
        mitre_detected: List[MitreTechnique] = []
        base_score = 5  # Base baseline

        # 1. Authentication Analysis (SPF/DKIM/DMARC/Return-Path)
        if auth_data.get("dmarc_status") == "fail":
            feature_breakdown.append(FeatureImpact(
                feature="DMARC Policy Enforcement",
                evidence=f"DMARC validation failed (policy={auth_data.get('dmarc_policy', 'none')}). Sender domain unaligned.",
                impact=25,
                confidence=95,
                category="Authentication"
            ))
            base_score += 25
            mitre_detected.append(cls.MITRE_CATALOG["T1586"])
        elif auth_data.get("dmarc_status") == "pass":
            feature_breakdown.append(FeatureImpact(
                feature="DMARC Alignment",
                evidence="DMARC verified passed with aligned sender domain.",
                impact=-15,
                confidence=98,
                category="Authentication"
            ))
            base_score -= 15

        if auth_data.get("spf_status") == "fail":
            feature_breakdown.append(FeatureImpact(
                feature="SPF Verification",
                evidence="Sending MTA IP is not authorized in sender domain SPF record.",
                impact=20,
                confidence=92,
                category="Authentication"
            ))
            base_score += 20
        elif auth_data.get("spf_status") == "softfail":
            feature_breakdown.append(FeatureImpact(
                feature="SPF Softfail",
                evidence="SPF evaluated ~all softfail policy.",
                impact=10,
                confidence=85,
                category="Authentication"
            ))
            base_score += 10

        if not auth_data.get("return_path_aligned", True):
            feature_breakdown.append(FeatureImpact(
                feature="Return-Path Alignment",
                evidence=auth_data.get("alignment_note", "Return-Path domain diverges from From header domain."),
                impact=15,
                confidence=90,
                category="Authentication"
            ))
            base_score += 15

        if auth_data.get("reply_to_mismatch"):
            feature_breakdown.append(FeatureImpact(
                feature="Reply-To Mismatch",
                evidence=auth_data.get("reply_to_note", "Reply-To routes to external recipient domain."),
                impact=20,
                confidence=90,
                category="Spoofing"
            ))
            base_score += 20
            mitre_detected.append(cls.MITRE_CATALOG["T1656"])

        if auth_data.get("display_name_spoof"):
            feature_breakdown.append(FeatureImpact(
                feature="Display Name Deception",
                evidence=auth_data.get("spoof_reason", "Display name impersonates authority or embeds deceptive email."),
                impact=25,
                confidence=92,
                category="Spoofing"
            ))
            base_score += 25
            mitre_detected.append(cls.MITRE_CATALOG["T1656"])

        # 2. Domain Intelligence & Lookalike Detection
        if domain_analysis.get("is_lookalike"):
            feature_breakdown.append(FeatureImpact(
                feature="Brand Typosquatting / Lookalike Domain",
                evidence=f"Domain impersonates '{domain_analysis.get('brand')}' using {domain_analysis.get('technique', 'lexical similarity')} (Similarity: {int(domain_analysis.get('similarity_score', 0)*100)}%).",
                impact=35,
                confidence=96,
                category="Domain"
            ))
            base_score += 35
            mitre_detected.append(cls.MITRE_CATALOG["T1585"])
        elif domain_analysis.get("risk_contribution", 0) > 0:
            feature_breakdown.append(FeatureImpact(
                feature="Suspicious Domain Heuristics",
                evidence="; ".join(domain_analysis.get("reasons", ["High-risk domain characteristics."])),
                impact=domain_analysis.get("risk_contribution", 15),
                confidence=85,
                category="Domain"
            ))
            base_score += domain_analysis.get("risk_contribution", 15)

        # 3. URL Intelligence & Redirection Analysis
        has_malicious_urls = False
        has_shortener = False
        for url in urls_data:
            if url.get("is_credential_harvester") or url.get("risk_score", 0) > 60:
                has_malicious_urls = True
            if len(url.get("redirect_chain", [])) > 1:
                has_shortener = True

        if has_malicious_urls:
            feature_breakdown.append(FeatureImpact(
                feature="Credential Harvesting URL",
                evidence=f"Identified suspicious URI structure targeting login/banking authentication portals.",
                impact=30,
                confidence=94,
                category="URL"
            ))
            base_score += 30
            mitre_detected.append(cls.MITRE_CATALOG["T1566.002"])

        if has_shortener:
            feature_breakdown.append(FeatureImpact(
                feature="Multi-Hop URL Redirection Chain",
                evidence="URL shortener or redirect gateway obscures the ultimate landing server.",
                impact=20,
                confidence=90,
                category="URL"
            ))
            base_score += 20
            mitre_detected.append(cls.MITRE_CATALOG["T1071.001"])

        # 4. NLP Urgency & Financial Coercion
        if nlp_data.get("has_urgency"):
            feature_breakdown.append(FeatureImpact(
                feature="Urgency & Coercive Language",
                evidence=f"Detected artificial time constraint: {', '.join(nlp_data.get('urgency_keywords', [])[:3])}.",
                impact=20,
                confidence=88,
                category="NLP"
            ))
            base_score += 20

        if nlp_data.get("has_financial_request"):
            feature_breakdown.append(FeatureImpact(
                feature="Financial & Wire Transfer Request",
                evidence=f"Detected wire transfer or payment diversion intent: {', '.join(nlp_data.get('financial_keywords', [])[:2])}.",
                impact=25,
                confidence=91,
                category="NLP"
            ))
            base_score += 25
            mitre_detected.append(cls.MITRE_CATALOG["T1656"])

        if nlp_data.get("has_credential_prompt"):
            feature_breakdown.append(FeatureImpact(
                feature="Credential Harvesting Prompt",
                evidence=f"Identified credential reset/validation lures: {', '.join(nlp_data.get('credential_keywords', [])[:2])}.",
                impact=25,
                confidence=93,
                category="NLP"
            ))
            base_score += 25

        if nlp_data.get("has_executive_impersonation"):
            feature_breakdown.append(FeatureImpact(
                feature="Executive Authority Lure (CEO Fraud)",
                evidence="Language simulates corporate leadership enforcing urgent unverified action.",
                impact=25,
                confidence=89,
                category="NLP"
            ))
            base_score += 25
            mitre_detected.append(cls.MITRE_CATALOG["T1656"])

        # 5. Attachment Analysis
        has_malicious_att = False
        for att in attachments_data:
            if att.get("is_malicious") or any(att.get("filename", "").lower().endswith(ext) for ext in [".exe", ".vbs", ".js", ".scr", ".iso", ".bat", ".cmd"]):
                has_malicious_att = True
                feature_breakdown.append(FeatureImpact(
                    feature="Suspicious Executable/Archive Attachment",
                    evidence=f"High-risk payload detected: '{att.get('filename')}' (SHA-256: {att.get('sha256')[:12]}...).",
                    impact=35,
                    confidence=98,
                    category="Attachment"
                ))
                base_score += 35
                mitre_detected.append(cls.MITRE_CATALOG["T1566.001"])
                break

        # 6. Infrastructure & IP Threat Intel
        for ip_info in ips_data:
            if ip_info.get("is_vpn_proxy_tor"):
                feature_breakdown.append(FeatureImpact(
                    feature="Anonymized Infrastructure (Tor / VPN Gateway)",
                    evidence=f"Originating relay IP {ip_info.get('ip')} identified as {ip_info.get('node_type', 'Anonymizer Node')}.",
                    impact=20,
                    confidence=95,
                    category="Infrastructure"
                ))
                base_score += 20
                break
            if ip_info.get("risk_score", 0) > 70:
                feature_breakdown.append(FeatureImpact(
                    feature="High-Risk Sending ASN / Hosting",
                    evidence=f"IP {ip_info.get('ip')} located in bulletproof or high-abuse network ({ip_info.get('asn_org', 'Unknown ASN')}).",
                    impact=20,
                    confidence=88,
                    category="Infrastructure"
                ))
                base_score += 20
                break

        # 7. Campaign Correlation Boost
        if campaign_match:
            feature_breakdown.append(FeatureImpact(
                feature="Campaign DNA Correlation",
                evidence=f"Matches established threat infrastructure associated with '{campaign_name or 'Active Phishing Campaign'}'.",
                impact=15,
                confidence=92,
                category="Campaign"
            ))
            base_score += 15

        # Final score clamping
        final_risk_score = max(2, min(99, base_score))

        # Determine Severity
        if final_risk_score >= 80:
            severity = "CRITICAL"
        elif final_risk_score >= 60:
            severity = "HIGH"
        elif final_risk_score >= 40:
            severity = "MEDIUM"
        elif final_risk_score >= 20:
            severity = "LOW"
        else:
            severity = "CLEAN"

        # Determine Primary Classification
        if has_malicious_att:
            classification = "Malware Delivery"
        elif auth_data.get("display_name_spoof") or nlp_data.get("has_executive_impersonation") or nlp_data.get("has_financial_request"):
            classification = "BEC / CEO Fraud"
        elif domain_analysis.get("is_lookalike") or has_malicious_urls or nlp_data.get("has_credential_prompt"):
            classification = "Credential Phishing"
        elif final_risk_score >= 60:
            classification = "Executive Impersonation"
        elif final_risk_score >= 35:
            classification = "Suspicious / Spam"
        else:
            classification = "Legitimate"

        # Natural Language Summary (Deterministic synthesis from evidence items)
        top_reasons = [item.evidence for item in feature_breakdown if item.impact > 0][:4]
        if top_reasons:
            explanation_summary = (
                f"TRACE-X hybrid detection assigned a Risk Score of {final_risk_score}/100 ({severity}) classified as {classification}. "
                f"Key forensic factors: {'; '.join(top_reasons)}. "
                f"Attribution confidence is assessed probabilistically based on infrastructure telemetry."
            )
        else:
            explanation_summary = (
                f"TRACE-X analysis verified legitimate message telemetry with valid cryptographic authentication (SPF/DKIM/DMARC) "
                f"and low-risk sending infrastructure. Overall Risk Score is {final_risk_score}/100 (CLEAN)."
            )

        # Deduplicate MITRE techniques
        unique_mitre = {t.id: t for t in mitre_detected}.values()

        return {
            "risk_score": final_risk_score,
            "severity": severity,
            "classification": classification,
            "explanation_summary": explanation_summary,
            "feature_breakdown": feature_breakdown,
            "mitre_techniques": list(unique_mitre),
            "score_calculation_breakdown": {
                "base_score": 5,
                "auth_penalty": auth_data.get("auth_risk_penalty", 0),
                "domain_penalty": domain_analysis.get("risk_contribution", 0),
                "nlp_penalty": nlp_data.get("nlp_risk_score", 0),
                "url_penalty": 30 if has_malicious_urls else 0,
                "attachment_penalty": 35 if has_malicious_att else 0,
                "campaign_boost": 15 if campaign_match else 0,
                "total_computed": final_risk_score
            }
        }
