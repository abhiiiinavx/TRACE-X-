import re
from typing import Dict, Any, Tuple
import tldextract

class AuthValidator:
    """
    Validates SPF, DKIM, DMARC, Return-Path alignment, and Display Name spoofing.
    Provides deterministic impact scores and explicit forensic reasons.
    """

    @classmethod
    def extract_root_domain(cls, address_or_domain: str) -> str:
        if not address_or_domain:
            return ""
        if "@" in address_or_domain:
            address_or_domain = address_or_domain.split("@")[-1]
        ext = tldextract.extract(address_or_domain)
        reg = getattr(ext, 'top_domain_under_public_suffix', None) or getattr(ext, 'registered_domain', None)
        if reg:
            return reg.lower()
        return address_or_domain.lower()

    @classmethod
    def validate_auth(
        cls,
        from_addr: str,
        from_display_name: str,
        reply_to: str,
        return_path: str,
        auth_results_raw: str,
        all_headers: list
    ) -> Dict[str, Any]:
        from_domain = cls.extract_root_domain(from_addr)
        return_path_domain = cls.extract_root_domain(return_path) if return_path else ""
        reply_to_domain = cls.extract_root_domain(reply_to) if reply_to else ""

        # Default values
        spf_status = "none"
        dkim_status = "none"
        dmarc_status = "none"
        dmarc_policy = "none"
        spf_reported = "unavailable"
        dkim_reported = "unavailable"
        dmarc_reported = "unavailable"

        # Check raw Authentication-Results or header lines
        auth_text = (auth_results_raw or "").lower()
        for k, v in all_headers:
            if k.lower() in ["received-spf", "x-spam-status", "authentication-results", "dkim-signature"]:
                auth_text += " " + v.lower()

        # 1. SPF extraction (Reported in headers vs none)
        if "spf=pass" in auth_text or "received-spf: pass" in auth_text:
            spf_status = "pass"
            spf_reported = "pass"
        elif "spf=fail" in auth_text or "received-spf: fail" in auth_text:
            spf_status = "fail"
            spf_reported = "fail"
        elif "spf=softfail" in auth_text or "received-spf: softfail" in auth_text:
            spf_status = "softfail"
            spf_reported = "softfail"
        elif "spf=neutral" in auth_text:
            spf_status = "neutral"
            spf_reported = "neutral"

        # 2. DKIM extraction (Do NOT mark pass merely because DKIM-Signature header exists)
        has_dkim_sig = any(k.lower() == "dkim-signature" for k, v in all_headers)
        if "dkim=pass" in auth_text:
            dkim_status = "pass"
            dkim_reported = "pass"
        elif "dkim=fail" in auth_text:
            dkim_status = "fail"
            dkim_reported = "fail"
        elif has_dkim_sig:
            # Header present but no MTA Authentication-Results pass recorded
            dkim_status = "unverified"
            dkim_reported = "signature_present_unverified"
        else:
            dkim_status = "none"
            dkim_reported = "none"

        # 3. DMARC extraction & Alignment Inference
        if "dmarc=pass" in auth_text:
            dmarc_status = "pass"
            dmarc_reported = "pass"
            dmarc_policy = "none"
        elif "dmarc=fail" in auth_text:
            dmarc_status = "fail"
            dmarc_reported = "fail"
            if "p=reject" in auth_text:
                dmarc_policy = "reject"
            elif "p=quarantine" in auth_text:
                dmarc_policy = "quarantine"
            else:
                dmarc_policy = "none"
        else:
            # Infer DMARC alignment heuristically from envelope & headers
            if spf_status == "pass" and dkim_status == "pass" and from_domain == return_path_domain:
                dmarc_status = "pass"
                dmarc_reported = "inferred_pass"
            elif spf_status == "fail" or (return_path_domain and from_domain != return_path_domain):
                dmarc_status = "fail"
                dmarc_policy = "quarantine"
                dmarc_reported = "inferred_fail"
            else:
                dmarc_status = "none"
                dmarc_reported = "unavailable"

        # Return-Path vs From Alignment
        return_path_aligned = True
        alignment_note = "Return-Path domain matches sender domain."
        if return_path_domain and from_domain:
            if return_path_domain != from_domain:
                return_path_aligned = False
                alignment_note = f"Return-Path mismatch: '{return_path_domain}' vs sender '{from_domain}'."

        # Reply-To mismatch
        reply_to_mismatch = False
        reply_to_note = "Reply-To address is aligned with sender."
        if reply_to_domain and from_domain:
            if reply_to_domain != from_domain:
                reply_to_mismatch = True
                reply_to_note = f"Reply-To divergence: Sender is '@{from_domain}' but replies route to '@{reply_to_domain}'."

        # Display Name Spoofing Check
        display_name_spoof = False
        spoof_reason = None
        if from_display_name:
            email_in_name = re.findall(r'[\w\.-]+@[\w\.-]+', from_display_name)
            if email_in_name and email_in_name[0].lower() != from_addr.lower():
                display_name_spoof = True
                spoof_reason = f"Display name embeds deceptive address '{email_in_name[0]}' while actual envelope sender is '{from_addr}'."
            exec_keywords = ["ceo", "cfo", "director", "president", "paypal", "microsoft", "apple", "bank", "support", "security", "admin"]
            if any(k in from_display_name.lower() for k in exec_keywords):
                if any(free in from_domain for free in ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "proton.me", "mail.ru"]):
                    display_name_spoof = True
                    spoof_reason = f"Executive/Brand title '{from_display_name}' sent from generic freemail provider '@{from_domain}'."

        # Compute Auth Risk Contribution
        auth_score_penalty = 0
        if dmarc_status == "fail":
            auth_score_penalty += 25
        elif dmarc_status == "none":
            auth_score_penalty += 10

        if spf_status == "fail":
            auth_score_penalty += 20
        elif spf_status == "softfail":
            auth_score_penalty += 15

        if not return_path_aligned:
            auth_score_penalty += 15

        if reply_to_mismatch:
            auth_score_penalty += 20

        if display_name_spoof:
            auth_score_penalty += 25

        return {
            "spf_status": spf_status,
            "dkim_status": dkim_status,
            "dmarc_status": dmarc_status,
            "dmarc_policy": dmarc_policy,
            "spf_reported": spf_reported,
            "dkim_reported": dkim_reported,
            "dmarc_reported": dmarc_reported,
            "verification_method": "Header-Reported MTA Evidence & Envelope Alignment",
            "return_path_aligned": return_path_aligned,
            "return_path_domain": return_path_domain,
            "alignment_note": alignment_note,
            "reply_to_mismatch": reply_to_mismatch,
            "reply_to_note": reply_to_note,
            "display_name_spoof": display_name_spoof,
            "spoof_reason": spoof_reason,
            "auth_risk_penalty": min(50, auth_score_penalty)
        }
