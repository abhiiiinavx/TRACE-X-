# TRACE-X — AI-Powered Email Threat Detection, Geolocation & Forensic Intelligence Platform

> **Smart India Hackathon 2026 — Problem Statement SIH26106**  
> *"Most email security systems stop at detection. TRACE-X continues from detection to investigation."*

[![Tests](https://img.shields.io/badge/Pytest%20Tests-11%2F11%20Passed-emerald.svg)](backend/tests)
[![E2E Verification](https://img.shields.io/badge/E2E%20Integration-19%2F19%20Passed-cyan.svg)](test_e2e_integration.py)
[![Zero Paid APIs](https://img.shields.io/badge/Zero%20Paid%20APIs-100%25%20Offline%20Ready-blue.svg)](#threat-intelligence--zero-paid-api-guarantee)
[![MITRE ATT&CK](https://img.shields.io/badge/MITRE%20ATT%26CK-v14%20Aligned-purple.svg)](#mitre-attck-matrix-mapping)

---

## 🛡️ Executive Summary

Traditional Secure Email Gateways (SEGs) and spam filters output simple binary classifications (*"Phishing: Yes/No"*), discarding the critical forensic artifacts necessary to answer key incident response questions:

- *Where did the malicious message actually originate?*
- *What intermediate MTAs or Tor exit relays did it traverse?*
- *Is this an isolated attack or part of a coordinated adversary campaign targeting multiple departments?*
- *What is the exact chain of custody for evidence preservation?*

**TRACE-X** is an end-to-end cyber-forensics platform that bridges the gap between automated detection and deep forensic investigation. It reconstructs multi-hop MTA relay pathways, performs homoglyph typosquatting and brand lookalike attribution, clusters distributed attacks via Campaign DNA signatures, renders interactive entity attack graphs, and empowers investigators with an evidence-grounded AI Copilot.

---

## 🔄 Investigation Pipeline

TRACE-X follows a 9-stage deterministic forensic pipeline:

```
DETECT ➔ EXPLAIN ➔ TRACE ➔ GEOLOCATE ➔ CORRELATE ➔ CLUSTER ➔ VISUALIZE ➔ INVESTIGATE ➔ REPORT
```

1. **DETECT**: RFC 5322 MIME parsing, cryptographic SHA-256 hashing, SPF/DKIM/DMARC authentication verification, and display name spoof detection.
2. **EXPLAIN**: Transparent, inspectable feature-weighted risk scoring (0–100) with explicit feature impact points ($\pm$ pts) and confidence percentages.
3. **TRACE**: Sequential Received header hop reconstruction, transit delay ($\Delta t$) anomaly calculation, and private RFC 1918 vs public IP routing differentiation.
4. **GEOLOCATE**: Probabilistic infrastructure origin mapping with explicit attribution confidence metrics and hosting/ASN classification.
5. **CORRELATE**: Homoglyph normalization (Levenshtein, Jaro-Winkler), brand impersonation detection, DNS records, and URL redirect chain resolution.
6. **CLUSTER**: Multi-signal Campaign DNA clustering linking shared sender infrastructure, autonomous systems, and payload hashes.
7. **VISUALIZE**: Interactive Cytoscape.js entity-relationship Attack Graph linking emails, domains, IPs, ASNs, URLs, and campaigns.
8. **INVESTIGATE**: Evidence-grounded AI Forensic Copilot restricted strictly to extracted telemetry to prevent hallucinations.
9. **REPORT**: Downloadable and printable courtroom-ready forensic incident reports with SHA-256 chain-of-custody ledgers.

---

## 🌟 Key Capabilities & Architectural Innovations

### 1. Transparent Feature-Weighted Scoring (0–100)
Rather than relying on opaque black-box classifiers, TRACE-X evaluates evidence across five categories with inspectable weights:
- **Authentication (Weight: 25)**: DMARC status (Reject/Quarantine/None/Fail), SPF pass/fail/softfail, Return-Path alignment, Display Name vs Email mismatch.
- **Domain Reputation (Weight: 25)**: Newly registered domain age (<30 days), Homoglyph lookalike distance, Registrar privacy proxy usage.
- **Header Anomaly (Weight: 20)**: Originating relay is Tor/VPN proxy, unnatural transit delay ($\Delta t > 300\text{s}$), geographic jump velocity violation.
- **Linguistic / NLP Intent (Weight: 15)**: Executive wire transfer coercion, urgent credential harvest phrases, CEO impersonation patterns.
- **Attachment / URL (Weight: 15)**: Suspicious executable extensions (`.exe`, `.scr`, `.iso`, `.hta`, `.vbs`, macro-enabled docs), URL entropy, and redirect chains.

### 2. Probabilistic Geolocation Attribution Standard
TRACE-X strictly adheres to forensic attribution integrity standards. All geolocation outputs carry explicit attribution confidence scores and clear disclaimers:
> *"Geographic coordinates denote probable BGP routing hubs, hosting providers, and intermediate relay infrastructure. TRACE-X does not claim confirmed physical residence of individual threat actors."*

### 3. Zero-Paid API Guarantee
All external threat intelligence lookups (IP WHOIS, BGP ASNs, Geolocation, Domain Registrars, File Hash Reputation) operate behind an abstract `ThreatIntelProvider` interface. The system ships with a deterministic `MockThreatIntelProvider` that produces high-fidelity, realistic results offline without requiring external API keys. Optional live connectors for VirusTotal, AbuseIPDB, and MaxMind can be configured via the settings panel.

### 4. Interactive Attack Graph (Cytoscape.js)
Visualize the entire attack surface as a directed multi-entity graph. Click on any entity (Email, Domain, IP, ASN, URL, Campaign) to open a contextual inspection drawer detailing its reputation, registrar, or shared infrastructure.

### 5. Grounded AI Forensic Copilot
A specialized conversational assistant grounded strictly in the active case's extracted evidence ledger. Ask questions such as:
- *"What makes this email suspicious?"*
- *"Show all infrastructure connected to this IP"*
- *"Which emails belong to the same campaign cluster?"*
- *"Generate executive forensic summary"*

---

## 🎯 MITRE ATT&CK Matrix Mapping

TRACE-X automatically tags detected indicators with relevant MITRE ATT&CK Enterprise techniques:

| Technique ID | Technique Name | Description in TRACE-X |
| :--- | :--- | :--- |
| **T1566.001** | Phishing: Spearphishing Attachment | Weaponized attachments, obfuscated scripts, or macro payloads |
| **T1566.002** | Phishing: Spearphishing Link | Typosquatted credential harvesting hyperlinks & redirect chains |
| **T1585** | Establish Accounts: Domains | Lookalike / typosquatted domains registered to impersonate trusted brands |
| **T1586** | Compromised Accounts | Valid SPF/DKIM on legitimate accounts hijacked for executive BEC |
| **T1071.001** | Application Layer Protocol: Web Protocols | Multi-hop HTTP/HTTPS redirectors hiding final malware landing pages |
| **T1656** | Impersonation | Executive display name spoofing and deceptive header construction |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (tested on Python 3.10 – 3.14)
- **Node.js 18+** & **npm**

### 1. Clone & Set Up Backend

```bash
# Navigate to repository root
cd cybersih

# Install Python dependencies
pip install -r backend/requirements.txt

# Run backend test suite (11 unit & forensic tests)
pytest backend/tests -v

# Start FastAPI Backend (Port 8000)
python backend/run.py
```
*API Documentation will be available at `http://localhost:8000/docs`*

### 2. Set Up & Run Frontend

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Next.js Development Server (Port 3000)
npm run dev
```

### 3. Open Platform in Browser
Navigate to: **`http://localhost:3000`**

### 4. Instant 1-Click Demo for Reviewers & Judges
Click the **"⚡ Load Demo Investigation"** hero button on the top navigation bar or dashboard to immediately load the preloaded high-fidelity incident scenario (*PayPal Credential Phishing with Tor Relay & Homoglyphs*), explore the 10 forensic analysis tabs, query the AI Copilot, inspect the Attack Graph, and export the courtroom-ready PDF report!

---

## 🧪 Verification & Testing

To run the full-stack end-to-end verification script:

```bash
python test_e2e_integration.py
```

Output:
```
=================================================================
      TRACE-X CYBER-FORENSICS FULL-STACK E2E VERIFICATION       
=================================================================
[TESTING] Root API -> http://127.0.0.1:8000/ ... PASSED (HTTP 200)
[TESTING] Dashboard Telemetry Stats -> http://127.0.0.1:8000/api/v1/dashboard/stats ... PASSED (HTTP 200)
[TESTING] Load Demo Investigation -> http://127.0.0.1:8000/api/v1/demo/load ... PASSED (HTTP 200)
[TESTING] Deep Forensic Analysis (10 Tabs) -> http://127.0.0.1:8000/api/v1/analysis/... ... PASSED (HTTP 200)
[TESTING] Incident Attack Graph -> http://127.0.0.1:8000/api/v1/graph/email/... ... PASSED (HTTP 200)
[TESTING] Printable HTML Forensic Report -> http://127.0.0.1:8000/api/v1/reports/html/... ... PASSED (HTTP 200)
[TESTING] Global Attack Graph Matrix -> http://127.0.0.1:8000/api/v1/graph/overview ... PASSED (HTTP 200)
[TESTING] Threat Intel IOC Lookup (IP) -> http://127.0.0.1:8000/api/v1/intel/search?q=194.36.189.44 ... PASSED (HTTP 200)
[TESTING] List Campaign DNA Clusters -> http://127.0.0.1:8000/api/v1/campaigns ... PASSED (HTTP 200)
[TESTING] List Forensic Cases -> http://127.0.0.1:8000/api/v1/cases ... PASSED (HTTP 200)
[TESTING] AI Copilot Grounded Q&A -> http://127.0.0.1:8000/api/v1/copilot/query ... PASSED (HTTP 200)
[TESTING] Frontend Routes (/, /analyze, /threat-intel, /campaigns, /attack-graph, /cases, /reports, /settings) ... ALL PASSED (HTTP 200)
=================================================================
      ALL TRACE-X SYSTEM COMPONENTS PASSED VERIFICATION!        
=================================================================
```

---

## 🏛️ Project Directory Structure

```
cybersih/
├── backend/
│   ├── app/
│   │   ├── api/             # 11 FastAPI REST Routers
│   │   ├── core/            # Config, Security (bcrypt/JWT), RBAC
│   │   ├── db/              # SQLAlchemy Models & Pydantic Schemas
│   │   ├── parsing/         # RFC 5322 MIME Parser & Sanitizer
│   │   ├── detection/       # AuthValidator, BrandHomoglyphs, NLPAnalyzer, ScoringEngine
│   │   ├── forensics/       # HopReconstructor & Geolocation Delays
│   │   ├── intel/           # Abstract ThreatIntelProvider & MockProvider
│   │   ├── campaigns/       # Multi-Signal Cluster Engine
│   │   ├── graph/           # Cytoscape Graph Builder
│   │   ├── copilot/         # Grounded AI Copilot
│   │   └── reports/         # HTML/PDF Report Generator
│   ├── seed/                # Seed Scenarios & Threat Archetypes
│   └── tests/               # Pytest Suite (11 passing tests)
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router Pages
│   │   │   ├── analyze/     # 10-Tab Forensic Workspace
│   │   │   ├── attack-graph/# Fullscreen Interactive Graph
│   │   │   ├── campaigns/   # Campaign DNA Hub
│   │   │   ├── cases/       # Forensic Case Management & Evidence Vault
│   │   │   ├── reports/     # Forensic Reports Viewer
│   │   │   ├── settings/    # Settings & Audit Ledger
│   │   │   └── threat-intel/# Universal IOC Search
│   │   ├── components/      # Layout, GeoMap, AttackGraph, CopilotDrawer
│   │   └── lib/             # API Client & Types
└── test_e2e_integration.py  # Full-Stack End-to-End Test Suite
```

---

## 👥 Authors & Acknowledgements
Built for **Smart India Hackathon 2026** (Problem Statement: SIH26106) by the TRACE-X Cyber Forensics Development Team.
