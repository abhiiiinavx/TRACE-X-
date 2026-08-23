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
  Activity
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    isLive: true
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

  return (
    <aside className="w-64 bg-[#0B0F14] border-r border-[#1F2933] flex flex-col justify-between flex-shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div>
        <div className="px-5 py-4 border-b border-[#1F2933]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#161D26] border border-[#1F2933] flex items-center justify-center text-[#2DD4BF] font-bold">
              <Shield className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-[#E6EBF0]">
                TRACE<span className="text-[#2DD4BF]">-X</span>
              </div>
              <div className="text-[11px] text-[#7C8896]">
                Cyber Forensics
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#161D26] text-[#E6EBF0] border-l-2 border-[#2DD4BF] font-semibold"
                    : "text-[#7C8896] hover:text-[#E6EBF0] hover:bg-[#10161D] border-l-2 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-[#2DD4BF]" : "text-[#7C8896]"}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <span>{item.name}</span>
                </div>

                {item.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C795] animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Status */}
      <div className="p-4 border-t border-[#1F2933] text-[11px] text-[#7C8896] flex items-center justify-between font-mono">
        <span>Engine v1.0</span>
        <span className="text-[#34C795] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34C795]"></span>
          Online
        </span>
      </div>
    </aside>
  );
}
