import datetime
from typing import Dict, Any, List
from jinja2 import Template

HTML_REPORT_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>TRACE-X Forensic Incident Report — {{ case_number }}</title>
<style>
  @page { margin: 20mm; size: A4; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    background: #ffffff;
    line-height: 1.5;
    font-size: 13px;
    margin: 0;
    padding: 24px;
  }
  .header-table { width: 100%; border-bottom: 3px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
  .logo-title { font-size: 24px; font-weight: 800; color: #0284c7; letter-spacing: -0.5px; }
  .tagline { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
  }
  .badge-critical { background: #fee2e2; color: #b91c1c; border: 1px solid #f87171; }
  .badge-high { background: #ffedd5; color: #c2410c; border: 1px solid #fb923c; }
  .badge-medium { background: #fef3c7; color: #b45309; border: 1px solid #fcd34d; }
  .badge-clean { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
  
  h2 {
    font-size: 15px;
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 6px;
    margin-top: 24px;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .grid-2 { display: flex; gap: 16px; margin-bottom: 12px; }
  .card {
    flex: 1;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
  }
  .card-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
  .card-value { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
  
  table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 16px; font-size: 12px; }
  th { background: #f1f5f9; color: #475569; text-align: left; padding: 8px; border: 1px solid #cbd5e1; font-weight: 600; }
  td { padding: 7px 8px; border: 1px solid #e2e8f0; color: #1e293b; }
  tr:nth-child(even) { background: #f8fafc; }
  
  .disclaimer-box {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    padding: 10px 14px;
    font-size: 11px;
    color: #1e40af;
    margin-top: 16px;
    border-radius: 0 4px 4px 0;
  }
  .evidence-hash { font-family: monospace; font-size: 11px; color: #0f172a; background: #e2e8f0; padding: 2px 6px; border-radius: 3px; }
  .signature-block { margin-top: 36px; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 16px; }
  .sign-col { width: 45%; }
  .sign-line { border-bottom: 1px solid #94a3b8; height: 32px; margin-bottom: 4px; }
  
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
</style>
</head>
<body>

<table class="header-table">
  <tr>
    <td>
      <div class="logo-title">TRACE-X</div>
      <div class="tagline">AI-Powered Cyber-Forensics & Threat Attribution Platform</div>
    </td>
    <td style="text-align: right;">
      <div style="font-size: 16px; font-weight: 700;">FORENSIC INCIDENT REPORT</div>
      <div style="color: #64748b; font-size: 12px;">Case Number: <strong>{{ case_number }}</strong></div>
      <div style="color: #64748b; font-size: 11px;">Generated: {{ generated_at }}</div>
    </td>
  </tr>
</table>

<div class="grid-2">
  <div class="card">
    <div class="card-label">Threat Classification</div>
    <div class="card-value">{{ email.classification }}</div>
    <div style="margin-top: 6px;">
      <span class="badge badge-{{ email.severity|lower }}">{{ email.severity }} SEVERITY ({{ email.risk_score }}/100)</span>
    </div>
  </div>
  <div class="card">
    <div class="card-label">Primary Target / Subject</div>
    <div class="card-value" style="font-size: 13px;">{{ email.subject }}</div>
    <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
      <strong>From:</strong> {{ email.from_addr }}<br>
      <strong>To:</strong> {{ email.to_addr }}
    </div>
  </div>
</div>

<h2>1. Executive Summary & Forensic Assessment</h2>
<p>{{ email.explanation_summary }}</p>

<div class="disclaimer-box">
  <strong>Forensic Attribution Standard Notice:</strong> Geolocation coordinates, countries, and autonomous systems referenced in this document represent probable routing and hosting infrastructure derived from deterministic BGP/ASN telemetry. These findings establish infrastructure vectors and do not assert verified physical perpetrator identity or individual residence.
</div>

<h2>2. Envelope Authentication & Spoofing Controls</h2>
<table>
  <thead>
    <tr>
      <th>Authentication Vector</th>
      <th>Evaluated Status</th>
      <th>Forensic Telemetry Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>DMARC Alignment</strong></td>
      <td><span style="font-weight: 700; color: {{ 'red' if email.auth_results.dmarc_status == 'fail' else 'green' }}">{{ email.auth_results.dmarc_status|upper }}</span></td>
      <td>Policy: {{ email.auth_results.dmarc_policy }} — Sender domain alignment verification</td>
    </tr>
    <tr>
      <td><strong>SPF Validation</strong></td>
      <td><span style="font-weight: 700; color: {{ 'red' if email.auth_results.spf_status in ['fail', 'softfail'] else 'green' }}">{{ email.auth_results.spf_status|upper }}</span></td>
      <td>Sending relay authorization against DNS SPF record</td>
    </tr>
    <tr>
      <td><strong>Return-Path Alignment</strong></td>
      <td>{{ 'PASS (Aligned)' if email.auth_results.return_path_aligned else 'FAIL (Misaligned)' }}</td>
      <td>{{ email.auth_results.alignment_note }}</td>
    </tr>
    <tr>
      <td><strong>Display Name Integrity</strong></td>
      <td>{{ 'FAIL (Deceptive)' if email.auth_results.display_name_spoof else 'PASS (Clean)' }}</td>
      <td>{{ email.auth_results.spoof_reason or 'No executive or authority deception identified.' }}</td>
    </tr>
  </tbody>
</table>

<h2>3. MTA Hop Relay & Infrastructure Transit Timeline</h2>
<table>
  <thead>
    <tr>
      <th>Hop #</th>
      <th>Relay IP</th>
      <th>Originating Location</th>
      <th>Transit Delay</th>
      <th>Autonomous System (ASN)</th>
      <th>Forensic Flags</th>
    </tr>
  </thead>
  <tbody>
    {% for hop in email.hops %}
    <tr>
      <td><strong>Hop {{ hop.hop_index }}</strong></td>
      <td><code>{{ hop.ip or 'Internal' }}</code></td>
      <td>{{ hop.city or 'N/A' }}, {{ hop.country or 'N/A' }}</td>
      <td>{{ hop.delay_seconds }}s</td>
      <td>{{ hop.asn or 'N/A' }} ({{ hop.asn_org or 'Enterprise' }})</td>
      <td style="color: #b91c1c; font-size: 11px;">{{ hop.risk_flags|join('; ') or 'Normal transit' }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>

<h2>4. Extracted IOCs, Domain & URL Intelligence</h2>
<table>
  <thead>
    <tr>
      <th>Indicator Type</th>
      <th>Indicator Value</th>
      <th>Risk Score</th>
      <th>Forensic Evaluation</th>
    </tr>
  </thead>
  <tbody>
    {% for u in email.urls %}
    <tr>
      <td><strong>URL</strong></td>
      <td style="word-break: break-all;">{{ u.original_url }}</td>
      <td><strong>{{ u.risk_score }}/100</strong></td>
      <td>{{ u.suspicious_reasons|join(', ') or 'Normal URL' }}</td>
    </tr>
    {% endfor %}
    {% for d in email.domains_intel %}
    <tr>
      <td><strong>Domain</strong></td>
      <td>{{ d.domain }}</td>
      <td><strong>{{ d.risk_score }}/100</strong></td>
      <td>{{ d.reason_summary or 'Standard domain record.' }} (Age: {{ d.age_days }}d)</td>
    </tr>
    {% endfor %}
    {% for att in email.attachments %}
    <tr>
      <td><strong>Attachment</strong></td>
      <td>{{ att.filename }}</td>
      <td><strong>{{ 95 if att.is_malicious else 10 }}/100</strong></td>
      <td>SHA-256: <span class="evidence-hash">{{ att.sha256[:20] }}...</span></td>
    </tr>
    {% endfor %}
  </tbody>
</table>

<h2>5. MITRE ATT&CK Matrix Mapping</h2>
<table>
  <thead>
    <tr>
      <th>Technique ID</th>
      <th>Technique Name</th>
      <th>Tactic</th>
      <th>Forensic Context</th>
    </tr>
  </thead>
  <tbody>
    {% for m in email.mitre_techniques %}
    <tr>
      <td><code>{{ m.id }}</code></td>
      <td><strong>{{ m.name }}</strong></td>
      <td>{{ m.tactic }}</td>
      <td>{{ m.description }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>

<h2>6. Cryptographic Chain of Custody & Evidence Ledger</h2>
<table>
  <thead>
    <tr>
      <th>Evidence Type</th>
      <th>Source Descriptor</th>
      <th>Cryptographic Hash (SHA-256)</th>
      <th>Immutability</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Raw RFC5322 EML Payload</strong></td>
      <td>Primary Ingestion Vault</td>
      <td><span class="evidence-hash">{{ email.sha256 }}</span></td>
      <td><strong style="color: #15803d;">LOCKED / IMMUTABLE</strong></td>
    </tr>
    {% for att in email.attachments %}
    <tr>
      <td><strong>Attachment File</strong></td>
      <td>{{ att.filename }}</td>
      <td><span class="evidence-hash">{{ att.sha256 }}</span></td>
      <td><strong style="color: #15803d;">PRESERVED</strong></td>
    </tr>
    {% endfor %}
  </tbody>
</table>

<div class="signature-block">
  <div class="sign-col">
    <div class="sign-line"></div>
    <div style="font-size: 11px; font-weight: 700; color: #334155;">Lead Forensic Investigator</div>
    <div style="font-size: 10px; color: #64748b;">TRACE-X Cyber Incident Response Team</div>
  </div>
  <div class="sign-col">
    <div class="sign-line"></div>
    <div style="font-size: 11px; font-weight: 700; color: #334155;">Incident Commander / SOC Sign-Off</div>
    <div style="font-size: 10px; color: #64748b;">Digital Forensics & Evidence Registry</div>
  </div>
</div>

<div class="no-print" style="margin-top: 30px; text-align: center;">
  <button onclick="window.print()" style="background: #0284c7; color: #fff; border: none; padding: 10px 20px; font-weight: 700; border-radius: 6px; cursor: pointer; font-size: 14px;">
    🖨️ Print / Save as PDF
  </button>
</div>

</body>
</html>
"""

class ForensicReportGenerator:
    @classmethod
    def generate_html_report(cls, case_number: str, email_data: Dict[str, Any]) -> str:
        template = Template(HTML_REPORT_TEMPLATE)
        now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        rendered = template.render(
            case_number=case_number,
            email=email_data,
            generated_at=now_str
        )
        return rendered
