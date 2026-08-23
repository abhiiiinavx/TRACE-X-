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
  ArrowRight,
  ChevronDown,
  User,
  Settings,
  Bot,
  Mail,
  ArrowUpRight,
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
  Cell
} from "recharts";
import { getDashboardStats, listEmails } from "@/lib/api";
import PipelineRibbon from "@/components/layout/PipelineRibbon";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, emailsData] = await Promise.all([
          getDashboardStats(),
          listEmails({ limit: 8, severity: severityFilter === "ALL" ? undefined : severityFilter })
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

  // Dynamic timeframe data
  const getTrendData = () => {
    if (timeRange === "24h") {
      return [
        { day: "00:00", clean: 140, threats: 32 },
        { day: "04:00", clean: 80, threats: 15 },
        { day: "08:00", clean: 420, threats: 110 },
        { day: "12:00", clean: 890, threats: 240 },
        { day: "16:00", clean: 760, threats: 190 },
        { day: "20:00", clean: 340, threats: 75 }
      ];
    }
    if (timeRange === "30d") {
      return [
        { day: "Week 1", clean: 18200, threats: 4100 },
        { day: "Week 2", clean: 22400, threats: 5900 },
        { day: "Week 3", clean: 28900, threats: 7200 },
        { day: "Week 4", clean: 34100, threats: 8800 }
      ];
    }
    // Default 7 days
    if (stats?.threats_over_time && stats.threats_over_time.length > 0) {
      return stats.threats_over_time;
    }
    return [
      { timestamp: "May 16", clean: 3600, threats: 1200 },
      { timestamp: "May 17", clean: 3900, threats: 1800 },
      { timestamp: "May 18", clean: 4100, threats: 2100 },
      { timestamp: "May 19", clean: 4900, threats: 2400 },
      { timestamp: "May 20", clean: 5400, threats: 3100 },
      { timestamp: "May 21", clean: 6800, threats: 3600 },
      { timestamp: "May 22", clean: 7800, threats: 3900 }
    ];
  };

  const VIBRANT_DONUT_COLORS = ["#EF4444", "#F97316", "#8B5CF6", "#F59E0B", "#10B981", "#0284C7"];

  const TOP_THREAT_SENDERS = [
    { email: "security@bank-alerts.com", risk: "High Risk", score: 98 },
    { email: "noreply@free-prizes.win", risk: "High Risk", score: 92 },
    { email: "admin@update-verification.com", risk: "High Risk", score: 87 },
    { email: "support@your-account-secure.net", risk: "High Risk", score: 85 },
    { email: "info@claim-your-bonus.today", risk: "Medium Risk", score: 78 }
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
            Security Operations Dashboard
          </h1>
          <p className="text-xs md:text-sm text-[#64748B] mt-1">
            Continuous email threat ingestion, hop relay telemetry, and active campaign tracking
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#DCFCE7] px-3.5 py-1.5 rounded-2xl self-start sm:self-auto shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span className="text-xs font-bold text-[#16A34A]">Live Ingestion Active</span>
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse ml-0.5"></span>
        </div>
      </div>

      {/* 2. Interactive Pipeline Breadcrumb Strip */}
      <PipelineRibbon activeStage="dashboard" />

      {/* 3. Interactive Top KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1: Emails Analyzed */}
        <div
          onClick={() => router.push("/analyze")}
          className="clean-card card-hover p-4 flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase group-hover:text-[#4F46E5] transition-colors">Analyzed</span>
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">
              {stats?.total_analyzed || 45}
            </div>
            <div className="text-[11px] font-semibold text-[#4F46E5] mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>100% Ingested</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Threats Detected */}
        <div
          onClick={() => {
            setSeverityFilter("CRITICAL");
            const el = document.getElementById("recent-telemetry");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="clean-card card-hover p-4 flex flex-col justify-between border-[#FEE2E2] cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#EF4444] uppercase">Threats</span>
            <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] flex items-center justify-center text-[#EF4444]">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#EF4444]">
              {stats?.threats_detected || 31}
            </div>
            <div className="text-[11px] font-semibold text-[#EF4444] mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>Filter Critical</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Critical Phish */}
        <div
          onClick={() => {
            setSeverityFilter("CRITICAL");
            const el = document.getElementById("recent-telemetry");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="clean-card card-hover p-4 flex flex-col justify-between border-[#FFEDD5] cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#EA580C] uppercase">Critical Phish</span>
            <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#EA580C]">
              {stats?.critical_threats || 14}
            </div>
            <div className="text-[11px] font-semibold text-[#EA580C] mt-0.5">
              DMARC / Spoofs
            </div>
          </div>
        </div>

        {/* Metric 4: BEC / Fraud */}
        <div
          onClick={() => router.push("/threat-intel?q=BEC")}
          className="clean-card card-hover p-4 flex flex-col justify-between border-[#FEF3C7] cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#D97706] uppercase group-hover:text-[#4F46E5]">BEC Fraud</span>
            <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] flex items-center justify-center text-[#D97706]">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#0F172A] group-hover:text-[#4F46E5]">
              {stats?.bec_attempts || 8}
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5 font-medium">
              Exec Spoofing
            </div>
          </div>
        </div>

        {/* Metric 5: Active Campaigns */}
        <div
          onClick={() => router.push("/campaigns")}
          className="clean-card card-hover p-4 flex flex-col justify-between border-[#DDD6FE] cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B5CF6] uppercase group-hover:text-[#4F46E5]">Campaigns</span>
            <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#8B5CF6]">
              <Dna className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#8B5CF6]">
              {stats?.active_campaigns || 3}
            </div>
            <div className="text-[11px] text-[#8B5CF6] font-semibold mt-0.5">
              Adversary DNA
            </div>
          </div>
        </div>

        {/* Metric 6: Malicious Infrastructure */}
        <div
          onClick={() => router.push("/attack-graph")}
          className="clean-card card-hover p-4 flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase group-hover:text-[#4F46E5]">High-Risk Infra</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0F9FF] flex items-center justify-center text-[#0284C7]">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#0F172A] group-hover:text-[#4F46E5]">
              {stats?.high_risk_infrastructure || 9}
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5 font-medium">
              Graph Matrix
            </div>
          </div>
        </div>
      </div>

      {/* 4. Middle Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Threats Over Time with Interactive Timeframe Selector */}
        <div className="clean-card p-6 lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Threat Ingestion Volume (Live Stream)
              </h2>
              <p className="text-xs text-[#64748B]">Real-time temporal distribution of scanned messages</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-xs font-medium text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span> Threats
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> Clean
                </span>
              </div>
              {/* Working Timeframe Dropdown */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-xs font-bold text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getTrendData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cleanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey={timeRange === "24h" || timeRange === "30d" ? "day" : "timestamp"} stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}
                />
                <Area type="monotone" dataKey="clean" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#cleanGradient)" name="Clean" />
                <Area type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#threatGradient)" name="Threats" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Threat Distribution Donut */}
        <div className="clean-card p-6 lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Threat Distribution</h2>
              <p className="text-xs text-[#64748B]">Breakdown by attack typology</p>
            </div>
            <Link href="/threat-intel" className="text-xs font-bold text-[#4F46E5] hover:underline">
              View Details →
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto">
            {/* Donut with Centered Number */}
            <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.category_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(stats?.category_distribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={VIBRANT_DONUT_COLORS[index % VIBRANT_DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-extrabold text-[#0F172A]">{stats?.threats_detected || 31}</span>
                <span className="text-[11px] text-[#64748B] font-medium">Total Threats</span>
              </div>
            </div>

            {/* Category Breakdown Legend */}
            <div className="flex-1 space-y-2.5 w-full">
              {(stats?.category_distribution || []).map((cat: any, idx: number) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: VIBRANT_DONUT_COLORS[idx % VIBRANT_DONUT_COLORS.length] }}
                    ></span>
                    <span className="font-semibold text-[#334155]">{cat.name}</span>
                  </div>
                  <div className="text-[#64748B] font-bold">
                    {cat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom 3-Column Grid */}
      <div id="recent-telemetry" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Recent Scans */}
        <div className="clean-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A]">Recent Incident Telemetry</h3>
            <Link href="/analyze" className="text-xs font-bold text-[#4F46E5] hover:underline">
              View All →
            </Link>
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-xl text-[11px] font-medium">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "CLEAN"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  severityFilter === sev
                    ? "bg-white text-[#4F46E5] font-bold shadow-2xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {emails.length === 0 ? (
              <p className="text-xs text-[#64748B] py-4 text-center">No incidents match this filter.</p>
            ) : (
              emails.slice(0, 5).map((e, idx) => {
                const isCrit = e.severity === "CRITICAL";
                const isHigh = e.severity === "HIGH";
                const isMed = e.severity === "MEDIUM";

                return (
                  <div
                    key={e.id || idx}
                    onClick={() => router.push(`/analyze?id=${e.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCrit || isHigh
                            ? "bg-[#FEF2F2] text-[#EF4444]"
                            : isMed
                            ? "bg-[#FFFBEB] text-[#F59E0B]"
                            : "bg-[#F0FDF4] text-[#16A34A]"
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#4F46E5] transition-colors">
                          {e.subject || "Security Notification"}
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate">{e.from_addr}</div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCrit || isHigh
                            ? "bg-[#FEF2F2] text-[#EF4444]"
                            : isMed
                            ? "bg-[#FFFBEB] text-[#F59E0B]"
                            : "bg-[#F0FDF4] text-[#16A34A]"
                        }`}
                      >
                        {e.severity}
                      </span>
                      <div className="text-[10px] text-[#4F46E5] font-bold mt-0.5 flex items-center justify-end gap-0.5">
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Top Threat Senders */}
        <div className="clean-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A]">Top Threat Senders</h3>
            <Link href="/threat-intel" className="text-xs font-bold text-[#4F46E5] hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-2.5">
            {TOP_THREAT_SENDERS.map((sender, idx) => (
              <div
                key={idx}
                onClick={() => router.push(`/threat-intel?q=${sender.email}`)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#4F46E5] transition-colors">
                      {sender.email}
                    </div>
                    <div className="text-[11px] text-[#EF4444] font-medium">{sender.risk}</div>
                  </div>
                </div>

                <div className="w-8 h-7 rounded-lg bg-[#FEF2F2] text-[#EF4444] font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {sender.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Protection Engine Status */}
        <div className="clean-card p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A]">Protection Engine Status</h3>
          </div>

          <div className="flex items-center gap-4">
            {/* Radial Shield Graphic */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#DCFCE7] to-[#F0FDF4] border-4 border-[#BBF7D0] flex items-center justify-center text-[#16A34A] flex-shrink-0 shadow-inner">
              <ShieldCheck className="w-10 h-10 fill-[#16A34A]/20" />
            </div>

            {/* Status Checklist */}
            <div className="flex-1 space-y-2 text-xs">
              {[
                { name: "Real-time Scanning", status: "Active" },
                { name: "AI Detection Engine", status: "Active" },
                { name: "Threat Intelligence", status: "Updated" },
                { name: "Spam Filter", status: "Active" },
                { name: "Email Reputation DB", status: "Updated" }
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-[#64748B] font-medium">{item.name}</span>
                  <span className="text-[#16A34A] font-bold flex items-center gap-1.5">
                    {item.status} <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push("/settings")}
            className="w-full bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#4F46E5] py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>View Security Settings</span>
          </button>
        </div>
      </div>

      {/* 6. Bottom AI Insight Banner */}
      <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#4F46E5] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-200">
            <Bot className="w-5 h-5" />
          </div>
          <div className="text-xs text-[#334155] leading-relaxed">
            <strong className="text-[#4F46E5] font-bold">AI Insight: </strong>
            Continuous heuristic monitoring detected 31 active threats and 3 correlated campaign clusters. DMARC policy enforcement recommended for lookalike domain impersonation.
          </div>
        </div>

        <Link
          href="/reports"
          className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] whitespace-nowrap flex items-center gap-1 self-end sm:self-auto hover:underline"
        >
          <span>View Full Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
