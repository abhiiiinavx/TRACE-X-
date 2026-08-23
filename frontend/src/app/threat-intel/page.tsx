"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Compass, Search, Globe, Server, ShieldAlert, ArrowRight } from "lucide-react";
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
      setError(err.message || "Failed to query threat intelligence database");
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
          Threat Intelligence Lookup
        </h1>
        <p className="text-xs md:text-sm text-[#64748B] mt-1">
          Query IP addresses, lookalike domains, URLs, file hashes, and ASNs across our global threat repository
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="clean-card p-3 flex gap-2.5 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Enter IP (e.g. 194.36.189.44), Domain, URL, or SHA-256 hash..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] font-mono placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? "Searching..." : "Search"}</span>
        </button>
      </form>

      {/* Suggested Quick Searches */}
      <div className="flex items-center gap-2 text-xs text-[#64748B] flex-wrap">
        <span className="font-semibold">Suggested IOCs:</span>
        {["194.36.189.44", "185.220.101.5", "paypa1-security.com", "auth-microsoft365-verify.com", "AS48282"].map((ioc) => (
          <button
            key={ioc}
            onClick={() => {
              setQuery(ioc);
              performSearch(ioc);
            }}
            className="text-xs font-mono bg-white hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#334155] px-3 py-1 rounded-lg border border-[#E2E8F0] cursor-pointer transition-colors shadow-2xs"
          >
            {ioc}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-xs text-[#DC2626] font-medium">
          {error}
        </div>
      )}

      {/* Results View */}
      {results && (
        <div className="clean-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
            <div>
              <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
                {results.type} Telemetry Report
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] font-mono mt-0.5">
                {results.query}
              </h2>
            </div>
            {results.intel?.risk_score !== undefined && (
              <div className="text-right">
                <div className="text-xs text-[#64748B]">Risk Score</div>
                <div className="text-2xl font-extrabold text-[#EF4444] font-mono">
                  {results.intel.risk_score}/100
                </div>
              </div>
            )}
          </div>

          {/* Render based on Type */}
          {results.type === "IP" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="clean-card-nested p-4">
                <div className="text-xs text-[#64748B] font-semibold">Location</div>
                <div className="font-bold text-sm text-[#0F172A] mt-1">
                  {results.intel.city ? `${results.intel.city}, ` : ""}{results.intel.country}
                </div>
                <div className="text-xs text-[#64748B] font-mono mt-1">
                  Lat: {results.intel.lat} • Lng: {results.intel.lng}
                </div>
              </div>

              <div className="clean-card-nested p-4">
                <div className="text-xs text-[#64748B] font-semibold">Autonomous System (ASN)</div>
                <div className="font-mono text-sm text-[#4F46E5] font-bold mt-1">
                  {results.intel.asn}
                </div>
                <div className="text-xs text-[#64748B] mt-1 truncate">{results.intel.asn_org}</div>
              </div>

              <div className="clean-card-nested p-4">
                <div className="text-xs text-[#64748B] font-semibold">Classification</div>
                <div className="font-bold text-sm text-[#0F172A] mt-1">
                  {results.intel.node_type}
                </div>
                <div className="text-xs text-[#64748B] mt-1">
                  Attribution: {results.intel.attribution_confidence}%
                </div>
              </div>
            </div>
          )}

          {results.type === "DOMAIN" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="clean-card-nested p-4">
                  <div className="text-xs text-[#64748B] font-semibold">Registrar</div>
                  <div className="font-bold text-sm text-[#0F172A] mt-1">{results.intel.registrar}</div>
                  <div className="text-xs text-[#64748B] font-mono mt-1">Age: {results.intel.age_days}d</div>
                </div>

                <div className="clean-card-nested p-4">
                  <div className="text-xs text-[#64748B] font-semibold">Brand Impersonation</div>
                  <div className="font-bold text-sm text-[#EF4444] mt-1">
                    {results.intel.is_lookalike ? `TARGETS ${results.intel.impersonated_brand}` : "AUTHENTIC"}
                  </div>
                  <div className="text-xs text-[#64748B] mt-1">{results.intel.lookalike_technique || "None"}</div>
                </div>

                <div className="clean-card-nested p-4">
                  <div className="text-xs text-[#64748B] font-semibold">Resolved IP</div>
                  <div className="font-mono text-sm text-[#4F46E5] font-bold mt-1">
                    {results.intel.a_records?.[0] || "194.36.189.44"}
                  </div>
                </div>
              </div>

              {results.intel.reason_summary && (
                <div className="clean-card-nested p-4 text-xs text-[#334155] leading-relaxed">
                  {results.intel.reason_summary}
                </div>
              )}
            </div>
          )}

          {results.type === "URL" && (
            <div className="clean-card-nested p-4 font-mono text-xs">
              <div className="text-xs text-[#64748B] mb-1">Destination URL:</div>
              <div className="text-[#4F46E5] font-bold break-all">{results.intel.final_url}</div>
            </div>
          )}

          {results.type === "HASH" && (
            <div className="clean-card-nested p-4 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[#0F172A]">{results.intel.threat_name}</span>
                <div className="text-xs text-[#64748B] font-mono mt-1">AV Engine Detection: {results.intel.detection_ratio}</div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FEF2F2] text-[#EF4444]">
                {results.intel.reputation}
              </span>
            </div>
          )}

          {/* Direct Action Links */}
          <div className="pt-4 border-t border-[#F1F5F9] flex items-center gap-3 flex-wrap">
            <button
              onClick={() => window.location.href = "/analyze"}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Scan in Analyze Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.location.href = "/attack-graph"}
              className="bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Explore in Attack Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.location.href = "/campaigns"}
              className="bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Campaign DNA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ThreatIntelPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[#64748B] font-medium text-sm">Loading Threat Intelligence...</div>}>
      <ThreatIntelContent />
    </Suspense>
  );
}
