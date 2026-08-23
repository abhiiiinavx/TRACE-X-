"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Radar, Search } from "lucide-react";
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
    <div className="space-y-5 max-w-5xl">
      <div className="border-b border-[#1F2933] pb-4">
        <h1 className="text-xl font-semibold text-[#E6EBF0] tracking-tight">
          Universal Threat Intelligence Search
        </h1>
        <p className="text-xs text-[#7C8896] mt-0.5">
          Query IP addresses, lookalike domains, URLs, file hashes, and ASNs across our threat intelligence repository.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="soc-card p-3 flex gap-2">
        <input
          type="text"
          placeholder="Enter IP (e.g. 194.36.189.44), Domain, URL, or SHA-256 hash..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-[#0B0F14] border border-[#1F2933] rounded-md px-3 py-2 text-xs text-[#E6EBF0] font-mono placeholder-[#7C8896] focus:outline-none focus:border-[#2DD4BF]"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0B0F14] font-semibold px-4 py-2 rounded-md text-xs flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{loading ? "Searching..." : "Search"}</span>
        </button>
      </form>

      {/* Suggested Quick Searches */}
      <div className="flex items-center gap-2 text-xs text-[#7C8896] flex-wrap">
        <span>Suggested IOCs:</span>
        {["194.36.189.44", "185.220.101.5", "paypa1-security.com", "auth-microsoft365-verify.com", "AS48282"].map((ioc) => (
          <button
            key={ioc}
            onClick={() => {
              setQuery(ioc);
              performSearch(ioc);
            }}
            className="text-[11px] font-mono bg-[#161D26] hover:bg-[#1F2933] text-[#E6EBF0] px-2 py-0.5 rounded cursor-pointer transition-colors"
          >
            {ioc}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-md bg-[rgba(229,72,77,0.12)] border border-[rgba(229,72,77,0.25)] text-xs text-[#E5484D]">
          {error}
        </div>
      )}

      {/* Results View */}
      {results && (
        <div className="soc-card p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F2933] pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#2DD4BF]">
                {results.type} Telemetry Report
              </span>
              <h2 className="text-sm font-bold text-[#E6EBF0] font-mono mt-0.5">
                {results.query}
              </h2>
            </div>
            {results.intel?.risk_score !== undefined && (
              <div className="text-right">
                <div className="text-[10px] text-[#7C8896] font-mono">Risk Score</div>
                <div className="text-xl font-bold text-[#E5484D] font-mono">
                  {results.intel.risk_score}/100
                </div>
              </div>
            )}
          </div>

          {/* Render based on Type */}
          {results.type === "IP" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="soc-card-nested p-3">
                <div className="text-[10px] text-[#7C8896] font-mono">Location</div>
                <div className="font-semibold text-[#E6EBF0] mt-0.5">
                  {results.intel.city ? `${results.intel.city}, ` : ""}{results.intel.country}
                </div>
                <div className="text-[10px] text-[#7C8896] font-mono mt-0.5">
                  Lat: {results.intel.lat} • Lng: {results.intel.lng}
                </div>
              </div>

              <div className="soc-card-nested p-3">
                <div className="text-[10px] text-[#7C8896] font-mono">Autonomous System (ASN)</div>
                <div className="font-mono text-[#2DD4BF] font-semibold mt-0.5">
                  {results.intel.asn}
                </div>
                <div className="text-[10px] text-[#7C8896] mt-0.5 truncate">{results.intel.asn_org}</div>
              </div>

              <div className="soc-card-nested p-3">
                <div className="text-[10px] text-[#7C8896] font-mono">Classification</div>
                <div className="font-semibold text-[#E6EBF0] mt-0.5">
                  {results.intel.node_type}
                </div>
                <div className="text-[10px] text-[#7C8896] font-mono mt-0.5">
                  Attribution: {results.intel.attribution_confidence}%
                </div>
              </div>
            </div>
          )}

          {results.type === "DOMAIN" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="soc-card-nested p-3">
                  <div className="text-[10px] text-[#7C8896] font-mono">Registrar</div>
                  <div className="font-semibold text-[#E6EBF0] mt-0.5">{results.intel.registrar}</div>
                  <div className="text-[10px] text-[#7C8896] font-mono mt-0.5">Age: {results.intel.age_days}d</div>
                </div>

                <div className="soc-card-nested p-3">
                  <div className="text-[10px] text-[#7C8896] font-mono">Brand Impersonation</div>
                  <div className="font-semibold text-[#E5484D] mt-0.5">
                    {results.intel.is_lookalike ? `TARGETS ${results.intel.impersonated_brand}` : "AUTHENTIC"}
                  </div>
                  <div className="text-[10px] text-[#7C8896] mt-0.5">{results.intel.lookalike_technique || "None"}</div>
                </div>

                <div className="soc-card-nested p-3">
                  <div className="text-[10px] text-[#7C8896] font-mono">Resolved IP</div>
                  <div className="font-mono text-[#2DD4BF] font-semibold mt-0.5">
                    {results.intel.a_records?.[0] || "194.36.189.44"}
                  </div>
                </div>
              </div>

              {results.intel.reason_summary && (
                <div className="soc-card-nested p-3 text-xs text-[#7C8896]">
                  {results.intel.reason_summary}
                </div>
              )}
            </div>
          )}

          {results.type === "URL" && (
            <div className="space-y-2.5 text-xs">
              <div className="soc-card-nested p-3 font-mono">
                <div className="text-[10px] text-[#7C8896]">Destination:</div>
                <div className="text-[#2DD4BF] font-semibold break-all mt-0.5">{results.intel.final_url}</div>
              </div>
            </div>
          )}

          {results.type === "HASH" && (
            <div className="soc-card-nested p-3 text-xs flex items-center justify-between">
              <div>
                <span className="font-mono font-semibold text-[#E6EBF0]">{results.intel.threat_name}</span>
                <div className="text-[10px] text-[#7C8896] font-mono mt-0.5">AV Engine Detection: {results.intel.detection_ratio}</div>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[rgba(229,72,77,0.12)] text-[#E5484D]">
                {results.intel.reputation}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ThreatIntelPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[#7C8896] font-mono text-xs">Loading Threat Intelligence...</div>}>
      <ThreatIntelContent />
    </Suspense>
  );
}
