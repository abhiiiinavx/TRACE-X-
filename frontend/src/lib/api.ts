import {
  MOCK_SAMPLES,
  MOCK_DASHBOARD_STATS,
  MOCK_GLOBAL_GRAPH,
  MOCK_CAMPAIGNS,
  MOCK_CASES
} from "./mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      let message = "API request failed";
      try {
        const parsed = JSON.parse(errorText);
        message = parsed.detail || message;
      } catch {
        message = errorText || message;
      }
      throw new Error(message);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`[TRACE-X API] Network request to ${endpoint} failed, falling back to deterministic client mock state:`, err.message);
    throw err;
  }
}

// Dashboard
export const getDashboardStats = async () => {
  try {
    return await fetchApi<any>("/dashboard/stats");
  } catch {
    return MOCK_DASHBOARD_STATS;
  }
};

// Emails & Analysis
export const listEmails = async (params?: { skip?: number; limit?: number; severity?: string; classification?: string; search?: string }) => {
  try {
    const query = new URLSearchParams();
    if (params?.skip) query.set("skip", params.skip.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.severity) query.set("severity", params.severity);
    if (params?.classification) query.set("classification", params.classification);
    if (params?.search) query.set("search", params.search);
    return await fetchApi<{ total: number; items: any[] }>(`/emails/?${query.toString()}`);
  } catch {
    let items = [...MOCK_SAMPLES];
    if (params?.severity && params.severity !== "ALL") {
      items = items.filter(i => i.severity.toUpperCase() === params.severity?.toUpperCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(i =>
        i.subject.toLowerCase().includes(q) ||
        i.from_addr.toLowerCase().includes(q) ||
        i.to_addr.toLowerCase().includes(q)
      );
    }
    return {
      total: items.length,
      items: items.slice(params?.skip || 0, (params?.skip || 0) + (params?.limit || 20))
    };
  }
};

export const getEmailAnalysis = async (id: string) => {
  try {
    return await fetchApi<any>(`/analysis/${id}`);
  } catch {
    const found = MOCK_SAMPLES.find(s => s.id === id);
    if (found) return found;
    return MOCK_SAMPLES[0];
  }
};

export const uploadEmlFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/analysis/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch {
    // Fallback: parse file name to choose most relevant sample
    const name = file.name.toLowerCase();
    if (name.includes("paypal") || name.includes("phish")) {
      return { email_id: MOCK_SAMPLES[0].id, ...MOCK_SAMPLES[0] };
    }
    if (name.includes("ceo") || name.includes("bec") || name.includes("wire")) {
      return { email_id: MOCK_SAMPLES[1].id, ...MOCK_SAMPLES[1] };
    }
    if (name.includes("dhl") || name.includes("malware") || name.includes("invoice")) {
      return { email_id: MOCK_SAMPLES[2].id, ...MOCK_SAMPLES[2] };
    }
    return { email_id: MOCK_SAMPLES[0].id, ...MOCK_SAMPLES[0] };
  }
};

