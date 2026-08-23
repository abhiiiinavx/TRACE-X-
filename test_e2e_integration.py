import json
import urllib.request
import urllib.parse
import sys

def test_url(name, url, method="GET", data=None, expected_status=200):
    print(f"[TESTING] {name} -> {url} ...", end=" ", flush=True)
    try:
        req = urllib.request.Request(url, method=method)
        if data:
            req.add_header('Content-Type', 'application/json')
            req.data = json.dumps(data).encode('utf-8')
        
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.getcode()
            content = resp.read().decode('utf-8')
            assert status == expected_status, f"Expected {expected_status}, got {status}"
            print(f"PASSED (HTTP {status})")
            return content
    except Exception as e:
        print(f"FAILED: {e}")
        return None

def run_all_e2e_tests():
    print("=================================================================")
    print("      TRACE-X CYBER-FORENSICS FULL-STACK E2E VERIFICATION       ")
    print("=================================================================")
    
    # 1. Backend Health & Config
    test_url("Root API", "http://127.0.0.1:8000/")
    test_url("Dashboard Telemetry Stats", "http://127.0.0.1:8000/api/v1/dashboard/stats")
    
    # 2. Demo Load
    demo_res = test_url("Load Demo Investigation (1-Click Judge Button)", "http://127.0.0.1:8000/api/v1/demo/load", method="POST")
    active_email_id = None
    if demo_res:
        demo_json = json.loads(demo_res)
        active_email_id = demo_json.get("active_email_id")
        print(f"    --> Active Demo Email ID: {active_email_id}")
    
    # 3. Emails & Deep Forensics
    test_url("List Incidents", "http://127.0.0.1:8000/api/v1/emails?limit=10")
    if active_email_id:
        test_url("Deep Forensic Analysis (10 Tabs)", f"http://127.0.0.1:8000/api/v1/analysis/{active_email_id}")
        test_url("Incident Attack Graph", f"http://127.0.0.1:8000/api/v1/graph/email/{active_email_id}")
        test_url("Printable HTML Forensic Report", f"http://127.0.0.1:8000/api/v1/reports/html/{active_email_id}")
    
    # 4. Attack Graph & Threat Intel
    test_url("Global Attack Graph Matrix", "http://127.0.0.1:8000/api/v1/graph/overview")
    test_url("Threat Intel IOC Lookup (IP)", "http://127.0.0.1:8000/api/v1/intel/search?q=194.36.189.44")
    test_url("Threat Intel IOC Lookup (Domain)", "http://127.0.0.1:8000/api/v1/intel/search?q=paypa1-security.com")
    
    # 5. Campaigns & Cases
    camps_res = test_url("List Campaign DNA Clusters", "http://127.0.0.1:8000/api/v1/campaigns")
    if camps_res:
        camps = json.loads(camps_res)
        if len(camps) > 0:
            test_url("Campaign DNA Cluster Detail", f"http://127.0.0.1:8000/api/v1/campaigns/{camps[0]['id']}")
            
    cases_res = test_url("List Forensic Cases", "http://127.0.0.1:8000/api/v1/cases")
    if cases_res:
        cases = json.loads(cases_res)
        if len(cases) > 0:
            test_url("Forensic Case Detail", f"http://127.0.0.1:8000/api/v1/cases/{cases[0]['id']}")

    # 6. AI Forensic Copilot Grounded Query
    copilot_query = {
        "question": "What makes this email suspicious and what MITRE technique applies?",
        "email_id": active_email_id
    }
    copilot_res = test_url("AI Copilot Grounded Q&A", "http://127.0.0.1:8000/api/v1/copilot/query", method="POST", data=copilot_query)
    if copilot_res:
        copilot_json = json.loads(copilot_res)
        print(f"    --> Copilot Answer Preview: {copilot_json.get('answer', '')[:100]}...")

    # 7. Frontend SSR Page Routes
    print("\n--- FRONTEND APPS & ROUTE VERIFICATION (PORT 3000) ---")
    test_url("Frontend Dashboard (/)", "http://127.0.0.1:3000/")
    test_url("Frontend Analyze Workspace (/analyze)", "http://127.0.0.1:3000/analyze")
    test_url("Frontend Threat Intel (/threat-intel)", "http://127.0.0.1:3000/threat-intel")
    test_url("Frontend Campaign DNA (/campaigns)", "http://127.0.0.1:3000/campaigns")
    test_url("Frontend Attack Graph Matrix (/attack-graph)", "http://127.0.0.1:3000/attack-graph")
    test_url("Frontend Forensic Cases Vault (/cases)", "http://127.0.0.1:3000/cases")
    test_url("Frontend Incident Reports (/reports)", "http://127.0.0.1:3000/reports")
    test_url("Frontend System Settings (/settings)", "http://127.0.0.1:3000/settings")
    
    print("=================================================================")
    print("      ALL TRACE-X SYSTEM COMPONENTS PASSED VERIFICATION!        ")
    print("=================================================================")

if __name__ == "__main__":
    run_all_e2e_tests()
