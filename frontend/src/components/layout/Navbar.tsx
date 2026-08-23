"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Sparkles, CheckCircle2 } from "lucide-react";
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
      setTimeout(() => setDemoLoaded(false), 2500);
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
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-6 md:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Universal Search Bar */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search by sender, domain, IP, subject, or hash..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl pl-10 pr-12 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all shadow-inner"
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-[#94A3B8] bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">
          ⌘K
        </span>
      </form>

      {/* Actions & Profile */}
      <div className="flex items-center gap-3.5">
        {/* Live Feeds Status */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#64748B] font-medium bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
          <span>Feeds Synced</span>
        </div>

        {/* 1-Click Judge Button: Load Demo Case */}
        <button
          onClick={handleLoadDemo}
          disabled={isLoadingDemo}
          className="flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm hover:shadow-md hover:shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isLoadingDemo ? "Loading Case..." : demoLoaded ? "Demo Loaded" : "Load Demo Case"}</span>
          {demoLoaded && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => router.push("/cases")}
          className="relative p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#4F46E5] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            3
          </span>
        </button>

        {/* User Profile Avatar */}
        <div
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0] cursor-pointer"
          title="Account & Settings (Abhinav Pratap Singh)"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#818CF8] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 hover:ring-[#C7D2FE] transition-all">
            APS
          </div>
        </div>
      </div>
    </header>
  );
}
