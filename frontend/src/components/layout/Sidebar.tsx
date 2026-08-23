"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanEye,
  Radar,
  Dna,
  Network,
  FolderGit2,
  FileText,
  Sliders,
  ShieldCheck,
  Zap,
  Radio
} from "lucide-react";

const NAV_ITEMS = [
  { name: "SOC Dashboard", href: "/", icon: LayoutDashboard, badge: "Live" },
  { name: "Analyze Email", href: "/analyze", icon: ScanEye, badge: "Core" },
  { name: "Threat Intel", href: "/threat-intel", icon: Radar },
  { name: "Campaigns DNA", href: "/campaigns", icon: Dna, badge: "Cluster" },
  { name: "Attack Graph", href: "/attack-graph", icon: Network },
  { name: "Forensic Cases", href: "/cases", icon: FolderGit2 },
  { name: "Forensic Reports", href: "/reports", icon: FileText },
  { name: "Settings & Audit", href: "/settings", icon: Sliders },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#080d1a] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="px-5 py-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#080d1a] rounded-[7px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">TRACE<span className="text-cyan-400">-X</span></span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">SIH 2026</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Cyber-Forensics AI</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-cyan-950/50 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* SOC Status Indicator Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#060913]/60">
        <div className="cyber-card p-3 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-slate-300">Threat Engine</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">ONLINE</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Deterministic ThreatIntelProvider active. Zero paid API keys required.
          </p>
        </div>
      </div>
    </aside>
  );
}
