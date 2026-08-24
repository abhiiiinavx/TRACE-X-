"use client";

import { useEffect, useState } from "react";
import { Shield, Key, Terminal, RefreshCw } from "lucide-react";
import { getAuditLogs } from "@/lib/api";

export default function SettingsPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const logs = await getAuditLogs(50);
      setAuditLogs(logs);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
          Platform Settings & Audit Ledger
        </h1>
        <p className="text-xs md:text-sm text-[#64748B] mt-1">
          Review deterministic local threat intelligence configuration, RBAC permissions, and the live immutable audit ledger
        </p>
      </div>

      {/* Threat Intel Provider */}
      <div className="clean-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-sm font-bold text-[#0F172A]">Local Threat Intelligence — Offline Mode</h2>
          </div>
          <span className="text-xs font-bold text-[#16A34A] bg-[#F0FDF4] px-3 py-1 rounded-full border border-[#DCFCE7]">
            Local Intel Active (Deterministic)
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1.5">
            <div className="flex items-center justify-between font-bold text-[#0F172A]">
              <span>Active Provider: Deterministic MockThreatIntelProvider</span>
              <span className="text-[10px] text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full font-mono">
                ZERO EXTERNAL KEYS REQUIRED
              </span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              TRACE-X operates in fully reliable, deterministic offline mode for SIH 2026. BGP ASNs, domain lookalikes, IP geolocations, and signature correlations execute locally without external API latency or quota failures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="clean-card-nested p-3 space-y-1">
              <div className="text-[11px] font-bold text-[#64748B] uppercase">BGP Routing & ASN Lookup</div>
              <div className="font-semibold text-xs text-[#0F172A]">Local GeoLite2 & ASN Matrix (Offline)</div>
            </div>
            <div className="clean-card-nested p-3 space-y-1">
              <div className="text-[11px] font-bold text-[#64748B] uppercase">Typosquatting & Brand Detection</div>
              <div className="font-semibold text-xs text-[#0F172A]">Levenshtein & Jaro-Winkler Heuristic Engine</div>
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Permissions */}
      <div className="clean-card p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3">
          <Shield className="w-5 h-5 text-[#4F46E5]" />
          <h2 className="text-sm font-bold text-[#0F172A]">Role-Based Access Control (RBAC)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {[
            { role: "Administrator", desc: "Full configuration & team access", badge: "Admin" },
            { role: "Lead Investigator", desc: "Case management & actions", badge: "Lead" },
            { role: "Forensic Analyst", desc: "MIME analysis & graph matrix", badge: "Analyst" },
            { role: "Security Viewer", desc: "Read-only telemetry access", badge: "Viewer" }
          ].map((r) => (
            <div key={r.role} className="clean-card-nested p-3.5">
              <div className="flex items-center justify-between font-bold text-[#0F172A] mb-1">
                <span>{r.role}</span>
                <span className="text-[10px] bg-white border border-[#E2E8F0] text-[#4F46E5] px-2 py-0.5 rounded-full">
                  {r.badge}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="clean-card overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#4F46E5]" />
            <span className="text-xs font-bold text-[#0F172A]">Database Security Audit Ledger</span>
            <span className="text-[11px] text-[#64748B] font-medium">({auditLogs.length} Records)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAuditLogs}
              className="text-xs text-[#4F46E5] hover:bg-white p-1 rounded-lg border border-transparent hover:border-[#E2E8F0] flex items-center gap-1 cursor-pointer"
              title="Refresh Audit Logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <span className="text-[11px] text-[#16A34A] font-bold bg-[#F0FDF4] px-2.5 py-0.5 rounded-full border border-[#DCFCE7]">
              Immutable Database
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#64748B]">
            <thead className="bg-[#F8FAFC] uppercase text-[10px] font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="px-5 py-3">Timestamp (UTC)</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">IP Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-mono text-xs">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-[#64748B] font-sans">
                    {loadingLogs ? "Loading security audit records from database..." : "No audit events recorded yet."}
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 text-[#64748B] whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toISOString().replace("T", " ").substring(0, 19) : "Just now"}
                    </td>
                    <td className="px-5 py-3 text-[#4F46E5] font-bold whitespace-nowrap">{log.username || "System"}</td>
                    <td className="px-5 py-3 text-[#0F172A] font-semibold">
                      <span className="bg-[#F1F5F9] px-2 py-0.5 rounded-md text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">{log.target_type ? `${log.target_type} #${(log.target_id || "").substring(0, 8)}` : "System"}</td>
                    <td className="px-5 py-3 text-[#64748B]">{log.ip_addr || "127.0.0.1"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
