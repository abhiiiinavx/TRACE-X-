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
  Server,
  ArrowRight
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
  Cell
} from "recharts";
import { getDashboardStats, listEmails } from "@/lib/api";
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

  const DONUT_COLORS = ["#E5484D", "#F0883E", "#A78BFA", "#E8C547", "#34C795"];

  return (
    <div className="space-y-6">
      {/* Slim Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F2933] pb-4">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EBF0] tracking-tight">
            Security Operations Dashboard
          </h1>
          <p className="text-xs text-[#7C8896] mt-0.5">
            Continuous email threat ingestion, hop relay telemetry, and active campaign tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#7C8896]">
          <span className="w-2 h-2 rounded-full bg-[#34C795] animate-pulse"></span>
          <span>Live Ingestion Active</span>
        </div>
      </div>

      {/* Pipeline Breadcrumb Strip */}
      <PipelineRibbon activeStage="detect" />

      {/* KPI Cards Grid (Number-forward, clean visual role) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Analyzed */}
        <div className="soc-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="soc-label">Analyzed</span>
            <div className="w-7 h-7 rounded bg-[#161D26] flex items-center justify-center text-[#2DD4BF]">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-bold text-[#E6EBF0]">
              {stats?.total_analyzed || 45}
            </div>
            <div className="text-[10px] text-[#7C8896] mt-0.5">Telemetry items</div>
          </div>
        </div>

        {/* Card 2: Threats Detected */}
        <div className="soc-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="soc-label text-[#E5484D]">Threats</span>
            <div className="w-7 h-7 rounded bg-[rgba(229,72,77,0.12)] flex items-center justify-center text-[#E5484D]">
              <Flame className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-bold text-[#E5484D]">
              {stats?.threats_detected || 31}
            </div>
            <div className="text-[10px] text-[#7C8896] mt-0.5">Confirmed malicious</div>
          </div>
        </div>

        {/* Card 3: Critical Phish */}
        <div className="soc-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="soc-label text-[#F0883E]">Critical</span>
            <div className="w-7 h-7 rounded bg-[rgba(240,136,62,0.12)] flex items-center justify-center text-[#F0883E]">
              <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-bold text-[#F0883E]">
              {stats?.critical_threats || 14}
            </div>
            <div className="text-[10px] text-[#7C8896] mt-0.5">DMARC / Typosquats</div>
          </div>
        </div>

        {/* Card 4: BEC / Wire Fraud */}
        <div className="soc-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="soc-label text-[#E8C547]">BEC Fraud</span>
            <div className="w-7 h-7 rounded bg-[rgba(232,197,71,0.12)] flex items-center justify-center text-[#E8C547]">
              <ShieldAlert className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-bold text-[#E6EBF0]">
              {stats?.bec_attempts || 8}
            </div>
            <div className="text-[10px] text-[#7C8896] mt-0.5">Exec impersonations</div>
          </div>
        </div>

        {/* Card 5: Active Campaigns */}
        <div className="soc-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="soc-label text-[#A78BFA]">Campaigns</span>
            <div className="w-7 h-7 rounded bg-[rgba(167,139,250,0.12)] flex items-center justify-center text-[#A78BFA]">
              <Dna className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-bold text-[#E6EBF0]">
              {stats?.active_campaigns || 3}
            </div>
            <div className="text-[10px] text-[#7C8896] mt-0.5">Correlated clusters</div>
          </div>
        </div>

        {/* Card 6: Malicious Infrastructure */}
        <div className="soc-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="soc-label">High-Risk IPs</span>
            <div className="w-7 h-7 rounded bg-[#161D26] flex items-center justify-center text-[#2DD4BF]">
              <Server className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-bold text-[#E6EBF0]">
              {stats?.high_risk_infrastructure || 9}
            </div>
            <div className="text-[10px] text-[#7C8896] mt-0.5">ASNs & Tor relays</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threats Over Time Chart */}
        <div className="soc-card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34C795] animate-pulse"></span>
              <h2 className="text-xs font-semibold text-[#E6EBF0]">
                Threat Ingestion Volume
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-[#7C8896]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-[#E5484D]"></span> Threats
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-[#34C795]"></span> Clean
              </span>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.threats_over_time || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E5484D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E5484D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClean" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C795" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34C795" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#1F2933" />
                <XAxis dataKey="timestamp" stroke="#7C8896" fontSize={10} tickLine={false} />
                <YAxis stroke="#7C8896" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#10161D",
                    borderColor: "#1F2933",
                    borderRadius: 6,
                    fontSize: 11,
                    color: "#E6EBF0"
                  }}
                />
                <Area type="monotone" dataKey="threats" stroke="#E5484D" strokeWidth={1.5} fillOpacity={1} fill="url(#colorThreats)" name="Threats" />
                <Area type="monotone" dataKey="clean" stroke="#34C795" strokeWidth={1.5} fillOpacity={1} fill="url(#colorClean)" name="Clean" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Category Breakdown Donut */}
        <div className="soc-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-[#E6EBF0]">
              Threat Typology
            </h2>
            <span className="text-[10px] text-[#7C8896] font-mono">MITRE Tagged</span>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.category_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(stats?.category_distribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#10161D",
                    borderColor: "#1F2933",
                    borderRadius: 6,
                    fontSize: 11,
                    color: "#E6EBF0"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2 text-[11px]">
            {(stats?.category_distribution || []).map((c: any, idx: number) => (
              <div key={c.name} className="flex items-center justify-between text-[#7C8896]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}></span>
                  <span className="truncate">{c.name}</span>
                </div>
                <span className="font-mono font-medium text-[#E6EBF0]">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incidents Table (Clean borderless with hairline row dividers) */}
      <div className="soc-card overflow-hidden">
        <div className="p-4 border-b border-[#1F2933] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold text-[#E6EBF0]">
              Recent Incident Telemetry
            </h2>
            <p className="text-[11px] text-[#7C8896] mt-0.5">
              Select any incident to inspect full hop relay trace, attack graph, and evidence.
            </p>
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#0B0F14] p-1 rounded border border-[#1F2933] text-[11px] font-mono">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "CLEAN"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  severityFilter === sev
                    ? "bg-[#161D26] text-[#2DD4BF] font-semibold"
                    : "text-[#7C8896] hover:text-[#E6EBF0]"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#7C8896]">
            <thead className="bg-[#0B0F14] text-[#7C8896] uppercase text-[10px] font-semibold border-b border-[#1F2933] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Subject / Case</th>
                <th className="px-4 py-2.5">Sender</th>
                <th className="px-4 py-2.5">Classification</th>
                <th className="px-4 py-2.5">Score</th>
                <th className="px-4 py-2.5">Severity</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2933]">
              {emails.map((e) => {
                const isCrit = e.severity === "CRITICAL";
                const isHigh = e.severity === "HIGH";
                const isMed = e.severity === "MEDIUM";

                return (
                  <tr
                    key={e.id}
                    onClick={() => router.push(`/analyze?id=${e.id}`)}
                    className="hover:bg-[#161D26]/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#E6EBF0] group-hover:text-[#2DD4BF] transition-colors line-clamp-1">
                        {e.subject || "No Subject"}
                      </div>
                      <div className="text-[10px] text-[#7C8896] font-mono mt-0.5">
                        {e.sha256 ? `${e.sha256.substring(0, 16)}...` : "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#E6EBF0]">
                      <div className="truncate max-w-[200px]">{e.from_addr}</div>
                      {e.from_display_name && (
                        <div className="text-[10px] text-[#7C8896] truncate max-w-[200px]">
                          {e.from_display_name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#E6EBF0]">
                      {e.classification}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      <span
                        className={
                          isCrit
                            ? "text-[#E5484D]"
                            : isHigh
                            ? "text-[#F0883E]"
                            : isMed
                            ? "text-[#E8C547]"
                            : "text-[#34C795]"
                        }
                      >
                        {e.risk_score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                          isCrit
                            ? "bg-[rgba(229,72,77,0.12)] text-[#E5484D] border border-[rgba(229,72,77,0.25)]"
                            : isHigh
                            ? "bg-[rgba(240,136,62,0.12)] text-[#F0883E] border border-[rgba(240,136,62,0.25)]"
                            : isMed
                            ? "bg-[rgba(232,197,71,0.12)] text-[#E8C547] border border-[rgba(232,197,71,0.25)]"
                            : "bg-[rgba(52,199,149,0.12)] text-[#34C795] border border-[rgba(52,199,149,0.25)]"
                        }`}
                      >
                        {e.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className="text-[#2DD4BF] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1 text-[11px]">
                        Inspect <ArrowRight className="w-3 h-3" />
                      </span>
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
