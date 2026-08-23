"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Dna,
  Globe,
  Server,
  ArrowRight,
  TrendingUp,
  Filter,
  Eye,
  Sparkles,
  ExternalLink
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { getDashboardStats, listEmails, loadDemoInvestigation } from "@/lib/api";
import PipelineRibbon from "@/components/layout/PipelineRibbon";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, emailsData] = await Promise.all([
          getDashboardStats(),
          listEmails({ limit: 10, severity: severityFilter === "ALL" ? undefined : severityFilter })
        ]);
        setStats(statsData);
        setEmails(emailsData.items);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [severityFilter]);

  const handleDemoClick = async () => {
    try {
      const res = await loadDemoInvestigation();
      if (res.active_email_id) {
        router.push(`/analyze?id=${res.active_email_id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with SIH Problem Statement & Value Proposition */}
      <div className="cyber-card p-6 rounded-2xl relative overflow-hidden border border-cyan-500/30">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                SIH 2026 Problem Statement SIH26106
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Cyber Forensics Division</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
              TRACE<span className="text-cyan-400">-X</span> Forensic Intelligence Platform
            </h1>
            <p className="text-xs sm:text-sm text-cyan-200/80 mt-1 font-medium italic">
              "Most email security systems stop at detection. TRACE-X continues from detection to investigation."
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/analyze"
              className="flex items-center gap-2 bg-[#111a30] hover:bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              <span>Analyze Email</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleDemoClick}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-lg shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load Demo Investigation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Investigation Pipeline Ribbon */}
      <PipelineRibbon activeStage="detect" />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Analyzed</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats?.total_analyzed || 45}</div>
          <div className="text-[10px] text-cyan-400 font-semibold mt-1">100% Verified Telemetry</div>
        </div>

        <div className="cyber-card p-4 rounded-xl border-red-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-red-400">Threats Found</span>
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono">{stats?.threats_detected || 31}</div>
          <div className="text-[10px] text-red-400/80 font-semibold mt-1">Action Required</div>
        </div>

        <div className="cyber-card p-4 rounded-xl border-orange-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">Critical Phish</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400 font-mono">{stats?.critical_threats || 14}</div>
          <div className="text-[10px] text-orange-400/80 font-semibold mt-1">DMARC / Typosquat</div>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">BEC / Wire Infiltration</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats?.bec_attempts || 8}</div>
          <div className="text-[10px] text-amber-400 font-semibold mt-1">Executive Spoofing</div>
        </div>

        <div className="cyber-card p-4 rounded-xl border-purple-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Campaign Clusters</span>
            <Dna className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono">{stats?.active_campaigns || 3}</div>
          <div className="text-[10px] text-purple-400 font-semibold mt-1">Correlated Adversaries</div>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">High-Risk Infra</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats?.high_risk_infrastructure || 9}</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-1">ASNs & Tor Relays</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Threats Over Time Chart */}
        <div className="cyber-card p-5 rounded-2xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-white">Threat Activity Volume (Today)</h3>
              <p className="text-[11px] text-slate-400">Temporal ingestion of clean vs malicious email telemetry</p>
            </div>
            <span className="text-[10px] font-mono bg-cyan-950 px-2 py-0.5 rounded text-cyan-300 border border-cyan-500/30">
              Live Stream
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.threats_over_time || []}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClean" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0c1222", borderColor: "#334155", borderRadius: 8, fontSize: 11 }}
                />
                <Area type="monotone" dataKey="threats" stroke="#ef4444" fillOpacity={1} fill="url(#colorThreats)" name="Threats" />
                <Area type="monotone" dataKey="clean" stroke="#10b981" fillOpacity={1} fill="url(#colorClean)" name="Clean" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Category Distribution Donut */}
        <div className="cyber-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-extrabold text-white">Threat Typology Breakdown</h3>
            <span className="text-[10px] text-slate-400 font-mono">MITRE Tagged</span>
          </div>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.category_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(stats?.category_distribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0c1222", borderColor: "#334155", borderRadius: 8, fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px]">
            {(stats?.category_distribution || []).map((c: any) => (
              <div key={c.name} className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></span>
                <span className="truncate">{c.name}: <strong>{c.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Threat Incidents Table */}
      <div className="cyber-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>Recent Forensic Incident Telemetry</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                {emails.length} active
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Click any incident to inspect complete hop relay forensics and attack graph</p>
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#080d1a] p-1 rounded-lg border border-slate-800 text-[11px]">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "CLEAN"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                  severityFilter === sev
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#080d1a] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 font-mono tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Subject / Case</th>
                <th className="px-4 py-3.5">Sender Envelope</th>
                <th className="px-4 py-3.5">Classification</th>
                <th className="px-4 py-3.5">Risk Score</th>
                <th className="px-4 py-3.5">Severity</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {emails.map((e) => {
                const isCrit = e.severity === "CRITICAL";
                const isHigh = e.severity === "HIGH";
                const isMed = e.severity === "MEDIUM";

                return (
                  <tr
                    key={e.id}
                    onClick={() => router.push(`/analyze?id=${e.id}`)}
                    className="hover:bg-cyan-950/20 transition-all cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {e.subject || "No Subject"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        SHA-256: {e.sha256 ? `${e.sha256.substring(0, 16)}...` : "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">
                      <div>{e.from_addr}</div>
                      {e.from_display_name && (
                        <div className="text-[10px] text-slate-400">{e.from_display_name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-200">
                      {e.classification}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold">
                      <span
                        className={
                          isCrit
                            ? "text-red-400"
                            : isHigh
                            ? "text-orange-400"
                            : isMed
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }
                      >
                        {e.risk_score}/100
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          isCrit
                            ? "bg-red-950/60 border-red-500/40 text-red-300"
                            : isHigh
                            ? "bg-orange-950/60 border-orange-500/40 text-orange-300"
                            : isMed
                            ? "bg-amber-950/60 border-amber-500/40 text-amber-300"
                            : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                        }`}
                      >
                        {e.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button className="text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-bold text-[11px]">
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
