"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Radar,
  Search,
  Globe,
  Server,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Info,
  Clock
} from "lucide-react";
import { searchThreatIntel } from "@/lib/api";

function ThreatIntelContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchThreatIntel(q.trim());
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to query intelligence database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Radar className="w-6 h-6 text-cyan-400" />
          <span>Universal Threat Intelligence Search</span>
        </h1>
        <p className="text-xs text-slate-400">
          Query IP addresses, lookalike domains, URLs, file hashes, and ASNs across our threat intelligence repository
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="cyber-card p-4 rounded-2xl border border-slate-800 flex gap-2">
        <input
          type="text"
          placeholder="Enter IP (e.g. 194.36.189.44), Domain (paypa1-security.com), URL, or SHA-256 hash..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-[#080d1a] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? "Querying..." : "Search IOC"}</span>
        </button>
      </form>

      {/* Suggested Quick Searches */}
      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
        <span>Suggested IOCs:</span>
        {["194.36.189.44", "185.220.101.5", "paypa1-security.com", "auth-microsoft365-verify.com", "AS48282"].map((ioc) => (
          <button
            key={ioc}
            onClick={() => {
              setQuery(ioc);
              performSearch(ioc);
            }}
            className="text-[11px] font-mono bg-[#0c1222] border border-slate-800 hover:border-cyan-500/40 text-cyan-300 px-2 py-1 rounded cursor-pointer transition-all"
          >
            {ioc}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Results View */}
      {results && (
        <div className="cyber-card p-6 rounded-2xl border border-cyan-500/30 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                {results.type} Telemetry Report
              </span>
              <h2 className="text-lg font-black text-white font-mono mt-1">
                {results.query}
              </h2>
            </div>
            {results.intel?.risk_score !== undefined && (
              <div className="text-right">
                <div className="text-xs text-slate-400 font-mono">Risk Score</div>
                <div className="text-2xl font-black text-red-400 font-mono">
                  {results.intel.risk_score}/100
                </div>
              </div>
            )}
          </div>

          {/* Render based on Type */}
          {results.type === "IP" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#080d1a] p-4 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Location</div>
                <div className="font-bold text-white mt-1">
                  {results.intel.city ? `${results.intel.city}, ` : ""}{results.intel.country} ({results.intel.country_code})
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Lat: {results.intel.lat} • Lng: {results.intel.lng}
                </div>
              </div>

              <div className="bg-[#080d1a] p-4 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Autonomous System (ASN)</div>
                <div className="font-bold text-cyan-300 font-mono mt-1">
                  {results.intel.asn}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{results.intel.asn_org}</div>
              </div>

              <div className="bg-[#080d1a] p-4 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Node Classification</div>
                <div className="font-bold text-white mt-1">
                  {results.intel.node_type}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                  Attribution Confidence: {results.intel.attribution_confidence}%
                </div>
              </div>
            </div>
          )}

          {results.type === "DOMAIN" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#080d1a] p-4 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Registrar</div>
                  <div className="font-bold text-white mt-1">{results.intel.registrar}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Age: {results.intel.age_days} days</div>
                </div>

                <div className="bg-[#080d1a] p-4 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Brand Impersonation Status</div>
                  <div className="font-bold text-red-400 mt-1">
                    {results.intel.is_lookalike ? `IMPERSONATES ${results.intel.impersonated_brand}` : "AUTHENTIC"}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{results.intel.lookalike_technique || "N/A"}</div>
                </div>

                <div className="bg-[#080d1a] p-4 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Resolved IP (A Record)</div>
                  <div className="font-mono text-cyan-300 font-bold mt-1">
                    {results.intel.a_records?.[0] || "194.36.189.44"}
                  </div>
                </div>
              </div>

              {results.intel.reason_summary && (
                <div className="bg-[#080d1a] p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <strong className="text-cyan-400 font-mono block mb-1">Forensic Evaluation:</strong>
                  {results.intel.reason_summary}
                </div>
              )}
            </div>
          )}

          {results.type === "URL" && (
            <div className="space-y-3 text-xs">
              <div className="bg-[#080d1a] p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block mb-1">Destination URL:</span>
                <div className="font-mono text-cyan-300 font-bold break-all">{results.intel.final_url}</div>
              </div>
              <div className="bg-[#080d1a] p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block mb-1">Suspicious Factors:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {results.intel.suspicious_reasons?.map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {results.type === "HASH" && (
            <div className="bg-[#080d1a] p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-mono">{results.intel.threat_name}</span>
                <span className="text-[10px] font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-500/30">
                  {results.intel.reputation}
                </span>
              </div>
              {results.intel.detection_ratio && (
                <div className="text-[11px] text-slate-400 font-mono">
                  AV Engine Score: {results.intel.detection_ratio}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ThreatIntelPage() {
  return (
    <Suspense fallback={<div className="p-8 text-cyan-400 font-mono text-xs">Loading Threat Intelligence...</div>}>
      <ThreatIntelContent />
    </Suspense>
  );
}
