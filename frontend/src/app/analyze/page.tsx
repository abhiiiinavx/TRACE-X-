"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Sparkles,
  AlertTriangle,
  Route,
  MapPin,
  GitMerge,
  Network,
  Clock,
  CheckSquare,
  Lock,
  Printer,
  ExternalLink,
  Dna,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Send
} from "lucide-react";
import {
  getEmailAnalysis,
  uploadEmlFile,
  analyzeRawText,
  getSampleScenarios,
  getReportHtmlUrl,
  getEmailGraph,
  listEmails
} from "@/lib/api";
import GeoMap from "@/components/geo/GeoMap";
import AttackGraphView from "@/components/graph/AttackGraphView";

function AnalyzeEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailId = searchParams.get("id");
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabParam || "overview");
  const [activeInputMode, setActiveInputMode] = useState<"samples" | "upload" | "paste">("samples");

  // Data states
  const [emailData, setEmailData] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzingProgress, setAnalyzingProgress] = useState<number | null>(null);
  const [progressStage, setProgressStage] = useState<string>("");
  const [copiedSha, setCopiedSha] = useState(false);

  // Raw paste state
  const [rawHeaders, setRawHeaders] = useState("");
  const [rawBody, setRawBody] = useState("");
  const [subjectInput, setSubjectInput] = useState("");

  useEffect(() => {
    getSampleScenarios().then(setSamples).catch(console.error);
  }, []);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    async function fetchAnalysis() {
      setLoading(true);
      try {
        let targetId = emailId;
        if (!targetId) {
          const listRes = await listEmails({ limit: 1 });
          if (listRes.items && listRes.items.length > 0) {
            targetId = listRes.items[0].id;
          }
        }
        if (targetId) {
          const [emailRes, graphRes] = await Promise.all([
            getEmailAnalysis(targetId),
            getEmailGraph(targetId).catch(() => null)
          ]);
          setEmailData(emailRes);
          if (graphRes) setGraphData(graphRes);
        }
      } catch (err) {
        console.error("Analysis load error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalysis();
  }, [emailId]);

  const triggerAnalysisWithProgress = async (analysisPromise: Promise<any>) => {
    setAnalyzingProgress(10);
    setProgressStage("Parsing RFC 5322 MIME & Hash Ledger...");

    const p1 = setTimeout(() => {
      setAnalyzingProgress(35);
      setProgressStage("Validating SPF, DKIM & DMARC Alignments...");
    }, 200);

    const p2 = setTimeout(() => {
      setAnalyzingProgress(60);
      setProgressStage("Evaluating NLP Intent & Brand Homoglyphs...");
    }, 450);

    const p3 = setTimeout(() => {
      setAnalyzingProgress(85);
      setProgressStage("Reconstructing MTA Hop Relay & Geo Telemetry...");
    }, 700);

    try {
      const res = await analysisPromise;
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      setAnalyzingProgress(100);
      setProgressStage("Forensic Analysis Complete");

      setTimeout(() => {
        setAnalyzingProgress(null);
        if (res.email_id) {
          router.push(`/analyze?id=${res.email_id}`);
        }
      }, 400);
    } catch (err: any) {
      alert("Analysis failed: " + err.message);
      setAnalyzingProgress(null);
    }
  };

  const handleSelectSample = (sample: any) => {
    const parsedPromise = analyzeRawText({
      raw_headers: "",
      raw_body: sample.raw_eml,
      subject: sample.name
    });
    triggerAnalysisWithProgress(parsedPromise);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerAnalysisWithProgress(uploadEmlFile(file));
    }
  };

  const handleRawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawBody.trim() && !rawHeaders.trim()) return;
    triggerAnalysisWithProgress(
      analyzeRawText({
        raw_headers: rawHeaders,
        raw_body: rawBody,
        subject: subjectInput || "Manual Forensic Inspection"
      })
    );
  };

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const isCrit = emailData?.severity === "CRITICAL";
  const isHigh = emailData?.severity === "HIGH";
  const isMed = emailData?.severity === "MEDIUM";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
            Email Analysis & Forensics
          </h1>
          <p className="text-xs md:text-sm text-[#64748B] mt-1">
            Deep MIME packet inspection, MTA relay hops, and explainable AI risk scoring
          </p>
        </div>

        {emailData && (
          <a
            href={getReportHtmlUrl(emailData.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
          >
            <Printer className="w-4 h-4 text-[#4F46E5]" />
            <span>Export Forensic Report</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" />
          </a>
        )}
      </div>

      {/* Intake Method Box */}
      <div className="clean-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
            <Upload className="w-4 h-4 text-[#4F46E5]" />
            <span>Select Intake Source</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveInputMode("samples")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeInputMode === "samples"
                  ? "bg-white text-[#4F46E5] font-bold shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Preset Test Scenarios
            </button>
            <button
              onClick={() => setActiveInputMode("upload")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeInputMode === "upload"
                  ? "bg-white text-[#4F46E5] font-bold shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Upload .EML File
            </button>
            <button
              onClick={() => setActiveInputMode("paste")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeInputMode === "paste"
                  ? "bg-white text-[#4F46E5] font-bold shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Paste Headers / Body
            </button>
          </div>
        </div>

        {/* 1. Sample Cards */}
        {activeInputMode === "samples" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {samples.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSample(s)}
                className="clean-card-nested p-4 text-left hover:border-[#6366F1] hover:bg-white transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase text-[#64748B]">
                      {s.threat_type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.severity === "CRITICAL"
                          ? "bg-[#FEF2F2] text-[#EF4444]"
                          : s.severity === "HIGH"
                          ? "bg-[#FFF7ED] text-[#EA580C]"
                          : "bg-[#F0FDF4] text-[#16A34A]"
                      }`}
                    >
                      {s.severity}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors line-clamp-2">
                    {s.name}
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-[#4F46E5] font-bold flex items-center gap-1">
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 2. Drag & Drop Upload */}
        {activeInputMode === "upload" && (
          <label className="border-2 border-dashed border-[#CBD5E1] hover:border-[#4F46E5] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#F8FAFC]">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-[#0F172A]">Drop your RFC 5322 .EML file here</span>
            <span className="text-xs text-[#64748B] mt-0.5">Attachments are safely SHA-256 hashed and isolated</span>
            <input type="file" accept=".eml,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        )}

        {/* 3. Paste Raw Text */}
        {activeInputMode === "paste" && (
          <form onSubmit={handleRawSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Email Subject..."
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <textarea
                placeholder="Paste Raw Headers (Received, From, Return-Path, Authentication-Results)..."
                value={rawHeaders}
                onChange={(e) => setRawHeaders(e.target.value)}
                rows={4}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
              />
              <textarea
                placeholder="Paste Raw Body text or HTML markup..."
                value={rawBody}
                onChange={(e) => setRawBody(e.target.value)}
                rows={4}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Run Deep Forensic Scan</span>
            </button>
          </form>
        )}

        {/* Progress Feedback */}
        {analyzingProgress !== null && (
          <div className="p-3.5 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#4F46E5]">
              <span>{progressStage}</span>
              <span>{analyzingProgress}%</span>
            </div>
            <div className="w-full bg-white rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className="bg-[#4F46E5] h-full transition-all duration-300 rounded-full"
                style={{ width: `${analyzingProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Main Results View */}
      {emailData && (
        <div className="space-y-6">
          {/* Master Verdict Card */}
          <div className="clean-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Score & Main Details */}
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center p-2 text-center flex-shrink-0 shadow-sm ${
                    isCrit
                      ? "bg-[#FEF2F2] border border-[#FEE2E2] text-[#EF4444]"
                      : isHigh
                      ? "bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C]"
                      : isMed
                      ? "bg-[#FFFBEB] border border-[#FEF3C7] text-[#D97706]"
                      : "bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A]"
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase text-[#64748B]">Risk Score</span>
                  <span className="text-3xl font-extrabold leading-none my-0.5">
                    {emailData.risk_score}
                  </span>
                  <span className="text-[10px] font-medium text-[#64748B]">/ 100</span>
                </div>

                <div>
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        isCrit
                          ? "bg-[#FEF2F2] text-[#EF4444]"
                          : isHigh
                          ? "bg-[#FFF7ED] text-[#EA580C]"
                          : isMed
                          ? "bg-[#FFFBEB] text-[#D97706]"
                          : "bg-[#F0FDF4] text-[#16A34A]"
                      }`}
                    >
                      {emailData.severity}
                    </span>
                    <span className="text-sm font-bold text-[#0F172A]">
                      {emailData.classification}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-[#0F172A] line-clamp-1">
                    {emailData.subject}
                  </h2>

                  <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B] flex-wrap">
                    <div>
                      <strong className="text-[#0F172A]">From:</strong> {emailData.from_addr}
                    </div>
                    <div>
                      <strong className="text-[#0F172A]">To:</strong> {emailData.to_addr}
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span>SHA-256: {emailData.sha256.substring(0, 16)}...</span>
                      <button
                        onClick={() => handleCopySha(emailData.sha256)}
                        className="hover:text-[#4F46E5] cursor-pointer"
                      >
                        {copiedSha ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* MITRE Badges */}
              <div className="lg:border-l lg:border-[#E2E8F0] lg:pl-6 space-y-2">
                <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  MITRE ATT&CK Indicators
                </div>
                <div className="flex flex-wrap gap-1.5 max-w-sm">
                  {emailData.mitre_techniques?.map((m: any) => (
                    <span
                      key={m.id}
                      title={`${m.name}: ${m.description}`}
                      className="text-[11px] font-bold bg-[#EEF2FF] text-[#4F46E5] px-2.5 py-1 rounded-lg border border-[#C7D2FE]/60 cursor-help"
                    >
                      {m.id} • {m.name}
                    </span>
                  ))}
                  {(!emailData.mitre_techniques || emailData.mitre_techniques.length === 0) && (
                    <span className="text-xs text-[#94A3B8]">No MITRE threat techniques triggered</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "overview", label: "Overview & Auth", icon: FileText },
              { id: "explain", label: "Feature Weights", icon: Sparkles },
              { id: "trace", label: "Hop Forensics", icon: Route },
              { id: "geolocate", label: "Geolocation Map", icon: MapPin },
              { id: "correlate", label: "Domain & URL", icon: GitMerge },
              { id: "visualize", label: "Attack Graph", icon: Network },
              { id: "cluster", label: "Campaign DNA", icon: Dna },
              { id: "timeline", label: "Timeline", icon: Clock },
              { id: "actions", label: "Action Plan", icon: CheckSquare },
              { id: "evidence", label: "Evidence Vault", icon: Lock }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-100"
                      : "bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6 lg:col-span-2">
                <div className="clean-card p-5 space-y-4">
                  <h3 className="text-sm font-bold text-[#0F172A]">RFC 5322 Envelope Headers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="clean-card-nested p-3">
                      <div className="text-[11px] text-[#64748B] font-medium">From Address</div>
                      <div className="font-bold text-[#0F172A] mt-0.5 truncate">{emailData.from_addr}</div>
                      {emailData.from_display_name && (
                        <div className="text-[11px] text-[#4F46E5] mt-0.5">"{emailData.from_display_name}"</div>
                      )}
                    </div>
                    <div className="clean-card-nested p-3">
                      <div className="text-[11px] text-[#64748B] font-medium">To Address</div>
                      <div className="font-bold text-[#0F172A] mt-0.5 truncate">{emailData.to_addr}</div>
                    </div>
                    <div className="clean-card-nested p-3">
                      <div className="text-[11px] text-[#64748B] font-medium">Return-Path</div>
                      <div className="font-bold text-[#0F172A] mt-0.5 truncate">{emailData.return_path || "None"}</div>
                    </div>
                    <div className="clean-card-nested p-3">
                      <div className="text-[11px] text-[#64748B] font-medium">Reply-To</div>
                      <div className="font-bold text-[#0F172A] mt-0.5 truncate">{emailData.reply_to || "Aligned with From"}</div>
                    </div>
                  </div>
                </div>

                <div className="clean-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0F172A]">Sanitized Body Preview</h3>
                    <span className="text-xs font-bold text-[#16A34A] bg-[#F0FDF4] px-2.5 py-0.5 rounded-full">
                      Scripts Stripped
                    </span>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-xs text-[#334155] max-h-72 overflow-y-auto">
                    {emailData.body_html_sanitized ? (
                      <div dangerouslySetInnerHTML={{ __html: emailData.body_html_sanitized }} />
                    ) : (
                      <pre className="font-sans whitespace-pre-wrap">{emailData.body_plain_snippet || "No body text."}</pre>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="clean-card p-5 space-y-3">
                  <h3 className="text-sm font-bold text-[#0F172A]">Authentication Integrity</h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="font-semibold text-[#0F172A]">DMARC Policy</span>
                      <span
                        className={`font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                          emailData.auth_results?.dmarc_status === "fail"
                            ? "bg-[#FEF2F2] text-[#EF4444]"
                            : "bg-[#F0FDF4] text-[#16A34A]"
                        }`}
                      >
                        {emailData.auth_results?.dmarc_status} ({emailData.auth_results?.dmarc_policy})
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="font-semibold text-[#0F172A]">SPF Status</span>
                      <span
                        className={`font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                          emailData.auth_results?.spf_status === "fail" || emailData.auth_results?.spf_status === "softfail"
                            ? "bg-[#FEF2F2] text-[#EF4444]"
                            : "bg-[#F0FDF4] text-[#16A34A]"
                        }`}
                      >
                        {emailData.auth_results?.spf_status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="font-semibold text-[#0F172A]">Return-Path Alignment</span>
                      <span
                        className={`font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                          emailData.auth_results?.return_path_aligned
                            ? "bg-[#F0FDF4] text-[#16A34A]"
                            : "bg-[#FEF2F2] text-[#EF4444]"
                        }`}
                      >
                        {emailData.auth_results?.return_path_aligned ? "ALIGNED" : "MISALIGNED"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="clean-card p-5 space-y-3">
                  <h3 className="text-sm font-bold text-[#0F172A]">Attachments ({emailData.attachments?.length || 0})</h3>
                  {emailData.attachments?.length === 0 ? (
                    <p className="text-xs text-[#64748B]">No attachments found in message.</p>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {emailData.attachments?.map((a: any) => (
                        <div key={a.sha256} className="clean-card-nested p-3">
                          <div className="flex items-center justify-between font-semibold text-[#0F172A]">
                            <span className="truncate">{a.filename}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                a.is_malicious ? "bg-[#FEF2F2] text-[#EF4444]" : "bg-[#F0FDF4] text-[#16A34A]"
                              }`}
                            >
                              {a.is_malicious ? "THREAT" : "CLEAN"}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#64748B] font-mono mt-1 truncate">
                            SHA-256: {a.sha256}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXPLAINABLE AI */}
          {activeTab === "explain" && (
            <div className="space-y-6">
              <div className="clean-card p-5 border-l-4 border-l-[#4F46E5] space-y-2">
                <div className="text-xs font-bold uppercase text-[#4F46E5]">Explainable AI Synthesis</div>
                <p className="text-xs md:text-sm text-[#0F172A] leading-relaxed">
                  {emailData.explanation_summary}
                </p>
              </div>

              <div className="clean-card overflow-hidden">
                <div className="p-4 border-b border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A]">Feature-Weighted Scoring Formula</span>
                  <span className="text-[11px] text-[#64748B] font-medium">Deterministic Impact Points</span>
                </div>
                <table className="w-full text-left text-xs text-[#64748B]">
                  <thead className="bg-[#F8FAFC] uppercase text-[10px] font-bold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Feature</th>
                      <th className="px-5 py-3">Forensic Evidence</th>
                      <th className="px-5 py-3">Impact</th>
                      <th className="px-5 py-3">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {emailData.feature_breakdown?.map((f: any, idx: number) => {
                      const isPositive = f.impact > 0;
                      return (
                        <tr key={idx} className="hover:bg-[#F8FAFC]">
                          <td className="px-5 py-3 font-bold text-[#4F46E5]">{f.category}</td>
                          <td className="px-5 py-3 font-semibold text-[#0F172A]">{f.feature}</td>
                          <td className="px-5 py-3 text-[#334155]">{f.evidence}</td>
                          <td className="px-5 py-3 font-bold">
                            <span className={isPositive ? "text-[#EF4444]" : "text-[#16A34A]"}>
                              {isPositive ? `+${f.impact}` : f.impact} pts
                            </span>
                          </td>
                          <td className="px-5 py-3 font-medium text-[#0F172A]">{f.confidence}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: HOP RELAY FORENSICS */}
          {activeTab === "trace" && (
            <div className="clean-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Sequential MTA Hop Relay Path</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">Received header reconstruction from origin sender to destination gateway</p>
                </div>
                <span className="text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] px-3 py-1 rounded-full">
                  {emailData.hops?.length || 0} Total Hops
                </span>
              </div>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
                {emailData.hops?.map((hop: any, idx: number) => {
                  const hasFlags = hop.risk_flags && hop.risk_flags.length > 0;
                  return (
                    <div key={idx} className="relative pl-8">
                      <div
                        className={`absolute left-3 top-3 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                          hasFlags ? "bg-[#EF4444]" : "bg-[#10B981]"
                        }`}
                      ></div>

                      <div className="clean-card-nested p-4 text-xs space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0F172A]">Hop #{hop.hop_index}</span>
                            <span className="font-mono font-semibold text-[#4F46E5]">{hop.ip || "Internal"}</span>
                          </div>
                          <div className="text-xs font-medium text-[#64748B]">
                            Delay: <strong className="text-[#0F172A]">{hop.delay_seconds}s</strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B]">
                          <div>From: <span className="font-semibold text-[#0F172A]">{hop.from_host || "N/A"}</span></div>
                          <div>By: <span className="font-semibold text-[#0F172A]">{hop.by_host || "N/A"}</span></div>
                          <div>ASN: <span className="font-semibold text-[#0F172A]">{hop.asn} ({hop.asn_org})</span></div>
                        </div>

                        {hasFlags && (
                          <div className="text-[11px] text-[#DC2626] bg-[#FEF2F2] p-2 rounded-xl border border-[#FEE2E2] flex items-center gap-1.5 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{hop.risk_flags.join("; ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: GEOLOCATION */}
          {activeTab === "geolocate" && (
            <GeoMap ips={emailData.ips_intel || []} />
          )}

          {/* TAB 5: DOMAIN & URL */}
          {activeTab === "correlate" && (
            <div className="space-y-6">
              <div className="clean-card p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A]">Domain Intelligence & Typo-Squatting</h3>
                {emailData.domains_intel?.map((dom: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                      <div>
                        <span className="font-mono font-bold text-sm text-[#0F172A]">{dom.domain}</span>
                        <div className="text-xs text-[#64748B] mt-0.5">Registrar: {dom.registrar || "Privacy"}</div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            dom.is_lookalike
                              ? "bg-[#FEF2F2] text-[#EF4444]"
                              : "bg-[#F0FDF4] text-[#16A34A]"
                          }`}
                        >
                          {dom.is_lookalike ? `LOOKALIKE (${dom.impersonated_brand})` : "AUTHENTIC"}
                        </span>
                        <div className="text-[11px] text-[#64748B] font-medium mt-1">Age: {dom.age_days}d</div>
                      </div>
                    </div>
                    <p className="text-xs text-[#64748B]">{dom.reason_summary}</p>
                  </div>
                ))}
              </div>

              <div className="clean-card p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A]">Extracted URLs ({emailData.urls?.length || 0})</h3>
                <div className="space-y-2">
                  {emailData.urls?.map((u: any, idx: number) => (
                    <div key={idx} className="clean-card-nested p-3 flex items-center justify-between text-xs">
                      <span className="text-[#0F172A] font-mono truncate max-w-lg">{u.original_url}</span>
                      <span className="text-xs font-bold text-[#EF4444] bg-[#FEF2F2] px-2.5 py-0.5 rounded-full">
                        Risk {u.risk_score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ATTACK GRAPH */}
          {activeTab === "visualize" && (
            <AttackGraphView graphData={graphData || { nodes: [], edges: [] }} />
          )}

          {/* TAB 7: CAMPAIGN DNA */}
          {activeTab === "cluster" && (
            <div className="clean-card p-6 space-y-4 border-l-4 border-l-[#8B5CF6]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F172A]">Adversary Campaign DNA</h3>
                {emailData.campaign_association?.matched && (
                  <span className="text-xs font-bold text-[#8B5CF6] bg-[#F5F3FF] px-3 py-1 rounded-full border border-[#DDD6FE]">
                    Confidence: {emailData.campaign_association.confidence}%
                  </span>
                )}
              </div>

              {emailData.campaign_association?.matched ? (
                <div className="space-y-3 text-xs">
                  <div className="text-sm font-bold text-[#0F172A]">
                    {emailData.campaign_association.campaign_name}
                  </div>
                  <p className="text-[#64748B] leading-relaxed">
                    {emailData.campaign_association.description}
                  </p>
                  <div className="clean-card-nested p-4 space-y-2">
                    <div className="text-xs font-bold text-[#4F46E5]">Shared Infrastructure Signatures</div>
                    <ul className="space-y-1.5 text-xs text-[#0F172A]">
                      {emailData.campaign_association.shared_signals?.map((sig: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
                          <span>{sig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#64748B]">No established campaign cluster matched this incident.</p>
              )}
            </div>
          )}

          {/* TAB 8: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="clean-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A]">Incident Event Timeline</h3>
              <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
                <div className="relative text-xs">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#4F46E5]"></span>
                  <div className="font-bold text-[#0F172A]">Email Dispatched from Origin MTA</div>
                  <div className="text-[11px] text-[#64748B] font-mono mt-0.5">{emailData.date_header || "2026-08-23 10:14:00 UTC"}</div>
                </div>
                <div className="relative text-xs">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                  <div className="font-bold text-[#0F172A]">Authentication Evaluated on Ingestion</div>
                  <div className="text-[11px] text-[#64748B] font-mono mt-0.5">DMARC {emailData.auth_results?.dmarc_status}</div>
                </div>
                <div className="relative text-xs">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
                  <div className="font-bold text-[#0F172A]">Threat Signature Scored</div>
                  <div className="text-[11px] text-[#64748B] font-mono mt-0.5">Score: {emailData.risk_score}/100</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ACTION CHECKLIST */}
          {activeTab === "actions" && (
            <div className="clean-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A]">Containment Action Items</h3>
              <div className="space-y-2.5">
                {[
                  { id: "act-1", title: "Perimeter IOC Firewall Block", desc: `Block domain '${emailData.from_addr.split('@')[1]}' on mail gateway perimeter.`, priority: "HIGH" },
                  { id: "act-2", title: "Mailbox Recipient Sweep", desc: `Search enterprise mailboxes for subject '${emailData.subject?.substring(0, 30)}...'.`, priority: "HIGH" },
                  { id: "act-3", title: "Credential Invalidation", desc: `Revoke active sessions for target recipient ${emailData.to_addr}.`, priority: "MEDIUM" },
                  { id: "act-4", title: "Evidence Preservation", desc: `Raw EML hash preserved (${emailData.sha256.substring(0, 16)}...).`, priority: "LOW" }
                ].map((act) => (
                  <div key={act.id} className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#0F172A]">{act.title}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">{act.desc}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FEF2F2] text-[#EF4444]">
                      {act.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: EVIDENCE REGISTRY */}
          {activeTab === "evidence" && (
            <div className="clean-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F172A]">Cryptographic Evidence Vault</h3>
                <span className="text-xs font-bold text-[#16A34A] bg-[#F0FDF4] px-3 py-1 rounded-full">
                  Write-Once Immutable
                </span>
              </div>
              <div className="clean-card-nested p-4 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-[#0F172A]">
                  <span>Raw RFC 5322 EML</span>
                  <span className="text-[#16A34A] text-xs">PRESERVED</span>
                </div>
                <div className="font-mono text-xs text-[#0F172A] bg-white p-3 rounded-xl border border-[#E2E8F0] break-all shadow-inner">
                  SHA-256: {emailData.sha256}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalyzeEmailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[#64748B] font-medium text-sm">Loading Forensic Workspace...</div>}>
      <AnalyzeEmailContent />
    </Suspense>
  );
}
