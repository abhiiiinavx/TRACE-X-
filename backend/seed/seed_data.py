import os
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.db.session import SessionLocal, Base, engine
from backend.app.db.models import User, ForensicCase, Campaign
from backend.app.core.security import get_password_hash
from backend.app.parsing.eml_parser import EmlParser
from backend.app.api.analysis import run_forensic_pipeline

RAW_PAYPAL_EML = """From: "PayPal Account Security" <security-alert@paypa1-security.com>
To: target.victim@enterprise-org.com
Reply-To: security-alert@paypa1-security.com
Return-Path: <bounce@paypa1-security.com>
Subject: URGENT: Your PayPal Account Has Been Suspended - Verify Identity Immediately
Date: Sun, 23 Aug 2026 10:14:00 +0000
Message-ID: <PAYPAL-SEC-94819284@paypa1-security.com>
Authentication-Results: mx.google.com; dkim=fail header.i=@paypa1-security.com; spf=fail (google.com: domain of bounce@paypa1-security.com does not designate 194.36.189.44 as permitted sender) smtp.mailfrom=bounce@paypa1-security.com; dmarc=fail (p=quarantine dis=quarantine) header.from=paypa1-security.com
Received: from mx.google.com (142.250.190.46) by mail.enterprise-org.com with ESMTPS; Sun, 23 Aug 2026 10:14:03 +0000
Received: from mail.paypa1-security.com (194.36.189.44) by mx.google.com with ESMTPS; Sun, 23 Aug 2026 10:14:02 +0000
Received: from vps-gateway.net (185.220.101.5) by mail.paypa1-security.com with SMTP; Sun, 23 Aug 2026 10:14:00 +0000
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>
<html>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd;">
    <h2 style="color: #003087;">PayPal Security Alert</h2>
    <p>Dear Valued Customer,</p>
    <p>We detected unauthorized access attempts on your PayPal account from an unrecognized device in Moscow, Russia. 
    To protect your financial funds, your account has been <strong>temporarily restricted</strong>.</p>
    <p><strong>Action required within 24 hours:</strong> You must verify your credentials immediately to avoid permanent account deactivation and penalties.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://paypa1-security.com/login?session_token=9fa810283" style="background-color: #0070ba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Your Credentials Now</a>
    </p>
    <p>If you do not complete this verification, all pending financial wire transfers and linked bank accounts will be locked.</p>
    <p>Case Reference ID: #PP-849204-REV</p>
  </div>
</body>
</html>
"""

RAW_CEO_BEC_EML = """From: "Johnathan Davis (Chief Executive Officer)" <exec.office.direct@gmail.com>
To: finance.director@enterprise-org.com
Reply-To: ceo.private.remittance@exec-consulting-grp.com
Return-Path: <exec.office.direct@gmail.com>
Subject: CONFIDENTIAL: Urgent Wire Transfer Acquisition Request [Time-Sensitive]
Date: Sun, 23 Aug 2026 11:30:00 +0000
Message-ID: <CEO-EXEC-DIRECT-391829@gmail.com>
Authentication-Results: mx.google.com; spf=softfail (google.com: domain of exec.office.direct@gmail.com does not designate 103.251.167.22 as permitted sender); dmarc=fail
Received: from mail.enterprise-org.com (198.51.100.23) by mx.google.com with ESMTPS; Sun, 23 Aug 2026 11:30:04 +0000
Received: from vps-relayer.africa (103.251.167.22) by mail.enterprise-org.com with SMTP; Sun, 23 Aug 2026 11:30:01 +0000
Content-Type: text/plain; charset=UTF-8

Hi Finance Team,

Are you at your desk right now?

I am currently in an all-day confidential executive board acquisition meeting in Zurich and completely unavailable by phone. Do not call my mobile number.

I need you to urgently process an international wire transfer remittance of $84,500 for our confidential strategic vendor acquisition.
Kindly send the payment to the updated banking coordinates attached immediately to avoid transaction penalties.

Updated Bank Coordinates:
Beneficiary: Global Holdings Mgt LLC
SWIFT / Routing: GLBHDUS33
Account Number: 8849-2910-4491

Please confirm as soon as the wire transfer remittance advice receipt is generated. Treat this with utmost confidentiality.

Regards,
Johnathan Davis
Chief Executive Officer
Enterprise Systems Corp
"""

