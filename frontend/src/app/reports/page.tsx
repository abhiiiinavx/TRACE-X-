"use client";

import { useEffect, useState } from "react";
import { FileText, Printer, ExternalLink } from "lucide-react";
import { listEmails, getReportHtmlUrl } from "@/lib/api";
import { MOCK_SAMPLES } from "@/lib/mockData";
import PipelineRibbon from "@/components/layout/PipelineRibbon";

export default function ForensicReportsPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEmails({ limit: 20 })
      .then((data) => {
        const items = data.items && data.items.length > 0 ? data.items : MOCK_SAMPLES;
        setEmails(items);
        if (items.length > 0) {
          setSelectedEmailId(items[0].id);
        }
      })
      .catch(() => {
        setEmails(MOCK_SAMPLES);
        setSelectedEmailId(MOCK_SAMPLES[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
            Printable Forensic Reports
          </h1>
          <p className="text-xs md:text-sm text-[#64748B] mt-1">
            Generate and export formal forensic documentation with MITRE ATT&CK alignment, envelope header verification, and print-to-PDF support
          </p>
        </div>

        {selectedEmailId && (
          <a
            href={getReportHtmlUrl(selectedEmailId)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Interactive Pipeline Ribbon Stepper */}
      <PipelineRibbon activeStage="evidence" currentEmailId={selectedEmailId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Select Incident</h3>
          {emails.map((e) => {
            const isSelected = selectedEmailId === e.id;
            return (
              <div
                key={e.id}
                onClick={() => setSelectedEmailId(e.id)}
                className={`clean-card p-4 cursor-pointer transition-all card-hover ${
                  isSelected
                    ? "border-[#4F46E5] ring-2 ring-[#EEF2FF] bg-white shadow-md shadow-indigo-50"
                    : "hover:border-[#CBD5E1]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#4F46E5]">
                    {e.classification || "Confirmed Threat"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      e.severity === "CRITICAL"
                        ? "bg-[#FEF2F2] text-[#EF4444]"
                        : e.severity === "HIGH"
                        ? "bg-[#FFF7ED] text-[#EA580C]"
                        : "bg-[#F0FDF4] text-[#16A34A]"
                    }`}
                  >
                    {e.severity}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#0F172A] line-clamp-1">{e.subject}</div>
                <div className="text-[11px] text-[#64748B] font-mono mt-1 truncate">From: {e.from_addr}</div>
              </div>
            );
          })}
        </div>

        {/* Preview Frame */}
        <div className="lg:col-span-2">
          {selectedEmailId ? (
            <div className="clean-card overflow-hidden flex flex-col h-[700px] shadow-md">
              <div className="p-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-xs">
                <span className="font-bold text-[#0F172A]">Report Live Preview</span>
                <span className="text-[11px] text-[#64748B] font-medium">A4 Formatted Template</span>
              </div>
              <iframe
                src={getReportHtmlUrl(selectedEmailId)}
                className="w-full flex-1 bg-white border-0"
                title="Forensic Report"
              />
            </div>
          ) : (
            <div className="clean-card p-12 text-center text-[#64748B] text-xs">
              Select an incident from the left to preview its forensic report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
