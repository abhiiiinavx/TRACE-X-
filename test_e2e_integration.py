import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_trace_hop_honesty_with_and_without_headers():
    # 1. Test raw email WITHOUT Received headers
    payload_no_hops = {
        "raw_headers": "From: test@example.com\nTo: victim@company.com\nSubject: No Hops Test",
        "raw_body": "This is a body without routing headers.",
        "subject": "No Hops Test"
    }
    res = client.post("/api/v1/analysis/raw-text", data=payload_no_hops)
    assert res.status_code == 200
    email_id = res.json()["email_id"]

    res_detail = client.get(f"/api/v1/analysis/{email_id}")
    assert res_detail.status_code == 200
    data = res_detail.json()
    assert data["trace_available"] is False
    assert len(data["hops"]) == 0
    assert "Insufficient Received-header" in data["trace_explanation"]

    # 2. Test raw email WITH real Received headers
    payload_with_hops = {
        "raw_headers": (
            "From: spoof@evil-domain.com\n"
            "To: target@company.com\n"
            "Subject: Hop Test\n"
            "Received: from relay1.evil-domain.com (198.51.100.25) by mail.company.com (192.0.2.1) with ESMTP; 24 Aug 2026 00:00:00 +0000\n"
            "Received: from origin.evil-domain.com (203.0.113.10) by relay1.evil-domain.com (198.51.100.25) with ESMTP; 24 Aug 2026 00:00:01 +0000\n"
        ),
        "raw_body": "Test message with hops.",
        "subject": "Hop Test"
    }
    res_hops = client.post("/api/v1/analysis/raw-text", data=payload_with_hops)
    assert res_hops.status_code == 200
    email_id_hops = res_hops.json()["email_id"]

    res_hops_detail = client.get(f"/api/v1/analysis/{email_id_hops}")
    assert res_hops_detail.status_code == 200
    data_hops = res_hops_detail.json()
    assert data_hops["trace_available"] is True
    assert len(data_hops["hops"]) >= 2
    # Verify no private IPs in ips_intel
    for ip_obj in data_hops["ips_intel"]:
        assert not ip_obj["ip"].startswith("127.")
        assert not ip_obj["ip"].startswith("192.168.")
        assert not ip_obj["ip"].startswith("10.")

def test_auth_validator_distinctions():
    # DKIM signature present without reported Authentication-Results
    payload = {
        "raw_headers": (
            "From: spoof@paypal-verify.com\n"
            "DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=paypal-verify.com; s=s1;\n"
            "Return-Path: <bounce@unrelated-domain.com>\n"
        ),
        "raw_body": "Please confirm your account.",
        "subject": "DKIM Test"
    }
    res = client.post("/api/v1/analysis/raw-text", data=payload)
    assert res.status_code == 200
    email_id = res.json()["email_id"]

    res_detail = client.get(f"/api/v1/analysis/{email_id}")
    assert res_detail.status_code == 200
    data = res_detail.json()
    auth = data["auth_results"]
    assert auth["dkim_status"] == "unverified"
    assert "signature_present_unverified" in auth["dkim_reported"]
    assert auth["return_path_aligned"] is False

def test_database_driven_dashboard():
    res = client.get("/api/v1/dashboard/stats")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data["total_analyzed"], int)
    assert isinstance(data["threats_detected"], int)
    assert isinstance(data["top_domains"], list)
    assert isinstance(data["top_ips"], list)

def test_audit_logs_retrieval():
    res = client.get("/api/v1/audit/logs?limit=10")
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
    if len(logs) > 0:
        assert "action" in logs[0]
        assert "created_at" in logs[0]

def test_universal_search():
    res = client.get("/api/v1/search?q=paypal")
    assert res.status_code == 200
    data = res.json()
    assert data["query"] == "paypal"
    assert isinstance(data["results"], list)
    assert isinstance(data["total_count"], int)

def test_copilot_evidence_grounding():
    res = client.post("/api/v1/copilot/query", json={"question": "What is the DMARC status and relay path?"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["evidence_sources"]) > 0

if __name__ == "__main__":
    pytest.main(["-v", __file__])
