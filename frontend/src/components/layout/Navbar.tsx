"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Zap,
  Shield,
  Bell,
  Sparkles,
  CheckCircle2,
  Terminal,
  Activity
} from "lucide-react";
import { loadDemoInvestigation } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/threat-intel?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLoadDemo = async () => {
    try {
      setIsLoadingDemo(true);
      const res = await loadDemoInvestigation();
      setDemoLoaded(true);
      setTimeout(() => setDemoLoaded(false), 3000);
      if (res.active_email_id) {
        router.push(`/analyze?id=${res.active_email_id}`);
      }
    } catch (err) {
      console.error("Failed to load demo data", err);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800/80 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Universal IOC Quick Search */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search IP, Domain, URL, SHA-256 hash, ASN (e.g. 194.36.189.44)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c1222] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
          />
        </form>

        {/* Action Controls & Demo Loader */}
        <div className="flex items-center gap-3">
          {/* One-Click Load Demo Hero Button */}
          <button
            onClick={handleLoadDemo}
            disabled={isLoadingDemo}
            className="relative group flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoadingDemo ? "Loading Case..." : demoLoaded ? "Demo Loaded!" : "Load Demo Investigation"}</span>
            {demoLoaded && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
          </button>

          {/* Threat Feed Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0c1222] border border-slate-800 text-[11px] text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-mono text-cyan-300">SOC Feeds: 100% Synced</span>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-xs font-bold">
              TX
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-200">Lead Investigator</div>
              <div className="text-[10px] text-cyan-400 font-mono">SOC Level 3</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
