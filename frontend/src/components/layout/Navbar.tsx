"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, CheckCircle2 } from "lucide-react";
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
    <header className="sticky top-0 z-20 bg-[#0B0F14]/95 backdrop-blur-sm border-b border-[#1F2933] px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Universal IOC Search */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7C8896]" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search IP, Domain, URL, Hash, ASN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#10161D] border border-[#1F2933] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#E6EBF0] placeholder-[#7C8896] focus:outline-none focus:border-[#2DD4BF] font-mono transition-colors"
          />
        </form>

        {/* Actions & Profile */}
        <div className="flex items-center gap-4">
          {/* Feed Sync Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#7C8896] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#34C795]"></span>
            <span>Feeds Synced</span>
          </div>

          {/* Single Load Demo Hero Button */}
          <button
            onClick={handleLoadDemo}
            disabled={isLoadingDemo}
            className="flex items-center gap-1.5 bg-[#2DD4BF] hover:bg-[#14B8A6] disabled:opacity-50 text-[#0B0F14] font-semibold px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>{isLoadingDemo ? "Loading..." : demoLoaded ? "Loaded" : "Load Demo Case"}</span>
            {demoLoaded && <CheckCircle2 className="w-3.5 h-3.5 text-[#0B0F14]" />}
          </button>

          {/* Investigator Profile */}
          <div className="flex items-center gap-2 pl-3 border-l border-[#1F2933]">
            <div className="w-7 h-7 rounded-md bg-[#161D26] border border-[#1F2933] flex items-center justify-center text-[#2DD4BF] text-xs font-mono font-bold">
              TX
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-medium text-[#E6EBF0]">Analyst</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
