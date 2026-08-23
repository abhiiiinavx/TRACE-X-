"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  FileSearch,
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
  Info,
  Dna,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check
} from "lucide-react";
import {
  getEmailAnalysis,
  uploadEmlFile,
  analyzeRawText,
  getSampleScenarios,
  getReportHtmlUrl,
  getEmailGraph,
  toggleCaseAction
} from "@/lib/api";
import PipelineRibbon from "@/components/layout/PipelineRibbon";
import GeoMap from "@/components/geo/GeoMap";
import AttackGraphView from "@/components/graph/AttackGraphView";

function AnalyzeEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailId = searchParams.get("id");

  const [activeTab, setActiveTab] = useState("overview");
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

  // Load samples
  useEffect(() => {
    getSampleScenarios().then(setSamples).catch(console.error);
  }, []);

  // Load email by ID if parameter is present
  useEffect(() => {
    if (emailId) {
      setLoading(true);
      Promise.all([
        getEmailAnalysis(emailId),
        getEmailGraph(emailId).catch(() => null)
      ])
        .then(([emailRes, graphRes]) => {
          setEmailData(emailRes);
          if (graphRes) setGraphData(graphRes);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [emailId]);

  // Run Real-time SSE progress simulation and fetch result
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
    triggerAnalysisWithProgress(analyzeRawText({
      raw_headers: rawHeaders,
      raw_body: rawBody,
      subject: subjectInput || "Manual Forensic Inspection"
    }));
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
    <div className="space-y-6 pb-12">
      {/* Slim Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2933] pb-4">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EBF0] tracking-tight">
            Forensic Analysis Workspace
          </h1>
          <p className="text-xs text-[#7C8896] mt-0.5">
            Deep MIME packet inspection, MTA relay hops, and explainable feature-weighted risk scoring.
          </p>
        </div>

        {emailData && (
          <a
            href={getReportHtmlUrl(emailData.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#161D26] hover:bg-[#1F2933] border border-[#1F2933] text-[#E6EBF0] px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#7C8896]" />
            <span>Export PDF Report</span>
            <ExternalLink className="w-3 h-3 text-[#7C8896]" />
          </a>
        )}
      </div>

      <PipelineRibbon activeStage={activeTab} onSelectStage={(s) => setActiveTab(s)} />

      {/* Intake Selector Box */}
      <div className="soc-card p-4">
        <div className="flex items-center justify-between border-b border-[#1F2933] pb-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[#E6EBF0]">
            <Upload className="w-4 h-4 text-[#2DD4BF]" strokeWidth={1.5} />
            <span>Intake Source</span>
          </div>

          <div className="flex items-center gap-1 bg-[#0B0F14] p-0.5 rounded border border-[#1F2933] text-[11px] font-mono">
            <button
              onClick={() => setActiveInputMode("samples")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeInputMode === "samples"
                  ? "bg-[#161D26] text-[#2DD4BF] font-semibold"
                  : "text-[#7C8896] hover:text-[#E6EBF0]"
              }`}
            >
              Test Scenarios
            </button>
            <button
              onClick={() => setActiveInputMode("upload")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeInputMode === "upload"
                  ? "bg-[#161D26] text-[#2DD4BF] font-semibold"
                  : "text-[#7C8896] hover:text-[#E6EBF0]"
              }`}
            >
              Upload .EML
            </button>
            <button
              onClick={() => setActiveInputMode("paste")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeInputMode === "paste"
                  ? "bg-[#161D26] text-[#2DD4BF] font-semibold"
                  : "text-[#7C8896] hover:text-[#E6EBF0]"
              }`}
            >
              Paste Headers/Body
            </button>
          </div>
        </div>

        {/* 1. Preloaded Sample Scenarios */}
        {activeInputMode === "samples" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {samples.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSample(s)}
                className="soc-card-nested p-3 text-left transition-colors hover:border-[#2DD4BF]/50 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono text-[#7C8896] uppercase">
                      {s.threat_type}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded uppercase ${
                        s.severity === "CRITICAL"
                          ? "text-[#E5484D] bg-[rgba(229,72,77,0.12)]"
                          : s.severity === "HIGH"
                          ? "text-[#F0883E] bg-[rgba(240,136,62,0.12)]"
                          : "text-[#34C795] bg-[rgba(52,199,149,0.12)]"
                      }`}
                    >
                      {s.severity}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#E6EBF0] group-hover:text-[#2DD4BF] transition-colors line-clamp-2">
                    {s.name}
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-[#7C8896] font-mono flex items-center gap-1">
                  <span>Analyze</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 2. Drag & Drop File Upload */}
        {activeInputMode === "upload" && (
          <label className="border border-dashed border-[#1F2933] hover:border-[#2DD4BF]/50 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#0B0F14]">
            <Upload className="w-6 h-6 text-[#7C8896] mb-1.5" strokeWidth={1.5} />
            <span className="text-xs font-medium text-[#E6EBF0]">Select RFC 5322 .EML File</span>
            <span className="text-[10px] text-[#7C8896] mt-0.5 font-mono">Attachments are safely SHA-256 hashed and never executed</span>
            <input type="file" accept=".eml,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        )}

        {/* 3. Paste Raw Text */}
        {activeInputMode === "paste" && (
          <form onSubmit={handleRawSubmit} className="space-y-2.5">
            <input
              type="text"
              placeholder="Subject..."
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              className="w-full bg-[#0B0F14] border border-[#1F2933] rounded-md px-3 py-1.5 text-xs text-[#E6EBF0] focus:outline-none focus:border-[#2DD4BF]"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <textarea
                placeholder="Paste Raw Headers (Received, From, Return-Path, Authentication-Results)..."
                value={rawHeaders}
                onChange={(e) => setRawHeaders(e.target.value)}
                rows={3}
                className="w-full bg-[#0B0F14] border border-[#1F2933] rounded-md p-2.5 text-xs font-mono text-[#E6EBF0] focus:outline-none focus:border-[#2DD4BF]"
              />
              <textarea
                placeholder="Paste Raw Body text or HTML payload..."
                value={rawBody}
                onChange={(e) => setRawBody(e.target.value)}
                rows={3}
                className="w-full bg-[#0B0F14] border border-[#1F2933] rounded-md p-2.5 text-xs font-mono text-[#E6EBF0] focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0B0F14] font-semibold px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors"
            >
              Analyze Input
            </button>
          </form>
        )}

        {/* Progress Bar */}
        {analyzingProgress !== null && (
          <div className="mt-3 p-3 rounded-md bg-[#161D26] border border-[#1F2933] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#E6EBF0]">{progressStage}</span>
              <span className="text-[#2DD4BF] font-semibold">{analyzingProgress}%</span>
            </div>
            <div className="w-full bg-[#0B0F14] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#2DD4BF] h-full transition-all duration-300"
                style={{ width: `${analyzingProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Main Results Workspace */}
      {emailData && (
        <div className="space-y-4">
          {/* Master Verdict Banner */}
          <div className="soc-card p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left Score Block */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-18 h-18 rounded-md border flex flex-col items-center justify-center p-2 text-center flex-shrink-0 ${
                    isCrit
                      ? "border-[rgba(229,72,77,0.4)] bg-[rgba(229,72,77,0.08)]"
                      : isHigh
                      ? "border-[rgba(240,136,62,0.4)] bg-[rgba(240,136,62,0.08)]"
                      : isMed
                      ? "border-[rgba(232,197,71,0.4)] bg-[rgba(232,197,71,0.08)]"
                      : "border-[rgba(52,199,149,0.4)] bg-[rgba(52,199,149,0.08)]"
                  }`}
                >
                  <span className="text-[9px] font-mono uppercase text-[#7C8896]">Score</span>
                  <span className="text-2xl font-mono font-bold text-[#E6EBF0] leading-none my-0.5">
                    {emailData.risk_score}
                  </span>
                  <span className="text-[9px] font-mono text-[#7C8896]">/100</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${
                        isCrit
                          ? "bg-[rgba(229,72,77,0.12)] text-[#E5484D] border-[rgba(229,72,77,0.3)]"
                          : isHigh
                          ? "bg-[rgba(240,136,62,0.12)] text-[#F0883E] border-[rgba(240,136,62,0.3)]"
                          : isMed
                          ? "bg-[rgba(232,197,71,0.12)] text-[#E8C547] border-[rgba(232,197,71,0.3)]"
                          : "bg-[rgba(52,199,149,0.12)] text-[#34C795] border-[rgba(52,199,149,0.3)]"
                      }`}
                    >
                      {emailData.severity}
                    </span>
                    <span className="text-xs font-semibold text-[#E6EBF0]">
                      {emailData.classification}
                    </span>
                  </div>

                  <h2 className="text-sm font-semibold text-[#E6EBF0] line-clamp-1">
                    {emailData.subject}
                  </h2>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[#7C8896] flex-wrap font-mono">
                    <div>
                      <span className="text-[#E6EBF0]">From:</span> {emailData.from_addr}
                    </div>
                    <div>
                      <span className="text-[#E6EBF0]">To:</span> {emailData.to_addr}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#7C8896]">
                      <span>SHA-256: {emailData.sha256.substring(0, 12)}...</span>
                      <button
                        onClick={() => handleCopySha(emailData.sha256)}
                        className="hover:text-[#E6EBF0] cursor-pointer"
                      >
                        {copiedSha ? <Check className="w-3 h-3 text-[#34C795]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right MITRE Techniques */}
              <div className="lg:border-l lg:border-[#1F2933] lg:pl-4 space-y-1.5">
                <div className="soc-label">
                  MITRE ATT&CK Indicators
                </div>
                <div className="flex flex-wrap gap-1.5 max-w-sm">
                  {emailData.mitre_techniques?.map((m: any) => (
                    <span
                      key={m.id}
                      title={`${m.name}: ${m.description}`}
                      className="text-[10px] font-mono bg-[#161D26] border border-[#1F2933] text-[#E6EBF0] px-2 py-0.5 rounded cursor-help"
                    >
                      {m.id} • {m.name}
                    </span>
                  ))}
                  {(!emailData.mitre_techniques || emailData.mitre_techniques.length === 0) && (
                    <span className="text-[11px] text-[#7C8896] font-mono">No threat techniques triggered</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Forensic Workspace Tabs */}
          <div className="border-b border-[#1F2933] overflow-x-auto select-none flex gap-1">
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
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "border-[#2DD4BF] text-[#2DD4BF] bg-[#161D26]"
                      : "border-transparent text-[#7C8896] hover:text-[#E6EBF0] hover:bg-[#10161D]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & AUTH */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-4 lg:col-span-2">
                <div className="soc-card p-4 space-y-3">
                  <div className="soc-label">RFC 5322 Envelope Headers</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="soc-card-nested p-2.5">
                      <div className="text-[10px] text-[#7C8896] font-mono">From</div>
                      <div className="font-mono text-[#E6EBF0] mt-0.5 truncate">{emailData.from_addr}</div>
                      {emailData.from_display_name && (
                        <div className="text-[10px] text-[#2DD4BF] mt-0.5">"{emailData.from_display_name}"</div>
                      )}
                    </div>
                    <div className="soc-card-nested p-2.5">
                      <div className="text-[10px] text-[#7C8896] font-mono">To</div>
                      <div className="font-mono text-[#E6EBF0] mt-0.5 truncate">{emailData.to_addr}</div>
                    </div>
                    <div className="soc-card-nested p-2.5">
                      <div className="text-[10px] text-[#7C8896] font-mono">Return-Path</div>
                      <div className="font-mono text-[#E6EBF0] mt-0.5 truncate">{emailData.return_path || "None"}</div>
                    </div>
                    <div className="soc-card-nested p-2.5">
                      <div className="text-[10px] text-[#7C8896] font-mono">Reply-To</div>
                      <div className="font-mono text-[#E6EBF0] mt-0.5 truncate">{emailData.reply_to || "Aligned with From"}</div>
                    </div>
                  </div>
                </div>

                <div className="soc-card p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="soc-label">Sanitized Body Preview</div>
                    <span className="text-[10px] font-mono text-[#34C795]">Scripts Stripped</span>
                  </div>
                  <div className="bg-white text-slate-900 p-3.5 rounded text-xs max-h-64 overflow-y-auto shadow-inner">
                    {emailData.body_html_sanitized ? (
                      <div dangerouslySetInnerHTML={{ __html: emailData.body_html_sanitized }} />
                    ) : (
                      <pre className="font-sans whitespace-pre-wrap">{emailData.body_plain_snippet || "No body text."}</pre>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="soc-card p-4 space-y-2.5">
                  <div className="soc-label">Authentication Integrity</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-[#0B0F14] border border-[#1F2933]">
                      <span className="text-[#E6EBF0]">DMARC Policy</span>
                      <span
                        className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                          emailData.auth_results?.dmarc_status === "fail"
                            ? "bg-[rgba(229,72,77,0.12)] text-[#E5484D]"
                            : "bg-[rgba(52,199,149,0.12)] text-[#34C795]"
                        }`}
                      >
                        {emailData.auth_results?.dmarc_status} ({emailData.auth_results?.dmarc_policy})
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-[#0B0F14] border border-[#1F2933]">
                      <span className="text-[#E6EBF0]">SPF Status</span>
                      <span
                        className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                          emailData.auth_results?.spf_status === "fail" || emailData.auth_results?.spf_status === "softfail"
                            ? "bg-[rgba(229,72,77,0.12)] text-[#E5484D]"
                            : "bg-[rgba(52,199,149,0.12)] text-[#34C795]"
                        }`}
                      >
                        {emailData.auth_results?.spf_status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-[#0B0F14] border border-[#1F2933]">
                      <span className="text-[#E6EBF0]">Return-Path Alignment</span>
                      <span
                        className={`font-mono text-[10px] font-semibold ${
                          emailData.auth_results?.return_path_aligned ? "text-[#34C795]" : "text-[#E5484D]"
                        }`}
                      >
                        {emailData.auth_results?.return_path_aligned ? "ALIGNED" : "MISALIGNED"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-[#0B0F14] border border-[#1F2933]">
                      <span className="text-[#E6EBF0]">Display Name Spoof</span>
                      <span
                        className={`font-mono text-[10px] font-semibold ${
                          emailData.auth_results?.display_name_spoof ? "text-[#E5484D]" : "text-[#34C795]"
                        }`}
                      >
                        {emailData.auth_results?.display_name_spoof ? "DETECTED" : "CLEAN"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="soc-card p-4 space-y-2.5">
                  <div className="soc-label">Attachments ({emailData.attachments?.length || 0})</div>
                  {emailData.attachments?.length === 0 ? (
                    <p className="text-xs text-[#7C8896]">No attachments in message.</p>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {emailData.attachments?.map((a: any) => (
                        <div key={a.sha256} className="soc-card-nested p-2">
                          <div className="flex items-center justify-between font-mono text-[#E6EBF0]">
                            <span className="truncate">{a.filename}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded ${
                                a.is_malicious ? "bg-[rgba(229,72,77,0.12)] text-[#E5484D]" : "text-[#7C8896]"
                              }`}
                            >
                              {a.is_malicious ? "THREAT" : "CLEAN"}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#7C8896] font-mono mt-1 truncate">
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
            <div className="space-y-4">
              <div className="soc-card p-4 space-y-1.5 border-l-2 border-l-[#2DD4BF]">
                <div className="soc-label text-[#2DD4BF]">Explainable AI Synthesis</div>
                <p className="text-xs text-[#E6EBF0] leading-relaxed">
                  {emailData.explanation_summary}
                </p>
              </div>

              <div className="soc-card overflow-hidden">
                <div className="p-3 border-b border-[#1F2933] bg-[#0B0F14] flex items-center justify-between">
                  <span className="soc-label text-[#E6EBF0]">Feature-Weighted Scoring Formula (0–100)</span>
                  <span className="text-[10px] text-[#7C8896] font-mono">Deterministic Impact Points</span>
                </div>
                <table className="w-full text-left text-xs text-[#7C8896]">
                  <thead className="bg-[#0B0F14] uppercase text-[10px] font-semibold border-b border-[#1F2933] font-mono">
                    <tr>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5">Feature</th>
                      <th className="px-4 py-2.5">Forensic Evidence</th>
                      <th className="px-4 py-2.5">Impact</th>
                      <th className="px-4 py-2.5">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2933]">
                    {emailData.feature_breakdown?.map((f: any, idx: number) => {
                      const isPositive = f.impact > 0;
                      return (
                        <tr key={idx} className="hover:bg-[#161D26]/50">
                          <td className="px-4 py-2.5 font-mono text-[10px] text-[#2DD4BF]">
                            {f.category}
                          </td>
                          <td className="px-4 py-2.5 text-[#E6EBF0] font-medium">
                            {f.feature}
                          </td>
                          <td className="px-4 py-2.5 text-[#E6EBF0]">
                            {f.evidence}
                          </td>
                          <td className="px-4 py-2.5 font-mono font-semibold">
                            <span className={isPositive ? "text-[#E5484D]" : "text-[#34C795]"}>
                              {isPositive ? `+${f.impact}` : f.impact} pts
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[#E6EBF0]">
                            {f.confidence}%
                          </td>
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
            <div className="soc-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="soc-label">Sequential MTA Hop Relay Path</div>
                  <p className="text-[11px] text-[#7C8896]">Received header reconstruction from originating sender to destination gateway</p>
                </div>
                <span className="text-[10px] font-mono text-[#7C8896]">
                  {emailData.hops?.length || 0} Hops
                </span>
              </div>

              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-[#1F2933]">
                {emailData.hops?.map((hop: any, idx: number) => {
                  const hasFlags = hop.risk_flags && hop.risk_flags.length > 0;
                  return (
                    <div key={idx} className="relative pl-8">
                      <div
                        className={`absolute left-2 top-2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${
                          hasFlags ? "bg-[#E5484D]" : "bg-[#2DD4BF]"
                        }`}
                      ></div>

                      <div className="soc-card-nested p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#E6EBF0]">Hop #{hop.hop_index}</span>
                            <span className="font-mono text-[#2DD4BF]">{hop.ip || "Internal"}</span>
                            {hop.is_private_ip && (
                              <span className="text-[9px] bg-[#0B0F14] text-[#7C8896] px-1.5 py-0.2 rounded font-mono">
                                RFC1918 Private
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-[#7C8896]">
                            Delay: <strong className="text-[#E6EBF0]">{hop.delay_seconds}s</strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#7C8896] bg-[#0B0F14] p-2 rounded border border-[#1F2933]">
                          <div>From: <span className="text-[#E6EBF0]">{hop.from_host || "N/A"}</span></div>
                          <div>By: <span className="text-[#E6EBF0]">{hop.by_host || "N/A"}</span></div>
                          <div>ASN: <span className="text-[#E6EBF0]">{hop.asn} ({hop.asn_org})</span></div>
                        </div>

                        {hasFlags && (
                          <div className="text-[11px] text-[#E5484D] bg-[rgba(229,72,77,0.08)] p-1.5 rounded border border-[rgba(229,72,77,0.2)] flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
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

          {/* TAB 4: GEOLOCATION MATRIX */}
          {activeTab === "geolocate" && (
            <GeoMap ips={emailData.ips_intel || []} />
          )}

          {/* TAB 5: DOMAIN & URL INTEL */}
          {activeTab === "correlate" && (
            <div className="space-y-4">
              <div className="soc-card p-4 space-y-3">
                <div className="soc-label">Domain Intelligence & Typo-Squatting</div>
                {emailData.domains_intel?.map((dom: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between bg-[#0B0F14] p-2.5 rounded border border-[#1F2933]">
                      <div>
                        <span className="font-mono text-sm font-semibold text-[#E6EBF0]">{dom.domain}</span>
                        <div className="text-[10px] text-[#7C8896]">Registrar: {dom.registrar || "Privacy"}</div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                            dom.is_lookalike
                              ? "bg-[rgba(229,72,77,0.12)] text-[#E5484D]"
                              : "bg-[rgba(52,199,149,0.12)] text-[#34C795]"
                          }`}
                        >
                          {dom.is_lookalike ? `LOOKALIKE (${dom.impersonated_brand})` : "AUTHENTIC"}
                        </span>
                        <div className="text-[10px] text-[#7C8896] font-mono mt-0.5">Age: {dom.age_days}d</div>
                      </div>
                    </div>
                    <p className="text-xs text-[#7C8896]">{dom.reason_summary}</p>
                  </div>
                ))}
              </div>

              <div className="soc-card p-4 space-y-3">
                <div className="soc-label">Extracted URLs ({emailData.urls?.length || 0})</div>
                {emailData.urls?.length === 0 ? (
                  <p className="text-xs text-[#7C8896]">No external hyperlinks found.</p>
                ) : (
                  <div className="space-y-2">
                    {emailData.urls?.map((u: any, idx: number) => (
                      <div key={idx} className="soc-card-nested p-2.5 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-[#E6EBF0] truncate max-w-md">{u.original_url}</span>
                          <span className="text-[10px] font-semibold text-[#E5484D] bg-[rgba(229,72,77,0.12)] px-2 py-0.5 rounded">
                            Risk {u.risk_score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ATTACK GRAPH */}
          {activeTab === "visualize" && (
            <AttackGraphView graphData={graphData || { nodes: [], edges: [] }} />
          )}

          {/* TAB 7: CAMPAIGN DNA */}
          {activeTab === "cluster" && (
            <div className="soc-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="soc-label text-[#A78BFA]">Adversary Campaign DNA</div>
                {emailData.campaign_association?.matched && (
                  <span className="text-xs font-mono text-[#A78BFA] bg-[rgba(167,139,250,0.12)] px-2.5 py-0.5 rounded">
                    Confidence: {emailData.campaign_association.confidence}%
                  </span>
                )}
              </div>

              {emailData.campaign_association?.matched ? (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-[#E6EBF0]">
                    {emailData.campaign_association.campaign_name}
                  </div>
                  <p className="text-xs text-[#7C8896] leading-relaxed">
                    {emailData.campaign_association.description}
                  </p>
                  <div className="soc-card-nested p-3 space-y-1.5">
                    <div className="soc-label">Shared IOC Signatures</div>
                    <ul className="space-y-1 text-xs text-[#E6EBF0]">
                      {emailData.campaign_association.shared_signals?.map((sig: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#A78BFA]" />
                          <span>{sig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#7C8896]">No established campaign cluster matched this incident.</p>
              )}
            </div>
          )}

          {/* TAB 8: FORENSIC TIMELINE */}
          {activeTab === "timeline" && (
            <div className="soc-card p-4 space-y-3">
              <div className="soc-label">Incident Event Timeline</div>
              <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-[#1F2933]">
                <div className="relative text-xs text-[#E6EBF0]">
                  <span className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-[#2DD4BF]"></span>
                  <div className="font-semibold text-[#E6EBF0]">Email Dispatched from Origin MTA</div>
                  <div className="text-[10px] text-[#7C8896] font-mono">{emailData.date_header || "2026-08-23 10:14:00 UTC"}</div>
                </div>
                <div className="relative text-xs text-[#E6EBF0]">
                  <span className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-[#E8C547]"></span>
                  <div className="font-semibold text-[#E6EBF0]">Authentication Evaluated on Ingestion</div>
                  <div className="text-[10px] text-[#7C8896] font-mono">DMARC {emailData.auth_results?.dmarc_status}</div>
                </div>
                <div className="relative text-xs text-[#E6EBF0]">
                  <span className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-[#E5484D]"></span>
                  <div className="font-semibold text-[#E6EBF0]">Threat Signature Scored</div>
                  <div className="text-[10px] text-[#7C8896] font-mono">Score: {emailData.risk_score}/100</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ACTION CHECKLIST */}
          {activeTab === "actions" && (
            <div className="soc-card p-4 space-y-3">
              <div className="soc-label">Containment Action Items</div>
              <div className="space-y-2">
                {[
                  { id: "act-1", title: "Perimeter IOC Firewall Block", desc: `Block domain '${emailData.from_addr.split('@')[1]}' on mail perimeter.`, priority: "HIGH" },
                  { id: "act-2", title: "Mailbox Recipient Sweep", desc: `Search mailboxes for subject '${emailData.subject?.substring(0, 30)}...'.`, priority: "HIGH" },
                  { id: "act-3", title: "Credential Invalidation", desc: `Revoke active sessions for target recipient ${emailData.to_addr}.`, priority: "MEDIUM" },
                  { id: "act-4", title: "Evidence Preservation", desc: `Raw EML hash preserved (${emailData.sha256.substring(0, 16)}...).`, priority: "LOW" }
                ].map((act) => (
                  <div key={act.id} className="p-2.5 bg-[#0B0F14] border border-[#1F2933] rounded-md flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-[#E6EBF0]">{act.title}</div>
                      <div className="text-[11px] text-[#7C8896]">{act.desc}</div>
                    </div>
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-[rgba(229,72,77,0.12)] text-[#E5484D]">
                      {act.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: EVIDENCE REGISTRY */}
          {activeTab === "evidence" && (
            <div className="soc-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="soc-label">Cryptographic Evidence Vault</div>
                <span className="text-[10px] font-mono text-[#34C795]">Write-Once Immutable</span>
              </div>
              <div className="space-y-2.5">
                <div className="soc-card-nested p-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#E6EBF0]">Raw RFC 5322 EML</span>
                    <span className="text-[#34C795] font-mono text-[10px]">PRESERVED</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#E6EBF0] bg-[#0B0F14] p-2 rounded border border-[#1F2933] break-all">
                    SHA-256: {emailData.sha256}
                  </div>
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
    <Suspense fallback={<div className="p-6 text-[#7C8896] font-mono text-xs">Loading Workspace...</div>}>
      <AnalyzeEmailContent />
    </Suspense>
  );
}