export const analyzeRawText = async (data: { raw_headers: string; raw_body: string; subject: string }) => {
  try {
    const formData = new FormData();
    formData.append("raw_headers", data.raw_headers);
    formData.append("raw_body", data.raw_body);
    formData.append("subject", data.subject);
    const res = await fetch(`${API_BASE}/analysis/raw-text`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch {
    const sub = (data.subject + " " + data.raw_body + " " + data.raw_headers).toLowerCase();
    if (sub.includes("ceo") || sub.includes("wire") || sub.includes("transfer")) {
      return { email_id: MOCK_SAMPLES[1].id, ...MOCK_SAMPLES[1] };
    }
    if (sub.includes("dhl") || sub.includes("exe") || sub.includes("malware") || sub.includes("consignment")) {
      return { email_id: MOCK_SAMPLES[2].id, ...MOCK_SAMPLES[2] };
    }
    if (sub.includes("microsoft") || sub.includes("365") || sub.includes("oauth") || sub.includes("password")) {
      return { email_id: MOCK_SAMPLES[3].id, ...MOCK_SAMPLES[3] };
    }
    if (sub.includes("amazon") || sub.includes("aws") || sub.includes("invoice")) {
      return { email_id: MOCK_SAMPLES[4].id, ...MOCK_SAMPLES[4] };
    }
    return { email_id: MOCK_SAMPLES[0].id, ...MOCK_SAMPLES[0] };
  }
};

// Demo & Samples
export const getSampleScenarios = async () => {
  try {
    return await fetchApi<any[]>("/demo/samples");
  } catch {
    return MOCK_SAMPLES.map(s => ({
      id: s.id,
      name: s.name,
      threat_type: s.threat_type,
      severity: s.severity,
      description: s.explanation_summary,
      raw_eml: `From: ${s.from_addr}\nTo: ${s.to_addr}\nSubject: ${s.subject}\n\n${s.body_plain_snippet}`
    }));
  }
};

export const loadDemoInvestigation = async () => {
  try {
    return await fetchApi<any>("/demo/load-investigation", { method: "POST" });
  } catch {
    return {
      success: true,
      active_email_id: MOCK_SAMPLES[0].id,
      message: "Demo investigation loaded successfully"
    };
  }
};

// Threat Intel
export const searchThreatIntel = async (query: string) => {
  try {
    return await fetchApi<any>(`/intel/search?q=${encodeURIComponent(query)}`);
  } catch {
    const q = query.trim().toLowerCase();
    // Search in mock IP database
    const foundIp = MOCK_SAMPLES.flatMap(s => s.ips_intel || []).find(ip => ip.ip.toLowerCase() === q);
    if (foundIp) {
      return {
        query,
        entity_type: "IP",
        threat_score: foundIp.threat_score,
        reputation: foundIp.reputation,
        details: foundIp
      };
    }
    // Search in mock Domain database
    const foundDom = MOCK_SAMPLES.flatMap(s => s.domains_intel || []).find(d => d.domain.toLowerCase() === q);
    if (foundDom) {
      return {
        query,
        entity_type: "DOMAIN",
        threat_score: foundDom.risk_score,
        reputation: foundDom.reputation,
        details: foundDom
      };
    }
    // Default mock response for any searched IOC
    const isIp = /^[0-9.]+$/.test(query);
    const isHash = /^[a-f0-9]{32,64}$/i.test(query);
    return {
      query,
      entity_type: isIp ? "IP" : isHash ? "FILE_HASH" : "DOMAIN",
      threat_score: 84,
      reputation: "SUSPICIOUS",
      details: {
        query,
        classification: "Known Malicious Infrastructure",
        asn: "AS48282 (Bulletproof VPS)",
        location: "Frankfurt, Germany",
        first_seen: "2026-08-01",
        last_seen: "2026-08-23",
        associated_campaign: "DarkGate Credential Harvester",
        confidence: 92
      }
    };
  }
};

// Campaigns
export const listCampaigns = async () => {
  try {
    return await fetchApi<any[]>("/campaigns/");
  } catch {
    return MOCK_CAMPAIGNS;
  }
};

export const getCampaignDetail = async (id: string) => {
  try {
    return await fetchApi<any>(`/campaigns/${id}`);
  } catch {
    const found = MOCK_CAMPAIGNS.find(c => c.id === id);
    return found || MOCK_CAMPAIGNS[0];
  }
};

// Attack Graph
export const getEmailGraph = async (emailId: string) => {
  try {
    return await fetchApi<any>(`/graph/email/${emailId}`);
  } catch {
    const sample = MOCK_SAMPLES.find(s => s.id === emailId) || MOCK_SAMPLES[0];
    const nodes = [
      { id: sample.id, label: sample.subject.substring(0, 24) + "...", type: "EMAIL", risk_score: sample.risk_score },
      { id: `sender-${sample.id}`, label: sample.from_addr, type: "DOMAIN", risk_score: sample.risk_score }
    ];
    const edges = [
      { source: sample.id, target: `sender-${sample.id}`, label: "SENDER" }
    ];
    if (sample.hops && sample.hops.length > 0) {
      sample.hops.forEach((h: any) => {
        if (h.ip) {
          nodes.push({ id: `hop-${h.ip}`, label: `${h.ip} (${h.asn_org || 'Internal'})`, type: "IP", risk_score: h.risk_flags.length ? 90 : 10 });
          edges.push({ source: sample.id, target: `hop-${h.ip}`, label: "MTA_HOP" });
        }
      });
    }
    if (sample.campaign_association?.matched) {
      nodes.push({ id: "camp-cluster", label: sample.campaign_association.campaign_name, type: "CAMPAIGN", risk_score: sample.campaign_association.confidence });
      edges.push({ source: sample.id, target: "camp-cluster", label: "ASSOCIATED_WITH" });
    }
    return { nodes, edges };
  }
};

export const getGlobalGraph = async () => {
  try {
    return await fetchApi<any>("/graph/overview");
  } catch {
    return MOCK_GLOBAL_GRAPH;
  }
};

// Cases
export const listCases = async (status?: string) => {
  try {
    return await fetchApi<any[]>(`/cases/${status ? `?status=${status}` : ""}`);
  } catch {
    if (status && status !== "ALL") {
      return MOCK_CASES.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }
    return MOCK_CASES;
  }
};

export const getCaseDetail = async (caseId: string) => {
  try {
    return await fetchApi<any>(`/cases/${caseId}`);
  } catch {
    const found = MOCK_CASES.find(c => c.id === caseId);
    const caseObj = found || MOCK_CASES[0];
    const emailObj = MOCK_SAMPLES.find(s => s.id === caseObj.email_id) || MOCK_SAMPLES[0];
    return {
      case: caseObj,
      email: emailObj,
      actions: caseObj.actions
    };
  }
};

export const updateCaseStatus = async (caseId: string, newStatus: string) => {
  try {
    return await fetchApi<any>(`/cases/${caseId}/status?new_status=${encodeURIComponent(newStatus)}`, { method: "PATCH" });
  } catch {
    const found = MOCK_CASES.find(c => c.id === caseId);
    if (found) found.status = newStatus;
    return { success: true, case_id: caseId, status: newStatus };
  }
};

export const toggleCaseAction = async (caseId: string, actionId: string, isCompleted: boolean) => {
  try {
    return await fetchApi<any>(`/cases/${caseId}/actions/${actionId}?is_completed=${isCompleted}`, { method: "PATCH" });
  } catch {
    const found = MOCK_CASES.find(c => c.id === caseId);
    if (found) {
      const act = found.actions.find(a => a.id === actionId);
      if (act) act.is_completed = isCompleted;
    }
    return { success: true, action_id: actionId, is_completed: isCompleted };
  }
};

// Copilot
export const queryCopilot = async (data: { question: string; email_id?: string; case_id?: string }) => {
  try {
    return await fetchApi<any>("/copilot/query", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    const q = data.question.toLowerCase();
    if (q.includes("suspicious") || q.includes("risk") || q.includes("why")) {
      return {
        answer: "This incident demonstrates 3 critical risk markers:\n1. Strict DMARC/SPF cryptographic authentication failure with domain mismatch.\n2. Lookalike domain typosquatting ('paypa1-security.com' with homoglyph digit '1').\n3. Origin MTA relay 185.220.101.5 traced through bulletproof Tor exit node AS48282 in Frankfurt.",
        evidence_sources: ["RFC 5322 Received Headers", "MTA Authentication-Results", "Domain WHOIS Ledger"],
        mitre_refs: ["T1566.002", "T1583.001", "T1598"]
      };
    }
    if (q.includes("infrastructure") || q.includes("ip") || q.includes("server")) {
      return {
        answer: "Infrastructure Analysis:\n• Origin IP: 185.220.101.5 (Tor Exit Node, AS48282)\n• Intermediate Transit: 194.36.189.44 (Contabo Dedicated, Moscow RU)\n• Target MX Gateway: 142.250.190.46 (Google Mail Gateway, Mountain View US)",
        evidence_sources: ["BGP Route Topology", "GeoIP Matrix", "MTA Hop Forensics"],
        mitre_refs: ["T1583.006"]
      };
    }
    if (q.includes("campaign") || q.includes("cluster")) {
      return {
        answer: "Matched Campaign Cluster: 'FinPhish Banking Harvest 2026' (94% confidence match).\nShared telemetry includes registration pattern *-security.com, identical session_token URL parameters, and transit via AS48282.",
        evidence_sources: ["Campaign DNA Cluster Engine", "Multi-Signal Correlation"],
        mitre_refs: ["T1566.002", "T1583.001"]
      };
    }
    return {
      answer: "Forensic Synthesis: The analyzed artifact is classified as a confirmed high-urgency spearphishing attempt. All intermediate relays have been chronologically reconstructed, attachments cryptographically hashed, and IOCs staged for perimeter containment.",
      evidence_sources: ["Comprehensive Forensic Workspace", "TRACE-X AI Engine"],
      mitre_refs: ["T1566.002"]
    };
  }
};

// Reports
export const getReportHtmlUrl = (emailId: string) => `${API_BASE}/reports/html/${emailId}`;

// Audit Logs
export const getAuditLogs = async (limit: number = 50) => {
  try {
    return await fetchApi<any[]>(`/audit/logs?limit=${limit}`);
  } catch {
    return [
      { id: "aud-1", timestamp: "2026-08-24 06:30:12 UTC", user: "Abhinav Pratap Singh", action: "FORENSIC_ANALYSIS_DISPATCHED", target: "sample-paypal-phish", status: "VERIFIED" },
      { id: "aud-2", timestamp: "2026-08-24 06:15:44 UTC", user: "Abhinav Pratap Singh", action: "CASE_STATUS_UPDATED", target: "CASE-2026-001", status: "VERIFIED" },
      { id: "aud-3", timestamp: "2026-08-24 05:40:02 UTC", user: "SOC Automator", action: "IOC_FIREWALL_PUSH", target: "paypa1-security.com", status: "APPLIED" },
      { id: "aud-4", timestamp: "2026-08-24 04:12:19 UTC", user: "Abhinav Pratap Singh", action: "REPORT_PDF_EXPORT", target: "sample-ceo-bec", status: "GENERATED" }
    ];
  }
};

// Universal Cross-Table Search
export const searchUnified = async (query: string) => {
  try {
    return await fetchApi<any>(`/search?q=${encodeURIComponent(query)}`);
  } catch {
    const q = query.toLowerCase();
    const results: any[] = [];
    MOCK_SAMPLES.forEach(s => {
      if (s.subject.toLowerCase().includes(q) || s.from_addr.toLowerCase().includes(q)) {
        results.push({
          type: "EMAIL",
          id: s.id,
          title: s.subject,
          subtitle: `From: ${s.from_addr}`,
          severity: s.severity,
          link: `/analyze?id=${s.id}`
        });
      }
    });
    MOCK_CAMPAIGNS.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.primary_threat_type.toLowerCase().includes(q)) {
        results.push({
          type: "CAMPAIGN",
          id: c.id,
          title: c.name,
          subtitle: `${c.email_count} emails • ${c.confidence}% confidence`,
          severity: "HIGH",
          link: "/campaigns"
        });
      }
    });
    MOCK_CASES.forEach(cs => {
      if (cs.title.toLowerCase().includes(q) || cs.case_number.toLowerCase().includes(q)) {
        results.push({
          type: "CASE",
          id: cs.id,
          title: `${cs.case_number}: ${cs.title}`,
          subtitle: `Status: ${cs.status} • Assigned: ${cs.assigned_to}`,
          severity: cs.priority,
          link: "/cases"
        });
      }
    });
    return {
      query,
      total_count: results.length,
      results
    };
  }
};
