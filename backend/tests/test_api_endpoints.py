import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "TRACE-X" in data["platform"]

def test_dashboard_stats():
    response = client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_analyzed" in data
    assert "threats_detected" in data
    assert len(data["threats_over_time"]) > 0

def test_campaigns_list():
    response = client.get("/api/v1/campaigns/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    assert any("DarkPhish" in c["name"] for c in data)

def test_intel_search_ip():
    response = client.get("/api/v1/intel/search?q=194.36.189.44")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "IP"
    assert "Russia" in data["intel"]["country"]

def test_copilot_query():
    response = client.post("/api/v1/copilot/query", json={"question": "What makes this email suspicious?"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["evidence_sources"]) > 0

def test_audit_logs():
    response = client.get("/api/v1/audit/logs")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_universal_search():
    response = client.get("/api/v1/search?q=paypa1")
    assert response.status_code == 200
    data = response.json()
    assert "total_count" in data
    assert "results" in data
    assert "categories" in data
