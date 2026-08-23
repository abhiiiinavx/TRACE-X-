"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderGit2, ArrowRight, User } from "lucide-react";
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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2933] pb-4">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EBF0] tracking-tight">
            Forensic Case Management
          </h1>
          <p className="text-xs text-[#7C8896] mt-0.5">
            Chain-of-custody tracking, investigation status workflows, and mitigation containment actions.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-[#0B0F14] p-1 rounded border border-[#1F2933] text-[11px] font-mono">
          {["ALL", "Investigating", "Open", "Contained", "Resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-[#161D26] text-[#2DD4BF] font-semibold"
                  : "text-[#7C8896] hover:text-[#E6EBF0]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Cases List */}
        <div className="space-y-2">
          {cases.map((c) => {
            const isSelected = selectedCase?.case?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => handleSelectCase(c.id)}
                className={`soc-card p-3.5 cursor-pointer transition-colors ${
                  isSelected
                    ? "border-[#2DD4BF] bg-[#161D26]"
                    : "hover:border-[#7C8896]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-[#2DD4BF]">
                    {c.case_number}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded uppercase ${
                      c.severity === "CRITICAL"
                        ? "bg-[rgba(229,72,77,0.12)] text-[#E5484D]"
                        : c.severity === "HIGH"
                        ? "bg-[rgba(240,136,62,0.12)] text-[#F0883E]"
                        : "bg-[rgba(52,199,149,0.12)] text-[#34C795]"
                    }`}
                  >
                    {c.severity}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-[#E6EBF0] line-clamp-1 mb-1">
                  {c.title}
                </h3>

                <div className="flex items-center justify-between text-[10px] text-[#7C8896] mt-2 pt-1.5 border-t border-[#1F2933] font-mono">
                  <span>Status: <strong className="text-[#E6EBF0]">{c.status}</strong></span>
                  <span>{c.email_count || 1} Emails</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Case Detail */}
        {selectedCase && (
          <div className="lg:col-span-2 space-y-4">
            <div className="soc-card p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F2933] pb-3">
                <div>
                  <span className="font-mono text-xs font-semibold text-[#2DD4BF]">
                    {selectedCase.case.case_number}
                  </span>
                  <h2 className="text-sm font-bold text-[#E6EBF0] mt-0.5">
                    {selectedCase.case.title}
                  </h2>
                  <div className="text-xs text-[#7C8896] mt-1 flex items-center gap-1.5 font-mono">
                    <User className="w-3.5 h-3.5" />
                    <span>{selectedCase.case.investigator_name || "Lead Analyst"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7C8896] font-mono">Status:</span>
                  <select
                    value={selectedCase.case.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-[#0B0F14] border border-[#1F2933] rounded px-2.5 py-1 text-xs text-[#E6EBF0] font-mono focus:outline-none focus:border-[#2DD4BF]"
                  >
                    {["Open", "Investigating", "Contained", "Resolved", "Archived"].map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Associated Emails */}
              <div className="space-y-2">
                <div className="soc-label">Associated Emails ({selectedCase.emails?.length || 0})</div>
                <div className="space-y-1.5">
                  {selectedCase.emails?.map((e: any) => (
                    <div key={e.id} className="soc-card-nested p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-[#E6EBF0]">{e.subject}</div>
                        <div className="text-[10px] text-[#7C8896] font-mono mt-0.5">From: {e.from_addr}</div>
                      </div>
                      <Link
                        href={`/analyze?id=${e.id}`}
                        className="text-[#2DD4BF] hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <div className="soc-label">Containment Actions</div>
                <div className="space-y-1.5">
                  {selectedCase.case.action_items?.map((act: any) => (
                    <div
                      key={act.id}
                      onClick={() => handleToggleAction(act.id, act.is_completed)}
                      className="soc-card-nested p-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-[#1F2933]/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={act.is_completed}
                          readOnly
                          className="w-3.5 h-3.5 rounded border-[#1F2933] bg-[#0B0F14] text-[#2DD4BF] focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className={`font-medium ${act.is_completed ? "line-through text-[#7C8896]" : "text-[#E6EBF0]"}`}>
                            {act.title}
                          </div>
                          <div className="text-[10px] text-[#7C8896]">{act.reason}</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0B0F14] text-[#7C8896]">
                        {act.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Registry */}
              <div className="space-y-2">
                <div className="soc-label">Evidence Vault ({selectedCase.evidence?.length || 0})</div>
                <div className="space-y-1.5">
                  {selectedCase.evidence?.map((ev: any) => (
                    <div key={ev.id} className="soc-card-nested p-2 text-xs">
                      <div className="flex items-center justify-between font-mono text-[#E6EBF0] mb-0.5">
                        <span>{ev.evidence_type}</span>
                        <span className="text-[#34C795] text-[10px]">PRESERVED</span>
                      </div>
                      <div className="text-[10px] text-[#7C8896] font-mono break-all">
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
