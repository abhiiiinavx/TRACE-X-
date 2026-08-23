"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  FileSearch,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Dna,
  Route,
  MapPin,
  GitMerge,
  Network,
  Clock,
  CheckSquare,
  Lock,
  Printer,
  ChevronRight,
  ExternalLink,
  Info,
  Layers,
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
    setProgressStage("MIME Parsing & Cryptographic Integrity Extraction...");

    const p1 = setTimeout(() => {
      setAnalyzingProgress(35);
      setProgressStage("Email Authentication (SPF/DKIM/DMARC) Validation...");
    }, 200);

    const p2 = setTimeout(() => {
      setAnalyzingProgress(60);
      setProgressStage("NLP Intent & Brand Typosquatting Analysis...");
    }, 450);

    const p3 = setTimeout(() => {
      setAnalyzingProgress(85);
      setProgressStage("MTA Hop Relay Reconstruction & Threat Clustering...");
    }, 700);

    try {
      const res = await analysisPromise;
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      setAnalyzingProgress(100);
      setProgressStage("Forensic Analysis Complete!");

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
      {/* Top Banner & Pipeline Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-cyan-400" />
            <span>Forensic Analysis Workspace</span>
          </h1>
          <p className="text-xs text-slate-400">
            Deep-packet email forensics, hop relay telemetry, and explainable AI attribution
          </p>
        </div>

        {emailData && (
          <a
            href={getReportHtmlUrl(emailData.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#111a30] hover:bg-slate-800 border border-slate-700 text-cyan-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Forensic PDF Report</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        )}
      </div>

      <PipelineRibbon activeStage={activeTab} onSelectStage={(s) => setActiveTab(s)} />

      {/* Intake & Upload Box (Accordion or Switcher) */}
      <div className="cyber-card p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Select Intake Source for Investigation</span>
          </div>

          <div className="flex items-center gap-1 bg-[#080d1a] p-1 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveInputMode("samples")}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                activeInputMode === "samples"
                  ? "bg-cyan-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⚡ High-Profile Scenarios
            </button>
            <button
              onClick={() => setActiveInputMode("upload")}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                activeInputMode === "upload"
                  ? "bg-cyan-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📁 Upload .EML
            </button>
            <button
              onClick={() => setActiveInputMode("paste")}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                activeInputMode === "paste"
                  ? "bg-cyan-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📝 Paste Raw Envelope
            </button>
          </div>
        </div>

        {/* 1. Preloaded Sample Scenarios */}
        {activeInputMode === "samples" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {samples.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSample(s)}
                className="cyber-card p-3 rounded-xl border border-slate-800 hover:border-cyan-500/50 text-left transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {s.threat_type}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        s.severity === "CRITICAL"
                          ? "text-red-400 bg-red-950/80 border border-red-500/30"
                          : s.severity === "HIGH"
                          ? "text-orange-400 bg-orange-950/80 border border-orange-500/30"
                          : "text-emerald-400 bg-emerald-950/80 border border-emerald-500/30"
                      }`}
                    >
                      {s.severity}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {s.name}
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                  <span>Run Forensic Test</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 2. Drag & Drop File Upload */}
        {activeInputMode === "upload" && (
          <label className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#080d1a]/50">
            <Upload className="w-8 h-8 text-cyan-400 mb-2 animate-bounce" />
            <span className="text-xs font-bold text-white">Upload RFC 5322 .EML File</span>
            <span className="text-[10px] text-slate-400 mt-1">Attachments will be safely hashed and never executed</span>
            <input type="file" accept=".eml,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        )}

        {/* 3. Paste Raw Text */}
        {activeInputMode === "paste" && (
          <form onSubmit={handleRawSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Subject..."
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              className="w-full bg-[#080d1a] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <textarea
                placeholder="Paste Raw Headers (Received, From, Return-Path, Authentication-Results)..."
                value={rawHeaders}
                onChange={(e) => setRawHeaders(e.target.value)}
                rows={4}
                className="w-full bg-[#080d1a] border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200"
              />
              <textarea
                placeholder="Paste Raw Body text or HTML payload..."
                value={rawBody}
                onChange={(e) => setRawBody(e.target.value)}
                rows={4}
                className="w-full bg-[#080d1a] border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200"
              />
            </div>
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
            >
              Analyze Input
            </button>
          </form>
        )}

        {/* Live SSE Analysis Progress Banner */}
        {analyzingProgress !== null && (
          <div className="mt-4 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-300 font-bold">{progressStage}</span>
              <span className="text-cyan-400 font-bold">{analyzingProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-cyan-500/30">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${analyzingProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Main Verdict & Forensic Results Workspace */}
      {emailData && (
        <div className="space-y-6">
          {/* Master Verdict Banner */}
          <div
            className={`cyber-card p-6 rounded-2xl border ${
              isCrit
                ? "border-red-500/50 bg-gradient-to-r from-red-950/30 via-[#0c1222] to-[#0c1222]"
                : isHigh
                ? "border-orange-500/50 bg-gradient-to-r from-orange-950/30 via-[#0c1222] to-[#0c1222]"
                : isMed
                ? "border-amber-500/50 bg-gradient-to-r from-amber-950/30 via-[#0c1222] to-[#0c1222]"
                : "border-emerald-500/50 bg-gradient-to-r from-emerald-950/30 via-[#0c1222] to-[#0c1222]"
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Score Meter */}
              <div className="flex items-center gap-5">
                <div
                  className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center shadow-xl ${
                    isCrit
                      ? "border-red-500 bg-red-950/80 shadow-red-500/20"
                      : isHigh
                      ? "border-orange-500 bg-orange-950/80 shadow-orange-500/20"
                      : isMed
                      ? "border-amber-500 bg-amber-950/80 shadow-amber-500/20"
                      : "border-emerald-500 bg-emerald-950/80 shadow-emerald-500/20"
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-300">Risk Score</span>
                  <span className="text-3xl font-black font-mono text-white leading-none my-1">
                    {emailData.risk_score}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">/100</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                        isCrit
                          ? "bg-red-900 border-red-500 text-red-100"
                          : isHigh
                          ? "bg-orange-900 border-orange-500 text-orange-100"
                          : isMed
                          ? "bg-amber-900 border-amber-500 text-amber-100"
                          : "bg-emerald-900 border-emerald-500 text-emerald-100"
                      }`}
                    >
                      {emailData.severity} SEVERITY
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {emailData.classification}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                    {emailData.subject}
                  </h2>

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                    <div>
                      <strong className="text-slate-300">From:</strong> {emailData.from_addr}
                    </div>
                    <div>
                      <strong className="text-slate-300">To:</strong> {emailData.to_addr}
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-cyan-300">
                      <span>SHA-256: {emailData.sha256.substring(0, 12)}...</span>
                      <button
                        onClick={() => handleCopySha(emailData.sha256)}
                        className="hover:text-white cursor-pointer"
                      >
                        {copiedSha ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right MITRE ATT&CK Matrix Badges */}
              <div className="lg:border-l lg:border-slate-800 lg:pl-6 space-y-2">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  Detected MITRE ATT&CK Techniques:
                </div>
                <div className="flex flex-wrap gap-1.5 max-w-sm">
                  {emailData.mitre_techniques?.map((m: any) => (
                    <span
                      key={m.id}
                      title={`${m.name}: ${m.description}`}
                      className="text-[10px] font-mono font-bold bg-[#0c1222] border border-cyan-500/40 text-cyan-300 px-2 py-1 rounded cursor-help"
                    >
                      {m.id} • {m.name}
                    </span>
                  ))}
                  {(!emailData.mitre_techniques || emailData.mitre_techniques.length === 0) && (
                    <span className="text-[11px] text-slate-500 font-mono">No MITRE threat techniques triggered</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Forensic Workspace Tabs Navigation */}
          <div className="border-b border-slate-800 overflow-x-auto select-none flex gap-1">
            {[
              { id: "overview", label: "Overview & Envelope", icon: FileText },
              { id: "explain", label: "Explainable AI & Weights", icon: Sparkles },
              { id: "trace", label: "Header Hop Forensics", icon: Route },
              { id: "geolocate", label: "Geolocation Matrix", icon: MapPin },
              { id: "correlate", label: "Domain & URL Intel", icon: GitMerge },
              { id: "visualize", label: "Attack Graph", icon: Network },
              { id: "cluster", label: "Campaign DNA", icon: Dna },
              { id: "timeline", label: "Forensic Timeline", icon: Clock },
              { id: "actions", label: "Action Checklist", icon: CheckSquare },
              { id: "evidence", label: "Evidence Registry", icon: Lock }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "border-cyan-400 text-cyan-300 bg-cyan-950/20"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & ENVELOPE */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Envelope Metadata Cards */}
              <div className="space-y-4 lg:col-span-2">
                <div className="cyber-card p-5 rounded-xl space-y-4">
                  <h3 className="text-xs font-extrabold uppercase font-mono tracking-wider text-cyan-400">
                    RFC 5322 Envelope Headers
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#080d1a] p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">From (Envelope Sender)</div>
                      <div className="font-bold text-white font-mono mt-0.5">{emailData.from_addr}</div>
                      {emailData.from_display_name && (
                        <div className="text-[10px] text-cyan-300 mt-0.5">"{emailData.from_display_name}"</div>
                      )}
                    </div>
                    <div className="bg-[#080d1a] p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">To (Target Recipient)</div>
                      <div className="font-bold text-white font-mono mt-0.5">{emailData.to_addr}</div>
                    </div>
                    <div className="bg-[#080d1a] p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">Return-Path</div>
                      <div className="font-bold text-white font-mono mt-0.5">{emailData.return_path || "None specified"}</div>
                    </div>
                    <div className="bg-[#080d1a] p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">Reply-To Route</div>
                      <div className="font-bold text-white font-mono mt-0.5">{emailData.reply_to || "Aligned with From"}</div>
                    </div>
                  </div>
                </div>

                {/* Sanitized Email Body Preview */}
                <div className="cyber-card p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase font-mono tracking-wider text-cyan-400">
                      Sanitized Email Content Preview
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                      Scripts & IFrames Stripped
                    </span>
                  </div>
                  <div className="bg-white text-slate-900 p-4 rounded-lg text-xs max-h-72 overflow-y-auto border border-slate-700 shadow-inner">
                    {emailData.body_html_sanitized ? (
                      <div dangerouslySetInnerHTML={{ __html: emailData.body_html_sanitized }} />
                    ) : (
                      <pre className="font-sans whitespace-pre-wrap">{emailData.body_plain_snippet || "No body text extracted."}</pre>
                    )}
                  </div>
                </div>
              </div>

              {/* Authentication Security Summary */}
              <div className="space-y-4">
                <div className="cyber-card p-5 rounded-xl space-y-3">
                  <h3 className="text-xs font-extrabold uppercase font-mono tracking-wider text-cyan-400">
                    Authentication Integrity
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#080d1a] border border-slate-800">
                      <span className="font-bold text-slate-300">DMARC Policy</span>
                      <span
                        className={`font-mono font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                          emailData.auth_results?.dmarc_status === "fail"
                            ? "bg-red-950 text-red-400 border border-red-500/40"
                            : "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                        }`}
                      >
                        {emailData.auth_results?.dmarc_status} ({emailData.auth_results?.dmarc_policy})
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#080d1a] border border-slate-800">
                      <span className="font-bold text-slate-300">SPF Validation</span>
                      <span
                        className={`font-mono font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                          emailData.auth_results?.spf_status === "fail" || emailData.auth_results?.spf_status === "softfail"
                            ? "bg-red-950 text-red-400 border border-red-500/40"
                            : "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                        }`}
                      >
                        {emailData.auth_results?.spf_status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#080d1a] border border-slate-800">
                      <span className="font-bold text-slate-300">Return-Path Alignment</span>
                      <span
                        className={`font-mono font-bold text-[10px] ${
                          emailData.auth_results?.return_path_aligned ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {emailData.auth_results?.return_path_aligned ? "ALIGNED" : "MISALIGNED"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#080d1a] border border-slate-800">
                      <span className="font-bold text-slate-300">Display Name Spoof</span>
                      <span
                        className={`font-mono font-bold text-[10px] ${
                          emailData.auth_results?.display_name_spoof ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        {emailData.auth_results?.display_name_spoof ? "DECEPTIVE" : "CLEAN"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attachment Ledger */}
                <div className="cyber-card p-5 rounded-xl space-y-3">
                  <h3 className="text-xs font-extrabold uppercase font-mono tracking-wider text-cyan-400">
                    Attachments ({emailData.attachments?.length || 0})
                  </h3>
                  {emailData.attachments?.length === 0 ? (
                    <p className="text-xs text-slate-400">No attachments included in message.</p>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {emailData.attachments?.map((a: any) => (
                        <div key={a.sha256} className="bg-[#080d1a] p-2.5 rounded-lg border border-slate-800">
                          <div className="flex items-center justify-between font-bold text-white">
                            <span className="truncate">{a.filename}</span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                                a.is_malicious ? "bg-red-950 text-red-300 border border-red-500/40" : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {a.is_malicious ? "WEAPONIZED" : "PRESERVED"}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            SHA-256: {a.sha256.substring(0, 16)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXPLAINABLE AI & WEIGHTS */}
          {activeTab === "explain" && (
            <div className="space-y-6">
              {/* Natural Language Summary Banner */}
              <div className="cyber-card p-5 rounded-xl border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-[#0c1222] to-[#0c1222]">
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase font-mono mb-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Explainable AI Synthesis</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {emailData.explanation_summary}
                </p>
              </div>

              {/* Transparent Feature Impact Table */}
              <div className="cyber-card rounded-xl overflow-hidden border border-slate-800">
                <div className="p-4 border-b border-slate-800 bg-[#080d1a] flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase font-mono text-white">
                    Inspectable Feature-Weighted Scoring Breakdown (0–100 Formula)
                  </h3>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    Deterministic Impact Points
                  </span>
                </div>
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#080d1a] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 font-mono">
                    <tr>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Feature Name</th>
                      <th className="px-5 py-3">Extracted Forensic Evidence</th>
                      <th className="px-4 py-3">Score Impact</th>
                      <th className="px-4 py-3">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {emailData.feature_breakdown?.map((f: any, idx: number) => {
                      const isPositive = f.impact > 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="px-5 py-3 font-mono text-[10px] text-cyan-400">
                            {f.category || "Detection"}
                          </td>
                          <td className="px-5 py-3 font-bold text-white">
                            {f.feature}
                          </td>
                          <td className="px-5 py-3 text-slate-300">
                            {f.evidence}
                          </td>
                          <td className="px-4 py-3 font-mono font-extrabold">
                            <span className={isPositive ? "text-red-400" : "text-emerald-400"}>
                              {isPositive ? `+${f.impact}` : f.impact} pts
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-cyan-300 font-bold">
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
            <div className="space-y-6">
              <div className="cyber-card p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase font-mono text-cyan-400">
                      Sequential MTA Hop Relay Path Diagram
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Trace of Received headers from Originating Sender MTA to Destination Gateway
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                    {emailData.hops?.length || 0} Sequential Hops
                  </span>
                </div>

                {/* Vertical Hop Timeline */}
                <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-cyan-500/30">
                  {emailData.hops?.map((hop: any, idx: number) => {
                    const hasFlags = hop.risk_flags && hop.risk_flags.length > 0;
                    return (
                      <div key={idx} className="relative pl-10">
                        {/* Hop Indicator Dot */}
                        <div
                          className={`absolute left-2.5 top-2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 ${
                            hasFlags
                              ? "bg-red-500 border-white shadow-md shadow-red-500/50"
                              : "bg-cyan-400 border-slate-900 shadow-md shadow-cyan-500/50"
                          }`}
                        ></div>

                        <div className="cyber-card p-4 rounded-xl border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">Hop #{hop.hop_index}</span>
                              <span className="font-mono text-cyan-300 font-bold">{hop.ip || "Internal Routing"}</span>
                              {hop.is_private_ip && (
                                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                                  RFC1918 Private
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[10px]">
                              <span className="text-slate-400">Transit Delay:</span>
                              <span className="font-bold text-cyan-400">{hop.delay_seconds}s</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 mt-2 bg-[#080d1a] p-2.5 rounded-lg border border-slate-800">
                            <div>
                              <strong className="text-slate-400">From Host:</strong> {hop.from_host || "N/A"}
                            </div>
                            <div>
                              <strong className="text-slate-400">By Host:</strong> {hop.by_host || "N/A"}
                            </div>
                            <div>
                              <strong className="text-slate-400">Autonomous System:</strong> {hop.asn} ({hop.asn_org})
                            </div>
                          </div>

                          {hasFlags && (
                            <div className="mt-2 text-[11px] text-red-400 bg-red-950/40 p-2 rounded border border-red-500/30 flex items-center gap-1.5">
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
            </div>
          )}

          {/* TAB 4: GEOLOCATION MATRIX */}
          {activeTab === "geolocate" && (
            <GeoMap ips={emailData.ips_intel || []} />
          )}

          {/* TAB 5: DOMAIN & URL INTEL */}
          {activeTab === "correlate" && (
            <div className="space-y-6">
              {/* Domain Intelligence Section */}
              <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-extrabold uppercase font-mono text-cyan-400">
                  Domain Intelligence & Typo-Squatting Analysis
                </h3>
                {emailData.domains_intel?.map((dom: any, idx: number) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center justify-between bg-[#080d1a] p-3 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-sm font-black text-white font-mono">{dom.domain}</span>
                        <div className="text-[10px] text-slate-400">Registrar: {dom.registrar || "Privacy Shield"}</div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                            dom.is_lookalike
                              ? "bg-red-950 text-red-300 border border-red-500/40"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                          }`}
                        >
                          {dom.is_lookalike ? `LOOKALIKE (${dom.impersonated_brand})` : "AUTHENTIC"}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Age: {dom.age_days} days</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 italic">{dom.reason_summary}</p>
                  </div>
                ))}
              </div>

              {/* URL Intelligence Section */}
              <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-extrabold uppercase font-mono text-cyan-400">
                  Extracted URLs & Redirection Chains ({emailData.urls?.length || 0})
                </h3>
                {emailData.urls?.length === 0 ? (
                  <p className="text-xs text-slate-400">No external hyperlinks found in email body.</p>
                ) : (
                  <div className="space-y-3">
                    {emailData.urls?.map((u: any, idx: number) => (
                      <div key={idx} className="cyber-card p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-cyan-300 font-bold truncate max-w-md">{u.original_url}</span>
                          <span className="text-[10px] font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-500/30">
                            Risk: {u.risk_score}/100
                          </span>
                        </div>

                        {u.redirect_chain?.length > 1 && (
                          <div className="bg-[#080d1a] p-2.5 rounded-lg text-[11px] font-mono text-slate-300">
                            <span className="text-[10px] text-slate-400 block mb-1">Redirect Chain:</span>
                            {u.redirect_chain.map((r: string, rIdx: number) => (
                              <div key={rIdx} className="flex items-center gap-1.5 text-cyan-400">
                                <span>↳</span>
                                <span className="truncate">{r}</span>
                              </div>
                            ))}
                          </div>
                        )}
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
            <div className="cyber-card p-6 rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/20 via-[#0c1222] to-[#0c1222] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dna className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-extrabold text-white">Adversary Campaign DNA Profile</h3>
                </div>
                {emailData.campaign_association?.matched ? (
                  <span className="text-xs font-mono font-bold bg-purple-950 text-purple-300 px-3 py-1 rounded-full border border-purple-500/50">
                    MATCHED (Confidence: {emailData.campaign_association.confidence}%)
                  </span>
                ) : (
                  <span className="text-xs font-mono bg-slate-800 text-slate-400 px-3 py-1 rounded-full">
                    Isolated Threat
                  </span>
                )}
              </div>

              {emailData.campaign_association?.matched ? (
                <div className="space-y-4">
                  <div className="text-base font-bold text-purple-200">
                    {emailData.campaign_association.campaign_name}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {emailData.campaign_association.description}
                  </p>

                  <div className="bg-[#080d1a] p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
                      Correlated Shared IOC Signatures:
                    </div>
                    <ul className="space-y-1 text-xs text-slate-200">
                      {emailData.campaign_association.shared_signals?.map((sig: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>{sig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  No established multi-stage campaign signatures matched this email with &gt;40% correlation threshold.
                </p>
              )}
            </div>
          )}

          {/* TAB 8: FORENSIC TIMELINE */}
          {activeTab === "timeline" && (
            <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-extrabold uppercase font-mono text-cyan-400">
                Incident Event Timeline
              </h3>
              <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                <div className="relative text-xs text-slate-200">
                  <span className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-cyan-400"></span>
                  <div className="font-bold text-white">Email Dispatched from Sender MTA</div>
                  <div className="text-[10px] text-slate-400 font-mono">{emailData.date_header || "2026-08-23 10:14:00 UTC"}</div>
                </div>
                <div className="relative text-xs text-slate-200">
                  <span className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-amber-400"></span>
                  <div className="font-bold text-white">Authentication Evaluated on Ingestion</div>
                  <div className="text-[10px] text-slate-400 font-mono">DMARC {emailData.auth_results?.dmarc_status}</div>
                </div>
                <div className="relative text-xs text-slate-200">
                  <span className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-red-400"></span>
                  <div className="font-bold text-white">Threat Signature Verified & Scored</div>
                  <div className="text-[10px] text-slate-400 font-mono">Risk Score: {emailData.risk_score}/100</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ACTION CHECKLIST */}
          {activeTab === "actions" && (
            <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-extrabold uppercase font-mono text-cyan-400">
                Automated Incident Mitigation Actions
              </h3>
              <div className="space-y-2.5">
                {[
                  { id: "act-1", title: "Perimeter IOC Firewall Block", desc: `Block originating domain '${emailData.from_addr.split('@')[1]}' on mail firewall.`, priority: "HIGH" },
                  { id: "act-2", title: "Mailbox Recipient Sweep", desc: `Query enterprise mailboxes for subject '${emailData.subject?.substring(0, 30)}...'.`, priority: "HIGH" },
                  { id: "act-3", title: "Credential Invalidation", desc: `Revoke active sessions for target recipient ${emailData.to_addr}.`, priority: "MEDIUM" },
                  { id: "act-4", title: "Evidence Cryptographic Lock", desc: `Preserve immutable raw EML SHA-256 (${emailData.sha256.substring(0, 16)}...).`, priority: "LOW" }
                ].map((act) => (
                  <div key={act.id} className="p-3 bg-[#080d1a] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{act.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{act.desc}</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/40">
                      {act.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: EVIDENCE REGISTRY */}
          {activeTab === "evidence" && (
            <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase font-mono text-cyan-400">
                  Cryptographic Chain of Custody & Evidence Registry
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  Write-Once Immutable Storage
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-[#080d1a] p-3.5 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">Raw RFC 5322 EML File</span>
                    <span className="text-emerald-400 font-mono text-[10px] font-bold">LOCKED / PRESERVED</span>
                  </div>
                  <div className="font-mono text-[11px] text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800 break-all">
                    SHA-256: {emailData.sha256}
                  </div>
                </div>

                {emailData.attachments?.map((att: any) => (
                  <div key={att.sha256} className="bg-[#080d1a] p-3.5 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">Attachment: {att.filename}</span>
                      <span className="text-emerald-400 font-mono text-[10px] font-bold">PRESERVED</span>
                    </div>
                    <div className="font-mono text-[11px] text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800 break-all">
                      SHA-256: {att.sha256}
                    </div>
                  </div>
                ))}
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
    <Suspense fallback={<div className="p-8 text-cyan-400 font-mono text-xs">Loading Forensic Workspace...</div>}>
      <AnalyzeEmailContent />
    </Suspense>
  );
}
