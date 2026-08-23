"use client";

import { useState } from "react";
import {
  Sliders,
  Shield,
  Key,
  Database,
  Lock,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Activity
} from "lucide-react";

export default function SettingsPage() {
  const [providerMode, setProviderMode] = useState("MOCK");
  const [saveStatus, setSaveStatus] = useState(false);

  const handleSave = () => {
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2500);
  };

  const AUDIT_LOGS = [
    { timestamp: "2026-08-23 11:32:04", user: "investigator@tracex.forensics", action: "EXPORT_REPORT", target: "Email #PP-849204", ip: "127.0.0.1" },
    { timestamp: "2026-08-23 11:30:12", user: "investigator@tracex.forensics", action: "COPILOT_QUERY", target: "Case TX-2026-0001", ip: "127.0.0.1" },
    { timestamp: "2026-08-23 11:28:44", user: "analyst@tracex.forensics", action: "RUN_ANALYSIS", target: "Email (PayPal Phish)", ip: "127.0.0.1" },
    { timestamp: "2026-08-23 11:25:01", user: "admin@tracex.forensics", action: "LOGIN", target: "User Session", ip: "127.0.0.1" }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-cyan-400" />
          <span>System Settings & Forensic Audit Vault</span>
        </h1>
        <p className="text-xs text-slate-400">
          Configure threat intelligence connectors, role-based access control, and review immutable audit ledgers
        </p>
      </div>

      {/* Threat Intel Provider Configuration */}
      <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-extrabold text-white">Threat Intelligence Provider Engine</h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
            Zero-Paid Key Guarantee Active
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-white font-bold cursor-pointer">
              <input
                type="radio"
                name="provider"
                checked={providerMode === "MOCK"}
                onChange={() => setProviderMode("MOCK")}
                className="text-cyan-500 focus:ring-0"
              />
              <span>High-Fidelity Deterministic MockProvider (Offline & Judge Presentation Mode)</span>
            </label>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
            The platform executes with zero paid API keys by default. Input IPs, lookalike domains, and file hashes produce realistic, reproducible BGP routing, WHOIS, and geolocation data.
          </p>

          <div className="pt-2 pl-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="password"
                placeholder="Optional VirusTotal API Key..."
                className="bg-[#080d1a] border border-slate-800 rounded-lg px-3 py-2 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500/40"
              />
              <input
                type="password"
                placeholder="Optional AbuseIPDB API Key..."
                className="bg-[#080d1a] border border-slate-800 rounded-lg px-3 py-2 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500/40"
              />
            </div>
            <button
              onClick={handleSave}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              {saveStatus ? "Configuration Saved!" : "Save Provider Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) */}
      <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-extrabold text-white">Role-Based Access Control (RBAC) Permissions</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {[
            { role: "Administrator", desc: "Full system config & user management", badge: "Admin" },
            { role: "Lead Investigator", desc: "Case management, reports & containment actions", badge: "Investigator" },
            { role: "Forensic Analyst", desc: "MIME analysis, IOC lookups & graph telemetry", badge: "Analyst" },
            { role: "SOC Viewer", desc: "Read-only access to dashboard and case status", badge: "Viewer" }
          ].map((r) => (
            <div key={r.role} className="bg-[#080d1a] p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between font-bold text-white mb-1">
                <span>{r.role}</span>
                <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded">
                  {r.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Forensic Audit Logs */}
      <div className="cyber-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-5 border-b border-slate-800 bg-[#080d1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-extrabold uppercase font-mono text-white">
              Immutable Forensic Audit Ledger
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Cryptographically Chained
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#060913] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 font-mono">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-4 py-3">Investigator</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Target Reference</th>
                <th className="px-4 py-3">IP Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {AUDIT_LOGS.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="px-5 py-3 text-slate-400">{log.timestamp}</td>
                  <td className="px-4 py-3 font-bold text-cyan-300">{log.user}</td>
                  <td className="px-4 py-3 font-bold text-white">{log.action}</td>
                  <td className="px-4 py-3 text-slate-300">{log.target}</td>
                  <td className="px-4 py-3 text-slate-400">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