RAW_DHL_MALWARE_EML = """From: "DHL Express Delivery Tracking" <dispatch@fedex-tracking-doc.xyz>
To: recipient@enterprise-org.com
Subject: Shipment Notice: Courier Delivery Manifest & Custom Clearance Invoice #DHL-98421
Date: Sun, 23 Aug 2026 09:10:00 +0000
Message-ID: <DHL-DISPATCH-99182@fedex-tracking-doc.xyz>
Authentication-Results: mx.google.com; dkim=none; spf=fail (185.220.101.5); dmarc=fail
Received: from mail.enterprise-org.com (198.51.100.23) by mx.google.com with ESMTPS; Sun, 23 Aug 2026 09:10:05 +0000
Received: from tor-relay-05.de (185.220.101.5) by mail.fedex-tracking-doc.xyz with SMTP; Sun, 23 Aug 2026 09:10:00 +0000
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="====BOUNDARY_MALWARE===="

--====BOUNDARY_MALWARE====
Content-Type: text/html; charset=UTF-8

<p>Dear Customer,</p>
<p>Your incoming DHL express consignment #DHL-98421 is currently on hold at central customs dispatch.</p>
<p>Please review the attached shipping manifest and customs declaration document immediately to avoid return to sender.</p>
<p>Enable editing or content permissions to view the customs clearance seal.</p>

--====BOUNDARY_MALWARE====
Content-Type: application/octet-stream; name="DHL_Customs_Declaration_Doc.exe"
Content-Disposition: attachment; filename="DHL_Customs_Declaration_Doc.exe"
Content-Transfer-Encoding: base64

TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAyAAAAA4fug4AtAnNIbgBTM0hVGhpcyBwcm9ncmFtIGNhbm5vdCBiZSBydW4gaW4gRE9TIG1v
ZGUuDQ0KJAAAAAAAAABQRQAATAEDAAAAAAAAAAAAAAAAAAAA
--====BOUNDARY_MALWARE====--
"""

RAW_M365_OAUTH_EML = """From: "Microsoft 365 Security Operations" <no-reply@auth-microsoft365-verify.com>
To: employee@enterprise-org.com
Subject: Action Required: Microsoft 365 Password Expiration & Session Authentication Required
Date: Sun, 23 Aug 2026 12:45:00 +0000
Message-ID: <MS-OAUTH-4819284@auth-microsoft365-verify.com>
Authentication-Results: mx.google.com; spf=fail (45.142.214.78); dmarc=fail
Received: from mx.google.com (142.250.190.46) by mail.enterprise-org.com with ESMTPS; Sun, 23 Aug 2026 12:45:03 +0000
Received: from proxy-server.nl (45.142.214.78) by auth-microsoft365-verify.com with SMTP; Sun, 23 Aug 2026 12:45:00 +0000
Content-Type: text/html; charset=UTF-8

<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <h3 style="color: #0078d4;">Microsoft 365 Account Security</h3>
  <p>Your enterprise Microsoft 365 single-sign-on password will expire within <strong>12 hours</strong>.</p>
  <p>To retain access to your corporate Outlook mailbox and OneDrive documents, re-authenticate your session now.</p>
  <p><a href="http://bit.ly/m365-session-verify" style="color: #0078d4; font-weight: bold;">Click here to keep current password and verify session</a></p>
</div>
"""

RAW_CLEAN_CORP_EML = """From: "TechInsider Weekly" <updates@techinsider.org>
To: subscriber@enterprise-org.com
Subject: TechInsider Digest #142: AI-Powered Cyber Defenses and Zero Trust Architectures
Date: Sun, 23 Aug 2026 07:00:00 +0000
Message-ID: <NEWSLETTER-TI-77291@techinsider.org>
Authentication-Results: mx.google.com; dkim=pass header.i=@techinsider.org; spf=pass (google.com: domain of updates@techinsider.org designates 142.250.190.46 as permitted sender); dmarc=pass (p=reject) header.from=techinsider.org
Received: from mail.techinsider.org (142.250.190.46) by mx.google.com with ESMTPS; Sun, 23 Aug 2026 07:00:02 +0000
Content-Type: text/plain; charset=UTF-8

Hello Tech Community,

Welcome to issue #142 of TechInsider Weekly. This week we dive into modern SIEM telemetry, graph correlation, and cloud-native security automation.

Read the full research paper on our official portal: https://techinsider.org/articles/zero-trust-2026

Best regards,
Editorial Team
"""

