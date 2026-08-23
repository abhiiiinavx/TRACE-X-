"use client";

import { useState } from "react";
import { Sliders, Shield, Key, Terminal } from "lucide-react";

export default function SettingsPage() {
  const [providerMode, setProviderMode] = useState("MOCK");
  const [saveStatus, setSaveStatus] = useState(false);

  const handleSave = () => {
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const AUDIT_LOGS = [
    { timestamp: "2026-08-23 11:32:04", user: "analyst@tracex.forensics", action: "EXPORT_REPORT", target: "Email #PP-849204", ip: "127.0.0.1" },
    { timestamp: "2026-08-23 11:30:12", user: "analyst@tracex.forensics", action: "COPILOT_QUERY", target: "Case TX-2026-0001", ip: "127.0.0.1" },
    { timestamp: "2026-08-23 11:28:44", user: "analyst@tracex.forensics", action: "RUN_ANALYSIS", target: "Email (PayPal Phish)", ip: "127.0.0.1" },
    { timestamp: "2026-08-23 11:25:01", user: "admin@tracex.forensics", action: "LOGIN", target: "Session", ip: "127.0.0.1" }
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="border-b border-[#1F2933] pb-4">
        <h1 className="text-xl font-semibold text-[#E6EBF0] tracking-tight">
          System Settings & Forensic Audit
        </h1>
        <p className="text-xs text-[#7C8896] mt-0.5">
          Configure threat intelligence connectors, role permissions, and review the immutable audit ledger.
        </p>
      </div>

      {/* Threat Intel Provider */}
      <div className="soc-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#1F2933] pb-2.5">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#2DD4BF]" strokeWidth={1.5} />
            <h2 className="text-xs font-semibold text-[#E6EBF0]">Threat Intelligence Connector</h2>
          </div>
          <span className="text-[10px] font-mono text-[#34C795]">
            Zero-Paid Key Mode
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <label className="flex items-center gap-2 text-[#E6EBF0] font-medium cursor-pointer">
            <input
              type="radio"
              name="provider"
              checked={providerMode === "MOCK"}
              onChange={() => setProviderMode("MOCK")}
              className="text-[#2DD4BF] focus:ring-0"
            />
            <span>High-Fidelity Deterministic MockProvider (Offline Presentation Mode)</span>
          </label>

          <p className="text-[11px] text-[#7C8896] pl-5 leading-relaxed">
            The platform operates with zero external API keys. BGP ASNs, WHOIS, and geolocation data are deterministically evaluated locally.
          </p>

          <div className="pt-2 pl-5 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              <input
                type="password"
                placeholder="Optional VirusTotal API Key..."
                className="bg-[#0B0F14] border border-[#1F2933] rounded px-3 py-1.5 text-[#E6EBF0] text-xs focus:outline-none focus:border-[#2DD4BF]"
              />
              <input
                type="password"
                placeholder="Optional AbuseIPDB API Key..."
                className="bg-[#0B0F14] border border-[#1F2933] rounded px-3 py-1.5 text-[#E6EBF0] text-xs focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>
            <button
              onClick={handleSave}
              className="bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0B0F14] px-3.5 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              {saveStatus ? "Saved" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* RBAC Permissions */}
      <div className="soc-card p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-[#1F2933] pb-2.5">
          <Shield className="w-4 h-4 text-[#2DD4BF]" strokeWidth={1.5} />
          <h2 className="text-xs font-semibold text-[#E6EBF0]">Role-Based Access Control</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          {[
            { role: "Administrator", desc: "Full config & user management", badge: "Admin" },
            { role: "Lead Investigator", desc: "Case workflows & containment", badge: "Investigator" },
            { role: "Forensic Analyst", desc: "MIME analysis & graph telemetry", badge: "Analyst" },
            { role: "SOC Viewer", desc: "Read-only access", badge: "Viewer" }
          ].map((r) => (
            <div key={r.role} className="soc-card-nested p-2.5">
              <div className="flex items-center justify-between font-medium text-[#E6EBF0] mb-1">
                <span>{r.role}</span>
                <span className="text-[9px] font-mono bg-[#0B0F14] text-[#7C8896] px-1.5 py-0.2 rounded">
                  {r.badge}
                </span>
              </div>
              <p className="text-[10px] text-[#7C8896]">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="soc-card overflow-hidden">
        <div className="p-3 border-b border-[#1F2933] bg-[#0B0F14] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#2DD4BF]" strokeWidth={1.5} />
            <span className="soc-label text-[#E6EBF0]">Audit Ledger</span>
          </div>
          <span className="text-[10px] text-[#7C8896] font-mono">Chained Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#7C8896]">
            <thead className="bg-[#0B0F14] uppercase text-[10px] font-semibold border-b border-[#1F2933] font-mono">
              <tr>
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">IP Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2933] font-mono text-[11px]">
              {AUDIT_LOGS.map((log, idx) => (
                <tr key={idx} className="hover:bg-[#161D26]/50">
                  <td className="px-3 py-2 text-[#7C8896]">{log.timestamp}</td>
                  <td className="px-3 py-2 text-[#2DD4BF]">{log.user}</td>
                  <td className="px-3 py-2 text-[#E6EBF0]">{log.action}</td>
                  <td className="px-3 py-2 text-[#7C8896]">{log.target}</td>
                  <td className="px-3 py-2 text-[#7C8896]">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
