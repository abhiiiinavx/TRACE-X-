import math
from typing import Dict, Any, List, Tuple, Optional
import tldextract

class BrandImpersonationDetector:
    """
    Detects typosquatting, homoglyph attacks, and brand impersonation using
    Levenshtein distance, Jaro-Winkler metrics, and lexical pattern heuristics.
    """

    TARGETED_BRANDS = {
        "paypal": ["paypal.com"],
        "microsoft": ["microsoft.com", "office.com", "live.com", "outlook.com"],
        "office365": ["office365.com", "office.com"],
        "google": ["google.com", "gmail.com"],
        "apple": ["apple.com", "icloud.com"],
        "amazon": ["amazon.com", "aws.amazon.com"],
        "netflix": ["netflix.com"],
        "dhl": ["dhl.com", "dhl-express.com"],
        "fedex": ["fedex.com"],
        "docusign": ["docusign.com"],
        "chase": ["chase.com"],
        "wellsfargo": ["wellsfargo.com"],
        "bankofamerica": ["bankofamerica.com"],
        "zoom": ["zoom.us", "zoom.com"]
    }

    BRAND_DISPLAY_NAMES = {
        "paypal": "PayPal",
        "microsoft": "Microsoft",
        "office365": "Office 365",
        "google": "Google",
        "apple": "Apple",
        "amazon": "Amazon",
        "netflix": "Netflix",
        "dhl": "DHL",
        "fedex": "FedEx",
        "docusign": "DocuSign",
        "chase": "Chase",
        "wellsfargo": "Wells Fargo",
        "bankofamerica": "Bank of America",
        "zoom": "Zoom"
    }

    HOMOGLYPH_MAP = str.maketrans({
        '1': 'l',
        '0': 'o',
        '@': 'a',
        '3': 'e',
        '5': 's',
        '8': 'b'
    })

    SUSPICIOUS_TOKENS = [
        "login", "signin", "verify", "secure", "auth", "billing", "support",
        "update", "account", "portal", "security", "alert", "notice", "service",
        "doc", "tracking", "invoice", "confirm"
    ]

    SUSPICIOUS_TLDS = [".xyz", ".top", ".icu", ".club", ".work", ".cfd", ".click", ".gq", ".tk", ".ml", ".ga", ".cf"]

    @classmethod
    def normalize_homoglyphs(cls, text: str) -> str:
        res = text.translate(cls.HOMOGLYPH_MAP)
        res = res.replace("rn", "m").replace("vv", "w").replace("cl", "d")
        return res

    @classmethod
    def levenshtein(cls, s1: str, s2: str) -> int:
        if len(s1) < len(s2):
            return cls.levenshtein(s2, s1)
        if len(s2) == 0:
            return len(s1)
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        return previous_row[-1]

    @classmethod
    def jaro_winkler(cls, s1: str, s2: str) -> float:
        """Compute Jaro-Winkler similarity coefficient between 0.0 and 1.0."""
        if s1 == s2:
            return 1.0
        len1, len2 = len(s1), len(s2)
        if len1 == 0 or len2 == 0:
            return 0.0
        match_bound = max(len1, len2) // 2 - 1
        matches = 0
        s1_matches = [False] * len1
        s2_matches = [False] * len2

        for i in range(len1):
            start = max(0, i - match_bound)
            end = min(i + match_bound + 1, len2)
            for j in range(start, end):
                if s2_matches[j]:
                    continue
                if s1[i] == s2[j]:
                    s1_matches[i] = True
                    s2_matches[j] = True
                    matches += 1
                    break

        if matches == 0:
            return 0.0

        transpositions = 0
        k = 0
        for i in range(len1):
            if not s1_matches[i]:
                continue
            while not s2_matches[k]:
                k += 1
            if s1[i] != s2[k]:
                transpositions += 1
            k += 1

        jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0
        prefix_len = 0
        for i in range(min(4, len1, len2)):
            if s1[i] == s2[i]:
                prefix_len += 1
            else:
                break
        return jaro + prefix_len * 0.1 * (1.0 - jaro)

    @classmethod
    def analyze_domain(cls, domain: str) -> Dict[str, Any]:
        domain_clean = domain.strip().lower()
        ext = tldextract.extract(domain_clean)
        domain_name = ext.domain.lower() if ext.domain else domain_clean
        suffix = f".{ext.suffix.lower()}" if ext.suffix else ""
        full_registered = f"{domain_name}{suffix}"

        is_lookalike = False
        target_brand = None
        technique = None
        similarity_score = 0.0
        risk_contribution = 0
        reasons = []

        normalized_domain = cls.normalize_homoglyphs(domain_name)

        # Check for exact brand token containment with suspicious modifiers
        for brand, legitimate_domains in cls.TARGETED_BRANDS.items():
            display_brand = cls.BRAND_DISPLAY_NAMES.get(brand, brand.capitalize())

            # If it IS the legitimate domain, skip
            if full_registered in legitimate_domains:
                return {
                    "domain": domain_clean,
                    "is_lookalike": False,
                    "brand": display_brand,
                    "similarity_score": 1.0,
                    "technique": "Legitimate Brand Domain",
                    "risk_contribution": 0,
                    "reasons": ["Authentic corporate domain."]
                }

            # 1. Check exact brand substring in normalized domain (handles homoglyphs + tokens)
            if brand in normalized_domain:
                is_lookalike = True
                target_brand = display_brand
                if brand in domain_name:
                    technique = "Brand name pairing with hyphenated token"
                    similarity_score = 0.92
                    risk_contribution = 35
                    reasons.append(f"Domain embeds target brand '{target_brand}' alongside deceptive tokens.")
                else:
                    technique = "Homoglyph character substitution (e.g. '1' for 'l' or '0' for 'o')"
                    similarity_score = 0.95
                    risk_contribution = 40
                    reasons.append(f"Homoglyph substitution detected impersonating '{target_brand}'.")
                break

            # 2. Levenshtein edit distance check on brand root
            dist = cls.levenshtein(domain_name, brand)
            if dist == 1 and len(brand) >= 4:
                is_lookalike = True
                target_brand = display_brand
                technique = "Single-character typosquatting (edit distance 1)"
                similarity_score = 0.89
                risk_contribution = 35
                reasons.append(f"Typosquatting variant of '{target_brand}' (1 letter alteration).")
                break

            # 3. Jaro-Winkler metric
            jw = cls.jaro_winkler(domain_name, brand)
            if jw > 0.86 and len(domain_name) <= len(brand) + 3:
                is_lookalike = True
                target_brand = display_brand
                technique = "High phonetic & string similarity (Jaro-Winkler > 0.86)"
                similarity_score = round(jw, 2)
                risk_contribution = 30
                reasons.append(f"High morphological similarity ({round(jw*100)}%) to '{target_brand}'.")
                break

        # Check suspicious TLD
        if suffix in cls.SUSPICIOUS_TLDS:
            risk_contribution += 15
            reasons.append(f"High-risk TLD '{suffix}' commonly used in disposable phishing operations.")

        # Check suspicious token containment
        for tok in cls.SUSPICIOUS_TOKENS:
            if tok in domain_name and not is_lookalike:
                risk_contribution += 10
                reasons.append(f"Contains credential-action token '{tok}'.")
                break

        return {
            "domain": domain_clean,
            "is_lookalike": is_lookalike,
            "brand": target_brand,
            "similarity_score": similarity_score,
            "technique": technique,
            "risk_contribution": min(50, risk_contribution),
            "reasons": reasons
        }