def seed_database(db: Session):
    # 1. Create Base Tables
    Base.metadata.create_all(bind=engine)

    # 2. Seed Default Users
    admin_user = db.query(User).filter(User.email == "admin@tracex.forensics").first()
    if not admin_user:
        admin_user = User(
            email="admin@tracex.forensics",
            password_hash=get_password_hash("tracex_admin_2026"),
            full_name="Chief Information Security Officer",
            role="admin"
        )
        db.add(admin_user)

    investigator_user = db.query(User).filter(User.email == "investigator@tracex.forensics").first()
    if not investigator_user:
        investigator_user = User(
            email="investigator@tracex.forensics",
            password_hash=get_password_hash("investigator_pass_2026"),
            full_name="Lead Cyber Incident Responder",
            role="investigator"
        )
        db.add(investigator_user)

    analyst_user = db.query(User).filter(User.email == "analyst@tracex.forensics").first()
    if not analyst_user:
        analyst_user = User(
            email="analyst@tracex.forensics",
            password_hash=get_password_hash("analyst_pass_2026"),
            full_name="Digital Forensics Specialist",
            role="analyst"
        )
        db.add(analyst_user)

    db.commit()

    # 3. Seed Campaigns
    c1 = db.query(Campaign).filter(Campaign.name.ilike("%DarkPhish%")).first()
    if not c1:
        c1 = Campaign(
            name="Campaign #17 — Operation DarkPhish (PayPal & Financial)",
            description="Multi-tier phishing infrastructure impersonating financial institutions with homoglyph domains hosted on bulletproof Russian/Offshore ASNs.",
            primary_threat_type="Credential Phishing",
            confidence=92,
            email_count=12,
            domain_count=4,
            ip_count=3,
            asn_count=2,
            country_count=3,
            shared_signatures={
                "domains": ["paypa1-security.com", "paypal-service-alert.com"],
                "ips": ["194.36.189.44", "185.220.101.5"],
                "asns": ["AS48282 BalkanHost", "AS205100 Tor Exit Relay"],
                "techniques": ["Homoglyph substitution", "Bulletproof Russian hosting"]
            }
        )
        db.add(c1)

    c2 = db.query(Campaign).filter(Campaign.name.ilike("%Wire-Spider%")).first()
    if not c2:
        c2 = Campaign(
            name="Campaign #04 — FIN-Wire-Spider (Executive BEC)",
            description="Targeted Business Email Compromise (BEC) and executive impersonation campaign utilizing spoofed CEO display names and urgent wire requests.",
            primary_threat_type="BEC / CEO Fraud",
            confidence=88,
            email_count=8,
            domain_count=3,
            ip_count=2,
            asn_count=2,
            country_count=2,
            shared_signatures={
                "domains": ["exec-consulting-grp.com", "global-holdings-mgt.com"],
                "ips": ["103.251.167.22", "198.51.100.23"],
                "asns": ["AS37282 MainOne", "AS16509 Amazon AWS"],
                "techniques": ["Display name spoofing", "Urgent wire keyword pattern"]
            }
        )
        db.add(c2)

    c3 = db.query(Campaign).filter(Campaign.name.ilike("%GlobalLogistics%")).first()
    if not c3:
        c3 = Campaign(
            name="Campaign #22 — GlobalLogistics-Infostealer (AgentTesla)",
            description="High-volume spearphishing campaign delivering AgentTesla info-stealers disguised as shipping invoices and courier manifests.",
            primary_threat_type="Malware Delivery",
            confidence=95,
            email_count=15,
            domain_count=5,
            ip_count=4,
            asn_count=3,
            country_count=3,
            shared_signatures={
                "domains": ["fedex-tracking-doc.xyz", "dhl-express-dispatch.top"],
                "ips": ["185.220.101.5", "45.142.214.78"],
                "asns": ["AS205100 Tor Exit Relay", "AS50673 Serverius"],
                "techniques": ["Weaponized executable attachment", "Disposable .xyz registrar"]
            }
        )
        db.add(c3)

    db.commit()

    # 4. Seed the 5 High-Fidelity Forensic Cases
    samples = [
        ("PayPal Phish", RAW_PAYPAL_EML),
        ("CEO Wire BEC", RAW_CEO_BEC_EML),
        ("DHL Infostealer", RAW_DHL_MALWARE_EML),
        ("M365 OAuth Token Phish", RAW_M365_OAUTH_EML),
        ("TechInsider Clean Newsletter", RAW_CLEAN_CORP_EML)
    ]

    for label, raw_eml in samples:
        parsed = EmlParser.parse_eml_bytes(raw_eml.encode("utf-8"))
        # Check if already seeded by sha256
        existing = db.query(ForensicCase).filter(ForensicCase.title.ilike(f"%{parsed['subject'][:30]}%")).first()
        if not existing:
            run_forensic_pipeline(parsed, db, user_email="investigator@tracex.forensics")

    print("[SUCCESS] TRACE-X Seed Data Successfully Loaded!")

if __name__ == "__main__":
    db = SessionLocal()
    seed_database(db)
    db.close()
