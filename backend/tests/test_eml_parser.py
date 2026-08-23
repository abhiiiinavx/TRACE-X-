import pytest
from backend.app.parsing.eml_parser import EmlParser
from backend.seed.seed_data import RAW_PAYPAL_EML, RAW_DHL_MALWARE_EML

def test_parse_paypal_eml():
    parsed = EmlParser.parse_eml_bytes(RAW_PAYPAL_EML.encode("utf-8"))
    assert parsed["from_addr"] == "security-alert@paypa1-security.com"
    assert parsed["from_display_name"] == "PayPal Account Security"
    assert "suspended" in parsed["subject"].lower()
    assert len(parsed["received_headers"]) >= 3
    assert len(parsed["extracted_urls"]) >= 1
    assert parsed["sha256"] is not None

def test_parse_attachment_hash():
    parsed = EmlParser.parse_eml_bytes(RAW_DHL_MALWARE_EML.encode("utf-8"))
    assert len(parsed["attachments"]) >= 1
    att = parsed["attachments"][0]
    assert att["filename"] == "DHL_Customs_Declaration_Doc.exe"
    assert len(att["sha256"]) == 64

def test_sanitize_dangerous_html():
    raw_html = "<p>Safe text</p><script>alert('xss')</script><iframe src='http://evil.com'></iframe><a href='javascript:evil()' onclick='steal()'>Link</a>"
    clean = EmlParser.sanitize_html(raw_html)
    assert "<script>" not in clean
    assert "<iframe>" not in clean
    assert "onclick" not in clean
    assert "javascript:" not in clean
    assert "Safe text" in clean
