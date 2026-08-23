"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSearch,
  Radar,
  Network,
  Dna,
  FolderGit2,
  FileText,
  Sliders,
  Shield,
  Crown,
  ChevronDown,
  Sparkles,
  Check
} from "lucide-react";
import { useState } from "react";
import { loadDemoInvestigation } from "@/lib/api";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard
  },
  {
    name: "Analyze Email",
    href: "/analyze",
    icon: FileSearch
  },
  {
    name: "Threat Intel",
    href: "/threat-intel",
    icon: Radar
  },
  {
    name: "Attack Graph",
    href: "/attack-graph",
    icon: Network
  },
  {
    name: "Campaign DNA",
    href: "/campaigns",
    icon: Dna
  },
  {
    name: "Forensic Cases",
    href: "/cases",
    icon: FolderGit2
  },
  {
    name: "Incident Reports",
    href: "/reports",
    icon: FileText
  },
  {
    name: "Settings & Audit",
    href: "/settings",
    icon: Sliders
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleQuickDemo = async () => {
    try {
      setLoadingDemo(true);
      const res = await loadDemoInvestigation();
      if (res.active_email_id) {
        router.push(`/analyze?id=${res.active_email_id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between flex-shrink-0 min-h-screen select-none sticky top-0 h-screen z-30">
      {/* Top Brand & Nav */}
      <div className="flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#818CF8] flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Shield className="w-6 h-6 fill-white/20" strokeWidth={2} />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-[#0F172A]">
              TRACE-X
            </div>
            <div className="text-xs text-[#64748B] font-medium">
              Cyber-Forensics Platform
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#EEF2FF] text-[#4F46E5] font-semibold"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] transition-colors ${
                    isActive ? "text-[#4F46E5]" : "text-[#94A3B8]"
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Pro Plan Card & User Profile */}
      <div className="p-4 space-y-3 border-t border-[#F1F5F9] bg-white">
        {/* Pro Plan Card */}
        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]/80 space-y-2.5">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]/20" />
            <span className="text-xs font-bold text-[#0F172A]">Forensic Vault</span>
          </div>

          <div className="space-y-1 text-[11px] text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
              <span>Full Hop Reconstruction</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
              <span>Campaign DNA Clustering</span>
            </div>
          </div>

          <button
            onClick={handleQuickDemo}
            disabled={loadingDemo}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loadingDemo ? "Loading Demo..." : "Load Demo Investigation"}</span>
          </button>
        </div>

        {/* User Profile Footer */}
        <div
          onClick={() => router.push("/settings")}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          title="Account Settings"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#818CF8] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              APS
            </div>
            <div>
              <div className="text-xs font-bold text-[#0F172A]">Abhinav Pratap Singh</div>
              <div className="text-[11px] text-[#64748B]">Lead Analyst</div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
        </div>
      </div>
    </aside>
  );
}
