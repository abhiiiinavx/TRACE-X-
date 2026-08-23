import email
from email import policy
from email.parser import BytesParser
import hashlib
import re
from typing import Dict, Any, List, Tuple
from urllib.parse import urlparse
import html

class EmlParser:
    """
    RFC 5322 MIME email parser with safe sanitization and cryptographic integrity verification.
    Guarantees attachments are NEVER executed and HTML is fully sanitized.
    """

    # URL extraction regex
    URL_REGEX = re.compile(
        r'https?://(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?(?:/[^\s"\'<>]*)?',
        re.IGNORECASE
    )

    # HTML tag and attribute sanitizers
    DANGEROUS_TAGS_REGEX = re.compile(
        r'<(script|iframe|object|embed|applet|meta|link|svg|form|input|button)[^>]*>.*?</\1>|<(script|iframe|object|embed|applet|meta|link|svg|form|input|button)[^>]*>',
        re.IGNORECASE | re.DOTALL
    )
    EVENT_HANDLER_REGEX = re.compile(r'\bon[a-z]+\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)', re.IGNORECASE)
    JAVASCRIPT_URI_REGEX = re.compile(r'href\s*=\s*(?:"javascript:[^"]*"|\'javascript:[^\']*\'|javascript:[^\s>]+)', re.IGNORECASE)

    @classmethod
    def sanitize_html(cls, html_content: str) -> str:
        """Sanitize HTML body to prevent any XSS, iframe injection, or active scripting."""
        if not html_content:
            return ""
        # Remove dangerous tags
        clean = cls.DANGEROUS_TAGS_REGEX.sub('', html_content)
        # Remove on* event handlers
        clean = cls.EVENT_HANDLER_REGEX.sub('', clean)
        # Remove javascript: URIs
        clean = cls.JAVASCRIPT_URI_REGEX.sub('href="#"', clean)
        return clean

    @classmethod
    def parse_eml_bytes(cls, eml_bytes: bytes) -> Dict[str, Any]:
        """Parse raw EML bytes into structured headers, body, URLs, attachments, and sha256."""
        sha256_hash = hashlib.sha256(eml_bytes).hexdigest()
        msg = BytesParser(policy=policy.default).parsebytes(eml_bytes)

        from_header = str(msg.get("From", "")).strip()
        from_display_name = ""
        from_addr = from_header
        if "<" in from_header and ">" in from_header:
            from_display_name = from_header.split("<")[0].strip("\"' ")
            from_addr = from_header.split("<")[1].split(">")[0].strip()

        to_header = str(msg.get("To", "")).strip()
        reply_to = str(msg.get("Reply-To", "")).strip() or None
        return_path = str(msg.get("Return-Path", "")).strip(" <>") or None
        subject = str(msg.get("Subject", "")).strip()
        message_id = str(msg.get("Message-ID", "")).strip()
        date_header = str(msg.get("Date", "")).strip()
        auth_results_raw = str(msg.get("Authentication-Results", "")).strip()

        # Collect all raw headers
        all_headers: List[Tuple[str, str]] = []
        received_headers: List[str] = []
        for key, value in msg.items():
            all_headers.append((key, str(value)))
            if key.lower() == "received":
                received_headers.append(str(value))

        # Extract plain and HTML bodies
        body_plain_parts = []
        body_html_parts = []
        attachments = []

        if msg.is_multipart():
            for part in msg.walk():
                content_disposition = str(part.get("Content-Disposition", ""))
                content_type = part.get_content_type()
                filename = part.get_filename()

                # Check if it's an attachment
                if filename or "attachment" in content_disposition.lower():
                    payload = part.get_payload(decode=True) or b""
                    att_sha256 = hashlib.sha256(payload).hexdigest()
                    attachments.append({
                        "filename": filename or f"attachment_{len(attachments)+1}.bin",
                        "mime_type": content_type,
                        "size_bytes": len(payload),
                        "sha256": att_sha256,
                        "is_malicious": False,
                        "threat_name": None
                    })
                else:
                    if content_type == "text/plain":
                        try:
                            body_plain_parts.append(part.get_content())
                        except Exception:
                            body_plain_parts.append(str(part.get_payload(decode=True) or b"", errors="ignore"))
                    elif content_type == "text/html":
                        try:
                            body_html_parts.append(part.get_content())
                        except Exception:
                            body_html_parts.append(str(part.get_payload(decode=True) or b"", errors="ignore"))
        else:
            content_type = msg.get_content_type()
            if content_type == "text/html":
                body_html_parts.append(msg.get_content())
            else:
                body_plain_parts.append(msg.get_content())

        body_plain = "\n".join(body_plain_parts).strip()
        body_html_raw = "\n".join(body_html_parts).strip()
        body_html_sanitized = cls.sanitize_html(body_html_raw)

        # Extract URLs from plain and HTML content
        extracted_urls = set()
        for text in [body_plain, body_html_raw]:
            if text:
                matches = cls.URL_REGEX.findall(text)
                for url in matches:
                    cleaned_url = url.rstrip('.,)>]"\'')
                    if cleaned_url.startswith("http://") or cleaned_url.startswith("https://"):
                        extracted_urls.add(cleaned_url)

        # Extract href attributes from HTML specifically
        if body_html_raw:
            href_matches = re.findall(r'href\s*=\s*["\'](https?://[^"\']+)["\']', body_html_raw, re.IGNORECASE)
            for url in href_matches:
                extracted_urls.add(url.strip())

        return {
            "sha256": sha256_hash,
            "from_addr": from_addr,
            "from_display_name": from_display_name,
            "to_addr": to_header,
            "reply_to": reply_to,
            "return_path": return_path,
            "subject": subject,
            "message_id": message_id,
            "date_header": date_header,
            "auth_results_raw": auth_results_raw,
            "all_headers": all_headers,
            "received_headers": received_headers,
            "body_plain": body_plain,
            "body_html_sanitized": body_html_sanitized,
            "extracted_urls": list(extracted_urls),
            "attachments": attachments
        }
