"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Sparkles, CheckCircle2, Mail, Globe, Server, Link as LinkIcon, FolderGit2, Dna, X, Loader2 } from "lucide-react";
import { loadDemoInvestigation, searchUnified } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchUnified(searchQuery.trim());
        setSearchResults(res);
        setShowResults(true);
      } catch (err) {
        console.error("Universal search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults && searchResults.results && searchResults.results.length > 0) {
      const topResult = searchResults.results[0];
      setShowResults(false);
      router.push(topResult.link);
    } else if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/threat-intel?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectResult = (link: string) => {
    setShowResults(false);
    setSearchQuery("");
    router.push(link);
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

  const getItemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "email":
        return <Mail className="w-3.5 h-3.5 text-[#EF4444]" />;
      case "domain":
        return <Globe className="w-3.5 h-3.5 text-[#F97316]" />;
      case "ip":
        return <Server className="w-3.5 h-3.5 text-[#4F46E5]" />;
      case "url":
        return <LinkIcon className="w-3.5 h-3.5 text-[#F59E0B]" />;
      case "case":
        return <FolderGit2 className="w-3.5 h-3.5 text-[#10B981]" />;
      case "campaign":
        return <Dna className="w-3.5 h-3.5 text-[#8B5CF6]" />;
      default:
        return <Search className="w-3.5 h-3.5 text-[#64748B]" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-6 md:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Universal Search Bar */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-xl">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Universal search: sender, domain, IP, hash, case, campaign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults) setShowResults(true); }}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl pl-10 pr-12 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all shadow-inner"
          />
          {isSearching ? (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4F46E5] animate-spin" />
          ) : (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-[#94A3B8] bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">
              ⌘K
            </span>
          )}
        </form>

        {/* Universal Search Results Popover */}
        {showResults && searchResults && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[460px] flex flex-col">
            <div className="p-3 bg-[#F8FAFC] border-b border-[#F1F5F9] flex items-center justify-between text-xs">
              <span className="font-bold text-[#0F172A]">
                {searchResults.total_count} Telemetry Matches for "{searchResults.query}"
              </span>
              <button
                onClick={() => setShowResults(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-0.5 rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-y-auto p-2 space-y-1 divide-y divide-[#F8FAFC]">
              {searchResults.results.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B]">
                  No records matching "{searchResults.query}" found in database.
                </div>
              ) : (
                searchResults.results.map((item: any) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelectResult(item.link)}
                    className="p-2.5 rounded-xl hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors">
                        {getItemIcon(item.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-[#64748B] px-1.5 py-0.2 rounded bg-[#F1F5F9]">
                            {item.type}
                          </span>
                          <span className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#4F46E5] transition-colors">
                            {item.title}
                          </span>
                        </div>
                        {item.subtitle && (
                          <div className="text-[11px] text-[#64748B] truncate mt-0.5 font-mono">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    {item.severity && (
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                          item.severity === "CRITICAL"
                            ? "bg-[#FEF2F2] text-[#EF4444]"
                            : item.severity === "HIGH"
                            ? "bg-[#FFF7ED] text-[#EA580C]"
                            : "bg-[#F0FDF4] text-[#16A34A]"
                        }`}
                      >
                        {item.severity}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-3.5">
        {/* Local Intel Active Status */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#64748B] font-medium bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
          <span>Local Intel Active</span>
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
