import re
from typing import Dict, Any, List

class NLPAnalyzer:
    """
    Heuristic & pattern-based NLP engine for threat intent classification.
    Evaluates urgency, financial wire pressure, credential harvesting, and executive impersonation.
    """

    URGENCY_PATTERNS = [
        r'\b(?:within|in)\s*(?:24|12|48|2)\s*hours\b',
        r'\bimmediate(?:ly)?\s+(?:action|attention|verification|response)\b',
        r'\baccount\s+(?:suspended|restricted|disabled|locked|terminated)\b',
        r'\bfinal\s+(?:notice|warning|reminder)\b',
        r'\baction\s+required\s+immediately\b',
        r'\bsecurity\s+breach\s+detected\b',
        r'\bunauthorized\s+(?:access|login|activity)\s+detected\b',
        r'\bavoid\s+(?:deactivation|cancellation|penalties)\b'
    ]

    FINANCIAL_BEC_PATTERNS = [
        r'\bwire\s+(?:transfer|funds|payment)\b',
        r'\bupdated?\s+bank(?:ing)?\s+(?:details|account|coordinates)\b',
        r'\bconfidential\s+(?:transaction|acquisition|matter)\b',
        r'\bswift\s+(?:code|transfer|remittance)\b',
        r'\bprocessed?\s+(?:an?\s+)?invoice\b',
        r'\bkindly\s+(?:send|transfer|remit|pay)\b',
        r'\bvendor\s+payment\s+overdue\b',
        r'\bchange\s+of\s+banking\s+information\b'
    ]

    CREDENTIAL_PHISH_PATTERNS = [
        r'\b(?:verify|confirm|validate|update)\s+your\s+(?:account|credentials|identity|password|login)\b',
        r'\bclick\s+(?:here|below|the\s+link)\s+to\s+(?:login|unlock|verify|authenticate)\b',
        r'\bpassword\s+expires?\s+(?:today|soon|within)\b',
        r'\bmailbox\s+(?:storage|quota)\s+(?:full|exceeded|exhausted)\b',
        r'\bre-?authenticate\s+your\s+session\b',
        r'\bkeep\s+same\s+password\b',
        r'\breset\s+password\s+immediately\b'
    ]

    EXECUTIVE_IMPERSONATION_PATTERNS = [
        r'\bi\s+am\s+(?:in\s+a\s+meeting|traveling|unavailable\s+by\s+phone)\b',
        r'\bdo\s+not\s+(?:call|contact)\s+my\s+(?:cell|phone|mobile)\b',
        r'\bhandle\s+this\s+(?:confidentially|discreetly|urgently)\b',
        r'\bare\s+you\s+at\s+your\s+desk\b',
        r'\bquick\s+task\s+for\s+you\b',
        r'\bi\s+need\s+you\s+to\s+handle\s+a\s+wire\b'
    ]

    MALWARE_LURE_PATTERNS = [
        r'\benable\s+(?:content|macros|editing)\s+to\s+view\b',
        r'\bpassword\s+for\s+(?:the\s+)?(?:zip|archive|attachment)\s+is\b',
        r'\bshipping\s+(?:manifest|tracking|document)\s+attached\b',
        r'\bpayment\s+remittance\s+advice\.pdf\b'
    ]

    @classmethod
    def analyze_text(cls, subject: str, body_text: str) -> Dict[str, Any]:
        combined_text = f"{subject or ''}\n{body_text or ''}".lower()

        urgency_matches = []
        for p in cls.URGENCY_PATTERNS:
            found = re.findall(p, combined_text, re.IGNORECASE)
            if found:
                urgency_matches.extend(found)

        financial_matches = []
        for p in cls.FINANCIAL_BEC_PATTERNS:
            found = re.findall(p, combined_text, re.IGNORECASE)
            if found:
                financial_matches.extend(found)

        credential_matches = []
        for p in cls.CREDENTIAL_PHISH_PATTERNS:
            found = re.findall(p, combined_text, re.IGNORECASE)
            if found:
                credential_matches.extend(found)

        executive_matches = []
        for p in cls.EXECUTIVE_IMPERSONATION_PATTERNS:
            found = re.findall(p, combined_text, re.IGNORECASE)
            if found:
                executive_matches.extend(found)

        malware_matches = []
        for p in cls.MALWARE_LURE_PATTERNS:
            found = re.findall(p, combined_text, re.IGNORECASE)
            if found:
                malware_matches.extend(found)

        # Threat classification logic
        threat_categories = []
        risk_points = 0

        if credential_matches:
            threat_categories.append("Credential Harvesting")
            risk_points += 30

        if financial_matches:
            threat_categories.append("Financial / Wire Fraud")
            risk_points += 25

        if urgency_matches:
            threat_categories.append("Urgency & Coercion")
            risk_points += 20

        if executive_matches:
            threat_categories.append("Executive Impersonation (BEC)")
            risk_points += 25

        if malware_matches:
            threat_categories.append("Malicious Lure / Payload Delivery")
            risk_points += 30

        detected_intents = {
            "has_urgency": len(urgency_matches) > 0,
            "has_financial_request": len(financial_matches) > 0,
            "has_credential_prompt": len(credential_matches) > 0,
            "has_executive_impersonation": len(executive_matches) > 0,
            "has_malware_lure": len(malware_matches) > 0,
            "urgency_keywords": list(set(urgency_matches)),
            "financial_keywords": list(set(financial_matches)),
            "credential_keywords": list(set(credential_matches)),
            "executive_keywords": list(set(executive_matches)),
            "malware_keywords": list(set(malware_matches)),
            "threat_categories": threat_categories,
            "nlp_risk_score": min(45, risk_points)
        }

        return detected_intents
