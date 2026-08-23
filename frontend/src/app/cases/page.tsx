"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Shield,
  FileText,
  User,
  Plus
} from "lucide-react";
import { listCases, getCaseDetail, updateCaseStatus, toggleCaseAction } from "@/lib/api";

export default function ForensicCasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, [statusFilter]);

  const loadCases = async () => {
    try {
      const data = await listCases(statusFilter === "ALL" ? undefined : statusFilter);
      setCases(data);
      if (data.length > 0 && !selectedCase) {
        const first = await getCaseDetail(data[0].id);
        setSelectedCase(first);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCase = async (id: string) => {
    try {
      const detail = await getCaseDetail(id);
      setSelectedCase(detail);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedCase) return;
    try {
      await updateCaseStatus(selectedCase.case.id, newStatus);
      handleSelectCase(selectedCase.case.id);
      loadCases();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAction = async (actionId: string, currentVal: boolean) => {
    if (!selectedCase) return;
    try {
      await toggleCaseAction(selectedCase.case.id, actionId, !currentVal);
      handleSelectCase(selectedCase.case.id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-cyan-400" />
            <span>Forensic Case Management & Evidence Vault</span>
          </h1>
          <p className="text-xs text-slate-400">
            Immutable chain-of-custody tracking, investigation status workflows, and containment action items
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-[#080d1a] p-1 rounded-lg border border-slate-800 text-[11px]">
          {["ALL", "Investigating", "Open", "Contained", "Resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-cyan-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Cases List */}
        <div className="space-y-3">
          {cases.map((c) => {
            const isSelected = selectedCase?.case?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => handleSelectCase(c.id)}
                className={`cyber-card p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-cyan-500/80 bg-cyan-950/20 shadow-md shadow-cyan-500/10"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                    {c.case_number}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      c.severity === "CRITICAL"
                        ? "bg-red-950 text-red-400 border border-red-500/30"
                        : c.severity === "HIGH"
                        ? "bg-orange-950 text-orange-400 border border-orange-500/30"
                        : "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {c.severity}
                  </span>
                </div>

                <h3 className="text-xs font-extrabold text-white line-clamp-1 mb-1">
                  {c.title}
                </h3>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800 font-mono">
                  <span>Status: <strong className="text-white">{c.status}</strong></span>
                  <span>{c.email_count || 1} Emails</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Case Detail & Evidence View */}
        {selectedCase && (
          <div className="lg:col-span-2 space-y-5">
            <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {selectedCase.case.case_number}
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                    {selectedCase.case.title}
                  </h2>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Investigator: {selectedCase.case.investigator_name || "Lead SOC Analyst"}</span>
                  </div>
                </div>

                {/* Status Switcher Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Status:</span>
                  <select
                    value={selectedCase.case.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-[#080d1a] border border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none"
                  >
                    {["Open", "Investigating", "Contained", "Resolved", "Archived"].map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Linked Incident Emails */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase font-mono text-cyan-400">
                  Associated Email Evidence ({selectedCase.emails?.length || 0})
                </h3>
                <div className="space-y-2">
                  {selectedCase.emails?.map((e: any) => (
                    <div key={e.id} className="p-3 bg-[#080d1a] rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{e.subject}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">From: {e.from_addr}</div>
                      </div>
                      <Link
                        href={`/analyze?id=${e.id}`}
                        className="text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1"
                      >
                        <span>Inspect Forensics</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mitigation Action Items Checklist */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase font-mono text-cyan-400">
                  Containment & Mitigation Action Items
                </h3>
                <div className="space-y-2">
                  {selectedCase.case.action_items?.map((act: any) => (
                    <div
                      key={act.id}
                      onClick={() => handleToggleAction(act.id, act.is_completed)}
                      className="p-3 bg-[#080d1a] hover:bg-[#111a30] rounded-xl border border-slate-800 flex items-center justify-between text-xs cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={act.is_completed}
                          readOnly
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className={`font-bold ${act.is_completed ? "line-through text-slate-500" : "text-white"}`}>
                            {act.title}
                          </div>
                          <div className="text-[11px] text-slate-400">{act.reason}</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {act.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Registry */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase font-mono text-cyan-400">
                  Immutable Evidence Vault ({selectedCase.evidence?.length || 0})
                </h3>
                <div className="space-y-2">
                  {selectedCase.evidence?.map((ev: any) => (
                    <div key={ev.id} className="p-3 bg-[#080d1a] rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center justify-between font-bold text-white mb-1">
                        <span>{ev.evidence_type}</span>
                        <span className="text-emerald-400 font-mono text-[10px]">PRESERVED</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono break-all">
                        SHA-256: {ev.sha256}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
