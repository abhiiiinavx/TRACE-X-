const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
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

  return res.json();
}

// Dashboard
export const getDashboardStats = () => fetchApi<any>("/dashboard/stats");

// Emails & Analysis
export const listEmails = (params?: { skip?: number; limit?: number; severity?: string; classification?: string; search?: string }) => {
  const query = new URLSearchParams();
  if (params?.skip) query.set("skip", params.skip.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.severity) query.set("severity", params.severity);
  if (params?.classification) query.set("classification", params.classification);
  if (params?.search) query.set("search", params.search);
  return fetchApi<{ total: number; items: any[] }>(`/emails/?${query.toString()}`);
};

export const getEmailAnalysis = (id: string) => fetchApi<any>(`/analysis/${id}`);

export const uploadEmlFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/analysis/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const analyzeRawText = async (data: { raw_headers: string; raw_body: string; subject: string }) => {
  const formData = new FormData();
  formData.append("raw_headers", data.raw_headers);
  formData.append("raw_body", data.raw_body);
  formData.append("subject", data.subject);
  const res = await fetch(`${API_BASE}/analysis/raw-text`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Demo & Samples
export const getSampleScenarios = () => fetchApi<any[]>("/demo/samples");
export const loadDemoInvestigation = () => fetchApi<any>("/demo/load-investigation", { method: "POST" });

// Threat Intel
export const searchThreatIntel = (query: string) => fetchApi<any>(`/intel/search?q=${encodeURIComponent(query)}`);

// Campaigns
export const listCampaigns = () => fetchApi<any[]>("/campaigns/");
export const getCampaignDetail = (id: string) => fetchApi<any>(`/campaigns/${id}`);

// Attack Graph
export const getEmailGraph = (emailId: string) => fetchApi<any>(`/graph/email/${emailId}`);
export const getGlobalGraph = () => fetchApi<any>("/graph/overview");

// Cases
export const listCases = (status?: string) => fetchApi<any[]>(`/cases/${status ? `?status=${status}` : ""}`);
export const getCaseDetail = (caseId: string) => fetchApi<any>(`/cases/${caseId}`);
export const updateCaseStatus = (caseId: string, newStatus: string) =>
  fetchApi<any>(`/cases/${caseId}/status?new_status=${encodeURIComponent(newStatus)}`, { method: "PATCH" });
export const toggleCaseAction = (caseId: string, actionId: string, isCompleted: boolean) =>
  fetchApi<any>(`/cases/${caseId}/actions/${actionId}?is_completed=${isCompleted}`, { method: "PATCH" });

// Copilot
export const queryCopilot = (data: { question: string; email_id?: string; case_id?: string }) =>
  fetchApi<any>("/copilot/query", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Reports
export const getReportHtmlUrl = (emailId: string) => `${API_BASE}/reports/html/${emailId}`;
