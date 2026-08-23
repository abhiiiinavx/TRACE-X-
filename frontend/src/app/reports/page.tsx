"use client";

import { useEffect, useState } from "react";
import { FileText, Printer, ExternalLink } from "lucide-react";
import { listEmails, getReportHtmlUrl } from "@/lib/api";

export default function ForensicReportsPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEmails({ limit: 20 })
      .then((data) => {
        setEmails(data.items);
        if (data.items.length > 0) {
          setSelectedEmailId(data.items[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2933] pb-4">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EBF0] tracking-tight">
            Forensic Incident Reports
          </h1>
          <p className="text-xs text-[#7C8896] mt-0.5">
            Generate and export courtroom-ready, executive forensic PDF reports with MITRE ATT&CK alignment.
          </p>
        </div>

        {selectedEmailId && (
          <a
            href={getReportHtmlUrl(selectedEmailId)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0B0F14] px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Incident List */}
        <div className="space-y-2">
          <div className="soc-label">Select Incident</div>
          {emails.map((e) => {
            const isSelected = selectedEmailId === e.id;
            return (
              <div
                key={e.id}
                onClick={() => setSelectedEmailId(e.id)}
                className={`soc-card p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? "border-[#2DD4BF] bg-[#161D26]"
                    : "hover:border-[#7C8896]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-[#2DD4BF]">
                    {e.classification}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded uppercase ${
                      e.severity === "CRITICAL"
                        ? "bg-[rgba(229,72,77,0.12)] text-[#E5484D]"
                        : e.severity === "HIGH"
                        ? "bg-[rgba(240,136,62,0.12)] text-[#F0883E]"
                        : "bg-[rgba(52,199,149,0.12)] text-[#34C795]"
                    }`}
                  >
                    {e.severity}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#E6EBF0] line-clamp-1">{e.subject}</div>
                <div className="text-[10px] text-[#7C8896] font-mono mt-1">From: {e.from_addr}</div>
              </div>
            );
          })}
        </div>

        {/* Preview Frame */}
        <div className="lg:col-span-2">
          {selectedEmailId ? (
            <div className="soc-card overflow-hidden flex flex-col h-[650px]">
              <div className="p-2.5 bg-[#0B0F14] border-b border-[#1F2933] flex items-center justify-between text-xs font-mono">
                <span className="text-[#E6EBF0]">Report Preview</span>
                <span className="text-[10px] text-[#7C8896]">A4 Print Template</span>
              </div>
              <iframe
                src={getReportHtmlUrl(selectedEmailId)}
                className="w-full flex-1 bg-white border-0"
                title="Forensic Report"
              />
            </div>
          ) : (
            <div className="soc-card p-12 text-center text-[#7C8896] text-xs font-mono">
              Select an incident from the left to view its forensic report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
