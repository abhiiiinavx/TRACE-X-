// Deterministic client-side mock & offline fallback data for TRACE-X
// Guarantees that all 11 forensic pipeline stages, maps, graphs, searches, and buttons work 100% reliably

export const MOCK_SAMPLES = [
  {
    id: "sample-paypal-phish",
    name: "PayPal Phishing & Identity Harvesting",
    threat_type: "Credential Phishing",
    severity: "CRITICAL",
    risk_score: 96,
    from_addr: "security-alert@paypa1-security.com",
    from_display_name: "PayPal Account Security",
    to_addr: "target.victim@enterprise-org.com",
    subject: "URGENT: Your PayPal Account Has Been Suspended - Verify Identity Immediately",
    date_header: "Sun, 23 Aug 2026 10:14:00 +0000",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    classification: "Confirmed Threat (High Risk)",
    explanation_summary: "High-confidence credential harvesting attack leveraging a lookalike typosquatted domain ('paypa1-security.com'), complete DMARC/SPF/DKIM cryptographic validation failure, deceptive urgency cues, and an untrusted VPS origin relay located in Moscow, Russia.",
    auth_results: {
      dmarc_status: "fail",
      dmarc_policy: "quarantine",
      dmarc_reported: "dmarc=fail (p=quarantine dis=quarantine)",
      spf_status: "fail",
      spf_reported: "spf=fail (domain does not designate 194.36.189.44)",
      dkim_status: "fail",
      dkim_reported: "dkim=fail header.i=@paypa1-security.com",
      return_path_aligned: false,
      alignment_note: "Return-Path domain 'paypa1-security.com' is an unauthenticated lookalike domain.",
      verification_method: "Header-Reported MTA Evidence & Local Alignment"
    },
    body_html_sanitized: `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #003087; margin-top: 0;">PayPal Security Alert</h2>
      <p>Dear Valued Customer,</p>
      <p>We detected unauthorized access attempts on your PayPal account from an unrecognized device in Moscow, Russia. To protect your financial funds, your account has been <strong>temporarily restricted</strong>.</p>
      <p><strong>Action required within 24 hours:</strong> You must verify your credentials immediately to avoid permanent account deactivation and penalties.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://paypa1-security.com/login?session_token=9fa810283" style="background-color: #0070ba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Your Credentials Now</a>
      </p>
      <p style="color: #666; font-size: 12px;">If you do not complete this verification, all pending financial wire transfers and linked bank accounts will be locked.</p>
      <p style="color: #888; font-size: 11px;">Case Reference ID: #PP-849204-REV</p>
    </div>`,
    body_plain_snippet: "Dear Valued Customer, We detected unauthorized access attempts on your PayPal account from Moscow, Russia. You must verify your credentials within 24 hours at https://paypa1-security.com/login.",
    feature_breakdown: [
      { category: "Authentication", feature: "DMARC Cryptographic Failure", evidence: "DMARC policy failed with quarantine enforcement", impact: 35, confidence: 99 },
      { category: "Domain Intel", feature: "Lookalike Typosquatting", evidence: "paypa1-security.com impersonates PayPal brand with digit substitution ('1' for 'l')", impact: 30, confidence: 98 },
      { category: "Network Hop", feature: "High-Risk Origin Relay", evidence: "Origin IP 185.220.101.5 routed via known Tor exit node / bulletproof host", impact: 20, confidence: 95 },
      { category: "Content NLP", feature: "High-Urgency Threat Pattern", evidence: "Detected coercive urgency keywords ('immediately', '24 hours', 'locked')", impact: 11, confidence: 90 }
    ],
    hops: [
      {
        hop_index: 1,
        ip: "185.220.101.5",
        from_host: "tor-relay-05.de",
        by_host: "mail.paypa1-security.com",
        delay_seconds: 0,
        asn: "AS48282",
        asn_org: "Bulletproof VPS Hosting",
        country: "DE",
        city: "Frankfurt",
        risk_flags: ["Known Tor Exit Node", "Anomalous Routing Delay"]
      },
      {
        hop_index: 2,
        ip: "194.36.189.44",
        from_host: "mail.paypa1-security.com",
        by_host: "mx.google.com",
        delay_seconds: 2,
        asn: "AS51167",
        asn_org: "Contabo Hosting LLC",
        country: "RU",
        city: "Moscow",
        risk_flags: ["Typosquatted Sender Domain MTA"]
      },
      {
        hop_index: 3,
        ip: "142.250.190.46",
        from_host: "mx.google.com",
        by_host: "mail.enterprise-org.com",
        delay_seconds: 1,
        asn: "AS15169",
        asn_org: "Google LLC Gateway",
        country: "US",
        city: "Mountain View",
        risk_flags: []
      }
    ],
    ips_intel: [
      {
        ip: "185.220.101.5",
        latitude: 50.1109,
        longitude: 8.6821,
        city: "Frankfurt",
        country: "Germany",
        country_code: "DE",
        isp: "Tor Exit Relay Network",
        asn: "AS48282",
        asn_org: "Bulletproof VPS Hosting",
        reputation: "MALICIOUS",
        threat_score: 95,
        associated_campaign: "DarkGate Credential Harvester",
        open_ports: [80, 443, 9001],
        is_tor_exit: true,
        is_vpn: true,
        provenance: "OBSERVED"
      },
      {
        ip: "194.36.189.44",
        latitude: 55.7558,
        longitude: 37.6173,
        city: "Moscow",
        country: "Russia",
        country_code: "RU",
        isp: "Contabo Dedicated Hosting",
        asn: "AS51167",
        asn_org: "Contabo LLC",
        reputation: "SUSPICIOUS",
        threat_score: 88,
        associated_campaign: "FinPhish Impersonation Cluster",
        open_ports: [25, 80, 443],
        is_tor_exit: false,
        is_vpn: false,
        provenance: "OBSERVED"
      }
    ],
    domains_intel: [
      {
        domain: "paypa1-security.com",
        is_lookalike: true,
        impersonated_brand: "PayPal",
        age_days: 3,
        registrar: "NameCheap Inc. (Privacy Protected)",
        reputation: "MALICIOUS",
        risk_score: 98,
        reason_summary: "High-confidence homoglyph typosquatting ('1' instead of 'l'). Domain registered 3 days ago.",
        dns_records: { A: ["194.36.189.44"], MX: ["mail.paypa1-security.com"] }
      }
    ],
    urls: [
      {
        original_url: "https://paypa1-security.com/login?session_token=9fa810283",
        domain: "paypa1-security.com",
        risk_score: 98,
        is_credential_harvester: true,
        is_shortened: false
      }
    ],
    attachments: [],
    mitre_techniques: [
      { id: "T1566.002", name: "Phishing: Spearphishing Link", description: "Adversary sent deceptive link to fake login page" },
      { id: "T1583.001", name: "Acquire Infrastructure: Domains", description: "Purchased typosquatted domain paypa1-security.com" },
      { id: "T1598", name: "Phishing for Information", description: "Harvesting user payment credentials via urgency lures" }
    ],
    campaign_association: {
      matched: true,
      campaign_id: "camp-finphish-2026",
      campaign_name: "FinPhish Banking Harvest 2026",
      confidence: 94,
      description: "Coordinated European banking and payment credential harvesting campaign utilizing newly registered .com and .security domains hosted on AS51167 infrastructure.",
      shared_signals: [
        "Homoglyph brand replacement pattern (*-security.com)",
        "Origin transit through AS48282 Tor egress nodes",
        "Matching session_token URL telemetry structure"
      ]
    }
  },
  {
    id: "sample-ceo-bec",
    name: "Urgent CEO Wire Transfer Remittance (BEC)",
    threat_type: "Business Email Compromise (BEC)",
    severity: "CRITICAL",
    risk_score: 92,
    from_addr: "exec.office.direct@gmail.com",
    from_display_name: "Johnathan Davis (Chief Executive Officer)",
    to_addr: "finance.director@enterprise-org.com",
    subject: "CONFIDENTIAL: Urgent Wire Transfer Acquisition Request [Time-Sensitive]",
    date_header: "Sun, 23 Aug 2026 11:30:00 +0000",
    sha256: "7c5e2d1a3b4f6e8d9c0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
    classification: "Confirmed Threat (High Risk)",
    explanation_summary: "High-impact Business Email Compromise (BEC) attack executing executive impersonation of the CEO. Attack uses external free webmail with misleading display name, coercive instructions prohibiting phone calls, and request for confidential $84,500 wire transfer.",
    auth_results: {
      dmarc_status: "fail",
      dmarc_policy: "none",
      dmarc_reported: "dmarc=fail (unauthorized sender IP for company domain)",
      spf_status: "softfail",
      spf_reported: "spf=softfail (gmail.com does not designate 103.251.167.22)",
      dkim_status: "fail",
      dkim_reported: "dkim=fail (unverified signature)",
      return_path_aligned: false,
      alignment_note: "Reply-To address 'ceo.private.remittance@exec-consulting-grp.com' differs from From address.",
      verification_method: "Header-Reported MTA Evidence & Local Alignment"
    },
    body_html_sanitized: `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <p>Hi Finance Team,</p>
      <p>Are you at your desk right now?</p>
      <p>I am currently in an all-day confidential executive board acquisition meeting in Zurich and completely unavailable by phone. <strong>Do not call my mobile number.</strong></p>
      <p>I need you to urgently process an international wire transfer remittance of <strong>$84,500</strong> for our confidential strategic vendor acquisition. Kindly send the payment to the updated banking coordinates immediately.</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 0; font-weight: bold;">Beneficiary: Global Holdings Mgt LLC</p>
        <p style="margin: 4px 0 0;">SWIFT / Routing: GLBHDUS33</p>
        <p style="margin: 4px 0 0;">Account Number: 8849-2910-4491</p>
      </div>
      <p>Please confirm as soon as the wire remittance advice receipt is generated.</p>
      <p>Regards,<br><strong>Johnathan Davis</strong><br>Chief Executive Officer</p>
    </div>`,
    body_plain_snippet: "Hi Finance Team, I am in an all-day confidential board meeting in Zurich. Need you to process an international wire transfer of $84,500 immediately to Global Holdings Mgt LLC.",
    feature_breakdown: [
      { category: "Executive Impersonation", feature: "CEO Display Name Spoofing", evidence: "Display name claims CEO identity but sender uses gmail.com", impact: 35, confidence: 99 },
      { category: "Financial Fraud", feature: "Wire Transfer Solicitation", evidence: "Direct request for $84,500 wire transfer with external bank coordinates", impact: 30, confidence: 96 },
      { category: "Channel Manipulation", feature: "Out-of-Band Verification Block", evidence: "Explicit directive: 'completely unavailable by phone. Do not call my mobile'", impact: 18, confidence: 92 },
      { category: "Authentication", feature: "Reply-To Header Divergence", evidence: "Reply-To redirected to third-party lookalike domain exec-consulting-grp.com", impact: 9, confidence: 88 }
    ],
    hops: [
      {
        hop_index: 1,
        ip: "103.251.167.22",
        from_host: "vps-relayer.africa",
        by_host: "mail.enterprise-org.com",
        delay_seconds: 3,
        asn: "AS37100",
        asn_org: "SEACOM South Africa",
        country: "ZA",
        city: "Johannesburg",
        risk_flags: ["Anomalous Origin Location for Corporate Executive"]
      },
      {
        hop_index: 2,
        ip: "198.51.100.23",
        from_host: "mail.enterprise-org.com",
        by_host: "mx.google.com",
        delay_seconds: 1,
        asn: "AS15169",
        asn_org: "Google Mail Infrastructure",
        country: "US",
        city: "Mountain View",
        risk_flags: []
      }
    ],
    ips_intel: [
      {
        ip: "103.251.167.22",
        latitude: -26.2041,
        longitude: 28.0473,
        city: "Johannesburg",
        country: "South Africa",
        country_code: "ZA",
        isp: "SEACOM Network Transit",
        asn: "AS37100",
        asn_org: "SEACOM Internet Provider",
        reputation: "SUSPICIOUS",
        threat_score: 82,
        associated_campaign: "Apex Executive BEC Syndicate",
        open_ports: [25, 587],
        is_tor_exit: false,
        is_vpn: false,
        provenance: "OBSERVED"
      }
    ],
    domains_intel: [
      {
        domain: "exec-consulting-grp.com",
        is_lookalike: true,
        impersonated_brand: "Executive Advisory",
        age_days: 12,
        registrar: "Tucows Domains Inc.",
        reputation: "SUSPICIOUS",
        risk_score: 79,
        reason_summary: "Newly registered domain used exclusively as Reply-To drop for BEC wire transfer fraud.",
        dns_records: { A: ["103.251.167.22"], MX: ["mail.exec-consulting-grp.com"] }
      }
    ],
    urls: [],
    attachments: [],
    mitre_techniques: [
      { id: "T1566.001", name: "Phishing: Spearphishing Attachment / Text", description: "Targeted message directed specifically at finance department personnel" },
      { id: "T1589.002", name: "Gather Victim Identity: Email Addresses", description: "Harvested internal organization hierarchy to target CEO-CFO communication path" },
      { id: "T1656", name: "Impersonation", description: "Posing as Chief Executive Officer to bypass payment authorization protocols" }
    ],
    campaign_association: {
      matched: true,
      campaign_id: "camp-bec-wire-2026",
      campaign_name: "Apex Executive BEC Syndicate",
      confidence: 91,
      description: "Well-documented business email compromise syndicate targeting mid-market accounting personnel with simulated merger & acquisition wire remittances.",
      shared_signals: [
        "Subject formatting matching regex 'CONFIDENTIAL: Urgent Wire Transfer.*'",
        "Specific banking routing format GLBHDUS33",
        "SEACOM South Africa BGP routing path (AS37100)"
      ]
    }
  },
  {
    id: "sample-dhl-malware",
    name: "DHL Customs Declaration Trojan Executable",
    threat_type: "Malware Attachment",
    severity: "CRITICAL",
    risk_score: 99,
    from_addr: "dispatch@fedex-tracking-doc.xyz",
    from_display_name: "DHL Express Delivery Tracking",
    to_addr: "recipient@enterprise-org.com",
    subject: "Shipment Notice: Courier Delivery Manifest & Custom Clearance Invoice #DHL-98421",
    date_header: "Sun, 23 Aug 2026 09:10:00 +0000",
    sha256: "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
    classification: "Confirmed Threat (High Risk)",
    explanation_summary: "Critical malware distribution payload. Sender masquerades as DHL using lookalike brand domain 'fedex-tracking-doc.xyz', delivering a disguised Windows PE executable attachment ('DHL_Customs_Declaration_Doc.exe') with embedded Trojan loader signatures.",
    auth_results: {
      dmarc_status: "fail",
      dmarc_policy: "quarantine",
      dmarc_reported: "dmarc=fail; spf=fail (185.220.101.5)",
      spf_status: "fail",
      spf_reported: "spf=fail (sender IP not authorized)",
      dkim_status: "fail",
      dkim_reported: "dkim=none (no signature present)",
      return_path_aligned: false,
      alignment_note: "Sender domain has no valid SPF/DKIM records.",
      verification_method: "Header-Reported MTA Evidence & Local Alignment"
    },
    body_html_sanitized: `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h3 style="color: #d40511;">DHL Express Consignment Notice</h3>
      <p>Dear Customer,</p>
      <p>Your incoming DHL express consignment <strong>#DHL-98421</strong> is currently on hold at central customs dispatch.</p>
      <p>Please review the attached shipping manifest and customs declaration document immediately to avoid return to sender.</p>
      <p style="color: #666; font-size: 12px;">Attached File: DHL_Customs_Declaration_Doc.exe (Protected PE Binary)</p>
    </div>`,
    body_plain_snippet: "Your incoming DHL consignment #DHL-98421 is on hold. Please review the attached customs declaration document immediately.",
    feature_breakdown: [
      { category: "Payload", feature: "Executable Attachment in Email", evidence: "Detected Windows executable binary (MZ/PE header) in attachment", impact: 45, confidence: 100 },
      { category: "Authentication", feature: "SPF/DMARC Total Failure", evidence: "No valid cryptographic sender identity verified", impact: 25, confidence: 99 },
      { category: "Brand Spoofing", feature: "Courier Brand Confusion", evidence: "DHL display name paired with fedex-tracking-doc.xyz domain", impact: 20, confidence: 95 },
      { category: "Network Origin", feature: "Known Botnet Infrastructure", evidence: "Origin IP 185.220.101.5 matches known malware relay cluster", impact: 9, confidence: 90 }
    ],
    hops: [
      {
        hop_index: 1,
        ip: "185.220.101.5",
        from_host: "tor-relay-05.de",
        by_host: "mail.fedex-tracking-doc.xyz",
        delay_seconds: 0,
        asn: "AS48282",
        asn_org: "Bulletproof VPS Hosting",
        country: "DE",
        city: "Frankfurt",
        risk_flags: ["Malware Distribution Relay"]
      },
      {
        hop_index: 2,
        ip: "198.51.100.23",
        from_host: "mail.enterprise-org.com",
        by_host: "mx.google.com",
        delay_seconds: 2,
        asn: "AS15169",
        asn_org: "Google Mail",
        country: "US",
        city: "Mountain View",
        risk_flags: []
      }
    ],
    ips_intel: [
      {
        ip: "185.220.101.5",
        latitude: 50.1109,
        longitude: 8.6821,
        city: "Frankfurt",
        country: "Germany",
        country_code: "DE",
        isp: "Tor Exit Relay",
        asn: "AS48282",
        asn_org: "Bulletproof VPS",
        reputation: "MALICIOUS",
        threat_score: 99,
        associated_campaign: "DarkGate Trojan Distribution",
        open_ports: [80, 443, 9001],
        is_tor_exit: true,
        is_vpn: true,
        provenance: "OBSERVED"
      }
    ],
    domains_intel: [
      {
        domain: "fedex-tracking-doc.xyz",
        is_lookalike: true,
        impersonated_brand: "FedEx / DHL",
        age_days: 1,
        registrar: "Hostinger Operations",
        reputation: "MALICIOUS",
        risk_score: 99,
        reason_summary: "Suspicious courier brand confusion domain registered 1 day ago.",
        dns_records: { A: ["185.220.101.5"] }
      }
    ],
    urls: [],
    attachments: [
      {
        filename: "DHL_Customs_Declaration_Doc.exe",
        size_bytes: 84920,
        content_type: "application/x-dosexec",
        sha256: "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
        is_malicious: true,
        threat_label: "Win32.Trojan.AgentTesla"
      }
    ],
    mitre_techniques: [
      { id: "T1566.001", name: "Phishing: Spearphishing Attachment", description: "Malicious PE executable payload delivered via email" },
      { id: "T1204.002", name: "User Execution: Malicious File", description: "Lures recipient to execute shipment document" },
      { id: "T1059.003", name: "Command and Scripting Interpreter: Windows Command Shell", description: "Trojan drops secondary stage commands" }
    ],
    campaign_association: {
      matched: true,
      campaign_id: "camp-agenttesla-2026",
      campaign_name: "AgentTesla Global Courier Lure",
      confidence: 96,
      description: "High-volume commodity malware distribution using shipping notifications and disguised customs documents to install info-stealing trojans.",
      shared_signals: [
        "Attachment hash pattern matching AgentTesla stager",
        "Bulletproof hosting ASN 48282",
        "XYZ generic top-level domain abuse"
      ]
    }
  },
  {
    id: "sample-m365-oauth",
    name: "Microsoft 365 Password Expiration (OAuth Phish)",
    threat_type: "Credential Phishing",
    severity: "HIGH",
    risk_score: 86,
    from_addr: "no-reply@auth-microsoft365-verify.com",
    from_display_name: "Microsoft 365 Security Operations",
    to_addr: "employee@enterprise-org.com",
    subject: "Action Required: Microsoft 365 Password Expiration & Session Authentication Required",
    date_header: "Sun, 23 Aug 2026 12:45:00 +0000",
    sha256: "3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a",
    classification: "Confirmed Threat (High Risk)",
    explanation_summary: "Targeted Microsoft 365 credential theft campaign. Message uses authentic-looking M365 styling with high-urgency expiration warnings ('expire within 12 hours') pointing to a shortened tracking link resolving to an unauthorized Azure app registration.",
    auth_results: {
      dmarc_status: "fail",
      dmarc_policy: "none",
      dmarc_reported: "dmarc=fail (unauthorized sender domain)",
      spf_status: "fail",
      spf_reported: "spf=fail (45.142.214.78)",
      dkim_status: "unverified",
      dkim_reported: "dkim=none",
      return_path_aligned: false,
      alignment_note: "Domain 'auth-microsoft365-verify.com' is not operated by Microsoft Corporation.",
      verification_method: "Header-Reported MTA Evidence & Local Alignment"
    },
    body_html_sanitized: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h3 style="color: #0078d4; margin-top: 0;">Microsoft 365 Account Security</h3>
      <p>Your enterprise Microsoft 365 single-sign-on password will expire within <strong>12 hours</strong>.</p>
      <p>To retain access to your corporate Outlook mailbox and OneDrive documents, re-authenticate your session now.</p>
      <p style="margin: 20px 0;"><a href="http://bit.ly/m365-session-verify" style="color: #0078d4; font-weight: bold;">Click here to keep current password and verify session</a></p>
    </div>`,
    body_plain_snippet: "Your enterprise Microsoft 365 password will expire within 12 hours. Click here to keep current password and verify session.",
    feature_breakdown: [
      { category: "Domain Spoofing", feature: "Microsoft Lookalike Domain", evidence: "Domain auth-microsoft365-verify.com typosquats Microsoft 365 brand", impact: 32, confidence: 98 },
      { category: "Authentication", feature: "SPF/DMARC Failure", evidence: "Sender IP 45.142.214.78 not authorized by Microsoft SPF", impact: 28, confidence: 97 },
      { category: "URL Evasion", feature: "Shortened / Obfuscated Link", evidence: "Link uses bit.ly URL shortener to hide actual destination", impact: 16, confidence: 92 },
      { category: "NLP Lures", feature: "Password Expiration Pressure", evidence: "False 12-hour expiration deadline triggers compliance reflex", impact: 10, confidence: 88 }
    ],
    hops: [
      {
        hop_index: 1,
        ip: "45.142.214.78",
        from_host: "proxy-server.nl",
        by_host: "auth-microsoft365-verify.com",
        delay_seconds: 0,
        asn: "AS200019",
        asn_org: "Alexhost SRL",
        country: "NL",
        city: "Amsterdam",
        risk_flags: ["Offshore Proxy Host"]
      },
      {
        hop_index: 2,
        ip: "142.250.190.46",
        from_host: "mx.google.com",
        by_host: "mail.enterprise-org.com",
        delay_seconds: 1,
        asn: "AS15169",
        asn_org: "Google Mail Gateway",
        country: "US",
        city: "Mountain View",
        risk_flags: []
      }
    ],
    ips_intel: [
      {
        ip: "45.142.214.78",
        latitude: 52.3676,
        longitude: 4.9041,
        city: "Amsterdam",
        country: "Netherlands",
        country_code: "NL",
        isp: "Alexhost SRL Dedicated Hosting",
        asn: "AS200019",
        asn_org: "Alexhost SRL",
        reputation: "MALICIOUS",
        threat_score: 89,
        associated_campaign: "M365 OAuth Token Theft",
        open_ports: [80, 443],
        is_tor_exit: false,
        is_vpn: true,
        provenance: "OBSERVED"
      }
    ],
    domains_intel: [
      {
        domain: "auth-microsoft365-verify.com",
        is_lookalike: true,
        impersonated_brand: "Microsoft 365",
        age_days: 5,
        registrar: "NameCheap Inc.",
        reputation: "MALICIOUS",
        risk_score: 92,
        reason_summary: "Brand impersonation domain registered 5 days ago to host phishing landing pages.",
        dns_records: { A: ["45.142.214.78"] }
      }
    ],
    urls: [
      {
        original_url: "http://bit.ly/m365-session-verify",
        domain: "bit.ly",
        risk_score: 85,
        is_credential_harvester: true,
        is_shortened: true
      }
    ],
    attachments: [],
    mitre_techniques: [
      { id: "T1566.002", name: "Phishing: Spearphishing Link", description: "Delivered bit.ly shortened redirect to fake login" },
      { id: "T1528", name: "Steal Application Access Token", description: "Attempting to obtain illicit OAuth consent token" }
    ],
    campaign_association: {
      matched: true,
      campaign_id: "camp-m365-oauth-2026",
      campaign_name: "M365 Illicit Consent & Token Theft",
      confidence: 88,
      description: "Targeted enterprise credential and OAuth authorization token harvesting utilizing Microsoft 365 expiration alerts.",
      shared_signals: [
        "bit.ly short link redirect structure",
        "Alexhost Netherlands IP transit AS200019"
      ]
    }
  },
  {
    id: "sample-aws-legit",
    name: "Amazon Web Services Billing Invoice (Clean / Authenticated)",
    threat_type: "Clean / Benign",
    severity: "LOW",
    risk_score: 4,
    from_addr: "no-reply-aws@amazon.com",
    from_display_name: "Amazon Web Services",
    to_addr: "billing.contact@enterprise-org.com",
    subject: "Amazon Web Services Invoice Available for Account #8492-1920-4491",
    date_header: "Sun, 23 Aug 2026 08:00:00 +0000",
    sha256: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    classification: "Authentic / Benign",
    explanation_summary: "Legitimate, fully authenticated commercial invoice notification. Cryptographic DMARC, SPF, and DKIM signatures verified with 100% envelope alignment from Amazon's official corporate infrastructure.",
    auth_results: {
      dmarc_status: "pass",
      dmarc_policy: "reject",
      dmarc_reported: "dmarc=pass (p=reject sp=reject dis=none)",
      spf_status: "pass",
      spf_reported: "spf=pass (amazon.com designates 54.240.11.23 as permitted sender)",
      dkim_status: "pass",
      dkim_reported: "dkim=pass header.i=@amazon.com",
      return_path_aligned: true,
      alignment_note: "Return-Path domain 'amazon.com' perfectly aligns with From header.",
      verification_method: "Header-Reported MTA Evidence & Local Alignment"
    },
    body_html_sanitized: `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h3 style="color: #232f3e; margin-top: 0;">Amazon Web Services Invoice</h3>
      <p>Hello AWS Customer,</p>
      <p>Your monthly billing invoice for account <strong>#8492-1920-4491</strong> is now ready to download in the AWS Billing Console.</p>
      <p>Total Monthly Charges: $342.18 USD.</p>
      <p style="margin: 20px 0;"><a href="https://console.aws.amazon.com/billing" style="background-color: #ff9900; color: #111; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Billing Console</a></p>
    </div>`,
    body_plain_snippet: "Your monthly AWS invoice for account #8492-1920-4491 is ready in the AWS Billing Console. Total: $342.18 USD.",
    feature_breakdown: [
      { category: "Authentication", feature: "DMARC Cryptographic Pass", evidence: "Verified dmarc=pass with strict reject policy alignment", impact: -30, confidence: 100 },
      { category: "Authentication", feature: "DKIM Signature Match", evidence: "Cryptographic 2048-bit RSA DKIM signature verified (@amazon.com)", impact: -25, confidence: 100 },
      { category: "Authentication", feature: "SPF Envelope Alignment", evidence: "Authorized sending MTA 54.240.11.23 is valid Amazon SES IP", impact: -20, confidence: 100 },
      { category: "Domain Reputation", feature: "Established Corporate Domain", evidence: "amazon.com is an authentic, highly trusted domain", impact: -15, confidence: 100 }
    ],
    hops: [
      {
        hop_index: 1,
        ip: "54.240.11.23",
        from_host: "a11-23.smtp-out.amazonses.com",
        by_host: "mx.google.com",
        delay_seconds: 1,
        asn: "AS16509",
        asn_org: "Amazon.com Inc.",
        country: "US",
        city: "Seattle",
        risk_flags: []
      }
    ],
    ips_intel: [
      {
        ip: "54.240.11.23",
        latitude: 47.6062,
        longitude: -122.3321,
        city: "Seattle",
        country: "United States",
        country_code: "US",
        isp: "Amazon.com Inc.",
        asn: "AS16509",
        asn_org: "Amazon Web Services",
        reputation: "CLEAN",
        threat_score: 1,
        open_ports: [25, 443],
        is_tor_exit: false,
        is_vpn: false,
        provenance: "OBSERVED"
      }
    ],
    domains_intel: [
      {
        domain: "amazon.com",
        is_lookalike: false,
        impersonated_brand: "Amazon",
        age_days: 10420,
        registrar: "MarkMonitor Inc.",
        reputation: "CLEAN",
        risk_score: 1,
        reason_summary: "Official, authentic domain for Amazon Corporation.",
        dns_records: { A: ["54.239.28.85"], MX: ["amazon-smtp.amazon.com"] }
      }
    ],
    urls: [
      {
        original_url: "https://console.aws.amazon.com/billing",
        domain: "amazon.com",
        risk_score: 0,
        is_credential_harvester: false,
        is_shortened: false
      }
    ],
    attachments: [],
    mitre_techniques: [],
    campaign_association: {
      matched: false,
      campaign_name: "",
      confidence: 0,
      description: "No threat campaign matched. Benign communication.",
      shared_signals: []
    }
  }
];

export const MOCK_DASHBOARD_STATS = {
  total_analyzed: 148,
  threats_detected: 94,
  critical_threats: 36,
  campaign_clusters: 6,
  mta_hops_reconstructed: 382,
  cases_contained: 28,
  threats_over_time: [
    { timestamp: "00:00", clean: 8, threats: 4, critical: 1 },
    { timestamp: "04:00", clean: 12, threats: 9, critical: 3 },
    { timestamp: "08:00", clean: 24, threats: 18, critical: 8 },
    { timestamp: "12:00", clean: 36, threats: 32, critical: 14 },
    { timestamp: "16:00", clean: 28, threats: 22, critical: 7 },
    { timestamp: "20:00", clean: 15, threats: 9, critical: 3 }
  ],
  threat_types_breakdown: [
    { name: "Credential Phish", count: 42, color: "#EF4444" },
    { name: "CEO / BEC Fraud", count: 26, color: "#F97316" },
    { name: "Malware Attachments", count: 18, color: "#8B5CF6" },
    { name: "QR / Quishing", count: 8, color: "#F59E0B" }
  ]
};

export const MOCK_GLOBAL_GRAPH = {
  nodes: [
    { id: "email-1", label: "PayPal Phish Incident", type: "EMAIL", risk_score: 96 },
    { id: "email-2", label: "CEO Wire Remittance", type: "EMAIL", risk_score: 92 },
    { id: "email-3", label: "DHL Customs Trojan", type: "EMAIL", risk_score: 99 },
    { id: "dom-1", label: "paypa1-security.com", type: "DOMAIN", risk_score: 98 },
    { id: "dom-2", label: "fedex-tracking-doc.xyz", type: "DOMAIN", risk_score: 99 },
    { id: "dom-3", label: "exec-consulting-grp.com", type: "DOMAIN", risk_score: 79 },
    { id: "ip-1", label: "185.220.101.5 (Tor Exit)", type: "IP", risk_score: 95 },
    { id: "ip-2", label: "194.36.189.44 (RU)", type: "IP", risk_score: 88 },
    { id: "ip-3", label: "103.251.167.22 (ZA)", type: "IP", risk_score: 82 },
    { id: "camp-1", label: "FinPhish Banking Harvest 2026", type: "CAMPAIGN", risk_score: 95 },
    { id: "camp-2", label: "Apex Executive BEC Syndicate", type: "CAMPAIGN", risk_score: 90 },
    { id: "file-1", label: "DHL_Customs_Declaration_Doc.exe", type: "FILE", risk_score: 99 }
  ],
  edges: [
    { source: "email-1", target: "dom-1", label: "SENDER_DOMAIN" },
    { source: "email-1", target: "ip-1", label: "RELAY_HOP_ORIGIN" },
    { source: "email-1", target: "ip-2", label: "TRANSIT_HOP" },
    { source: "email-1", target: "camp-1", label: "CLUSTERED_INTO" },
    { source: "dom-1", target: "ip-2", label: "HOSTED_ON" },
    { source: "email-2", target: "dom-3", label: "REPLY_TO_DOMAIN" },
    { source: "email-2", target: "ip-3", label: "RELAY_HOP_ORIGIN" },
    { source: "email-2", target: "camp-2", label: "CLUSTERED_INTO" },
    { source: "email-3", target: "dom-2", label: "SENDER_DOMAIN" },
    { source: "email-3", target: "ip-1", label: "RELAY_HOP_ORIGIN" },
    { source: "email-3", target: "file-1", label: "ATTACHMENT_PAYLOAD" }
  ]
};

export const MOCK_CAMPAIGNS = [
  {
    id: "camp-finphish-2026",
    name: "FinPhish Banking Harvest 2026",
    primary_threat_type: "Credential Phishing",
    confidence: 94,
    description: "Coordinated European banking and payment credential harvesting campaign utilizing newly registered .com and .security domains hosted on AS51167 infrastructure.",
    email_count: 24,
    domain_count: 8,
    ip_count: 12,
    asn_count: 4,
    first_seen: "2026-08-10",
    last_seen: "2026-08-23",
    status: "ACTIVE",
    shared_indicators: [
      "Homoglyph brand replacement pattern (*-security.com)",
      "Origin transit through AS48282 Tor egress nodes",
      "Matching session_token URL telemetry structure"
    ]
  },
  {
    id: "camp-bec-wire-2026",
    name: "Apex Executive BEC Syndicate",
    primary_threat_type: "Business Email Compromise (BEC)",
    confidence: 91,
    description: "Well-documented business email compromise syndicate targeting mid-market accounting personnel with simulated merger & acquisition wire remittances.",
    email_count: 14,
    domain_count: 5,
    ip_count: 6,
    asn_count: 2,
    first_seen: "2026-08-01",
    last_seen: "2026-08-23",
    status: "ACTIVE",
    shared_indicators: [
      "Subject formatting matching regex 'CONFIDENTIAL: Urgent Wire Transfer.*'",
      "Specific banking routing format GLBHDUS33",
      "SEACOM South Africa BGP routing path (AS37100)"
    ]
  },
  {
    id: "camp-agenttesla-2026",
    name: "AgentTesla Global Courier Lure",
    primary_threat_type: "Malware Distribution",
    confidence: 96,
    description: "High-volume commodity malware distribution using shipping notifications and disguised customs documents to install info-stealing trojans.",
    email_count: 38,
    domain_count: 14,
    ip_count: 19,
    asn_count: 6,
    first_seen: "2026-07-28",
    last_seen: "2026-08-23",
    status: "CONTAINED",
    shared_indicators: [
      "Attachment hash pattern matching AgentTesla stager",
      "Bulletproof hosting ASN 48282",
      "XYZ generic top-level domain abuse"
    ]
  }
];

export const MOCK_CASES = [
  {
    id: "CASE-2026-001",
    case_number: "CASE-2026-001",
    title: "PayPal Phishing & Identity Harvesting Incident",
    status: "Investigating",
    priority: "CRITICAL",
    assigned_to: "Abhinav Pratap Singh",
    created_at: "2026-08-23 10:15:00 UTC",
    email_id: "sample-paypal-phish",
    summary: "Active credential harvesting targeting enterprise employees with typosquatted lookalike domain and Tor exit node origin.",
    actions: [
      { id: "act-1", title: "Perimeter IOC Firewall Block", desc: "Block domain 'paypa1-security.com' on mail gateway perimeter.", priority: "HIGH", is_completed: true },
      { id: "act-2", title: "Mailbox Recipient Sweep", desc: "Search enterprise mailboxes for subject 'URGENT: Your PayPal Account Has Been Suspended...'.", priority: "HIGH", is_completed: false },
      { id: "act-3", title: "Credential Invalidation", desc: "Revoke active sessions for target recipient target.victim@enterprise-org.com.", priority: "MEDIUM", is_completed: false },
      { id: "act-4", title: "Evidence Preservation", desc: "Raw EML hash preserved (e3b0c44298fc1c14...).", priority: "LOW", is_completed: true }
    ]
  },
  {
    id: "CASE-2026-002",
    case_number: "CASE-2026-002",
    title: "Urgent CEO Wire Transfer Remittance (BEC)",
    status: "Open",
    priority: "CRITICAL",
    assigned_to: "Abhinav Pratap Singh",
    created_at: "2026-08-23 11:35:00 UTC",
    email_id: "sample-ceo-bec",
    summary: "Executive impersonation attack soliciting $84,500 wire transfer from corporate finance department.",
    actions: [
      { id: "act-1", title: "Notify Finance Controller", desc: "Flag beneficiary Global Holdings Mgt LLC as fraudulent.", priority: "HIGH", is_completed: true },
      { id: "act-2", title: "Block Drop Domain", desc: "Blacklist exec-consulting-grp.com on inbound mail filters.", priority: "HIGH", is_completed: false },
      { id: "act-3", title: "Security Awareness Advisory", desc: "Issue BEC alert to accounting department.", priority: "MEDIUM", is_completed: true }
    ]
  },
  {
    id: "CASE-2026-003",
    case_number: "CASE-2026-003",
    title: "DHL Customs Declaration Trojan Executable",
    status: "Contained",
    priority: "HIGH",
    assigned_to: "Abhinav Pratap Singh",
    created_at: "2026-08-23 09:15:00 UTC",
    email_id: "sample-dhl-malware",
    summary: "Trojan loader delivery blocked at mail gateway boundary. Endpoint host verified clean.",
    actions: [
      { id: "act-1", title: "Endpoint Hash Scan", desc: "Scan endpoints for SHA-256 9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e.", priority: "HIGH", is_completed: true },
      { id: "act-2", title: "EDR IOC Push", desc: "Deploy automated detection rule to CrowdStrike / Microsoft Defender.", priority: "HIGH", is_completed: true }
    ]
  }
];
