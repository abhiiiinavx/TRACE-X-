"use client";

import { useState } from "react";
import { Sliders, Shield, Key, Terminal, Check } from "lucide-react";

export default function SettingsPage() {
  const [providerMode, setProviderMode] = useState("MOCK");
  const [saveStatus, setSaveStatus] = useState(false);

  const handleSave = () => {
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const AUDIT_LOGS = [
    { timestamp: "2026-08-24 01:32:04", user: "analyst@tracex.forensics", action: "EXPORT_REPORT", target: "Email #PP-849204", ip: "127.0.0.1" },
    { timestamp: "2026-08-24 01:30:12", user: "analyst@tracex.forensics", action: "COPILOT_QUERY", target: "Case TX-2026-0001", ip: "127.0.0.1" },
    { timestamp: "2026-08-24 01:28:44", user: "analyst@tracex.forensics", action: "RUN_ANALYSIS", target: "Email (PayPal Phish)", ip: "127.0.0.1" },
    { timestamp: "2026-08-24 01:25:01", user: "admin@tracex.forensics", action: "LOGIN", target: "Session Auth", ip: "127.0.0.1" }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
          Platform Settings & Audit Ledger
        </h1>
        <p className="text-xs md:text-sm text-[#64748B] mt-1">
          Configure threat intelligence connectors, role permissions, and review the immutable audit ledger
        </p>
      </div>

      {/* Threat Intel Provider */}
      <div className="clean-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-sm font-bold text-[#0F172A]">Threat Intelligence Connectors</h2>
          </div>
          <span className="text-xs font-bold text-[#16A34A] bg-[#F0FDF4] px-3 py-1 rounded-full">
            Zero-Key Offline Presentation Mode
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-2.5 text-[#0F172A] font-semibold cursor-pointer">
            <input
              type="radio"
              name="provider"
              checked={providerMode === "MOCK"}
              onChange={() => setProviderMode("MOCK")}
              className="text-[#4F46E5] focus:ring-0"
            />
            <span>High-Fidelity Deterministic MockProvider (Offline Mode)</span>
          </label>

          <p className="text-xs text-[#64748B] pl-6 leading-relaxed">
            The platform operates with zero external paid API keys required. BGP ASNs, WHOIS, and IP geolocations are evaluated deterministically.
          </p>

          <div className="pt-2 pl-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <input
                type="password"
                placeholder="Optional VirusTotal API Key..."
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-[#0F172A] text-xs focus:outline-none focus:border-[#4F46E5] focus:bg-white"
              />
              <input
                type="password"
                placeholder="Optional AbuseIPDB API Key..."
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-[#0F172A] text-xs focus:outline-none focus:border-[#4F46E5] focus:bg-white"
              />
            </div>
            <button
              onClick={handleSave}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {saveStatus ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{saveStatus ? "Settings Saved" : "Save Settings"}</span>
            </button>
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
        <div className="p-4 border-b border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#4F46E5]" />
            <span className="text-xs font-bold text-[#0F172A]">Immutable Security Audit Ledger</span>
          </div>
          <span className="text-[11px] text-[#16A34A] font-bold bg-[#F0FDF4] px-2.5 py-0.5 rounded-full">
            Hash Chained
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#64748B]">
            <thead className="bg-[#F8FAFC] uppercase text-[10px] font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">IP Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-mono text-xs">
              {AUDIT_LOGS.map((log, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3 text-[#64748B]">{log.timestamp}</td>
                  <td className="px-5 py-3 text-[#4F46E5] font-bold">{log.user}</td>
                  <td className="px-5 py-3 text-[#0F172A] font-semibold">{log.action}</td>
                  <td className="px-5 py-3 text-[#64748B]">{log.target}</td>
                  <td className="px-5 py-3 text-[#64748B]">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
