"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderGit2, ArrowRight, User, ShieldCheck, CheckSquare, Lock } from "lucide-react";
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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
            Forensic Case Vault & Bulk Scans
          </h1>
          <p className="text-xs md:text-sm text-[#64748B] mt-1">
            Chain-of-custody tracking, containment workflows, and immutable evidence vault
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          {["ALL", "Investigating", "Open", "Contained", "Resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-white text-[#4F46E5] font-bold shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
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
                className={`clean-card p-4 cursor-pointer transition-all card-hover ${
                  isSelected
                    ? "border-[#4F46E5] ring-2 ring-[#EEF2FF] bg-white shadow-md shadow-indigo-50"
                    : "hover:border-[#CBD5E1]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-[#4F46E5]">
                    {c.case_number}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      c.severity === "CRITICAL"
                        ? "bg-[#FEF2F2] text-[#EF4444]"
                        : c.severity === "HIGH"
                        ? "bg-[#FFF7ED] text-[#EA580C]"
                        : "bg-[#F0FDF4] text-[#16A34A]"
                    }`}
                  >
                    {c.severity}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#0F172A] line-clamp-1 mb-1">
                  {c.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-[#64748B] mt-3 pt-2 border-t border-[#F1F5F9]">
                  <span>Status: <strong className="text-[#0F172A]">{c.status}</strong></span>
                  <span>{c.email_count || 1} Incidents</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Case Detail */}
        {selectedCase && (
          <div className="lg:col-span-2 space-y-6">
            <div className="clean-card p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[#4F46E5]">
                    {selectedCase.case.case_number}
                  </span>
                  <h2 className="text-base font-bold text-[#0F172A] mt-0.5">
                    {selectedCase.case.title}
                  </h2>
                  <div className="text-xs text-[#64748B] mt-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Lead: {selectedCase.case.investigator_name || "Abhinav Pratap Singh"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B] font-semibold">Workflow Status:</span>
                  <select
                    value={selectedCase.case.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs text-[#0F172A] font-bold focus:outline-none focus:border-[#4F46E5]"
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
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Associated Emails ({selectedCase.emails?.length || 0})</h3>
                <div className="space-y-2">
                  {selectedCase.emails?.map((e: any) => (
                    <div key={e.id} className="clean-card-nested p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[#0F172A]">{e.subject}</div>
                        <div className="text-[11px] text-[#64748B] font-mono mt-0.5">From: {e.from_addr}</div>
                      </div>
                      <Link
                        href={`/analyze?id=${e.id}`}
                        className="text-[#4F46E5] hover:underline font-bold text-xs inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Containment Actions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Containment Checklist</h3>
                <div className="space-y-2">
                  {selectedCase.case.action_items?.map((act: any) => (
                    <div
                      key={act.id}
                      onClick={() => handleToggleAction(act.id, act.is_completed)}
                      className="clean-card-nested p-3 flex items-center justify-between text-xs cursor-pointer hover:bg-white hover:border-[#CBD5E1] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={act.is_completed}
                          readOnly
                          className="w-4 h-4 rounded text-[#4F46E5] focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className={`font-bold ${act.is_completed ? "line-through text-[#94A3B8]" : "text-[#0F172A]"}`}>
                            {act.title}
                          </div>
                          <div className="text-[11px] text-[#64748B]">{act.reason}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#E2E8F0] text-[#64748B]">
                        {act.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Registry */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Evidence Vault ({selectedCase.evidence?.length || 0})</h3>
                <div className="space-y-2">
                  {selectedCase.evidence?.map((ev: any) => (
                    <div key={ev.id} className="clean-card-nested p-3 text-xs">
                      <div className="flex items-center justify-between font-bold text-[#0F172A] mb-1">
                        <span>{ev.evidence_type}</span>
                        <span className="text-[#16A34A] text-[11px]">PRESERVED</span>
                      </div>
                      <div className="text-[11px] text-[#64748B] font-mono break-all bg-white p-2 rounded-lg border border-[#E2E8F0]">
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
