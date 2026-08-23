"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Printer,
  ExternalLink,
  Shield,
  Download,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight
} from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Forensic Incident Reports</span>
          </h1>
          <p className="text-xs text-slate-400">
            Generate and export courtroom-ready, executive forensic PDF reports with MITRE ATT&CK alignment
          </p>
        </div>

        {selectedEmailId && (
          <a
            href={getReportHtmlUrl(selectedEmailId)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Selected Report as PDF</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Selector List */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase">
            Select Case Telemetry
          </div>
          {emails.map((e) => {
            const isSelected = selectedEmailId === e.id;
            return (
              <div
                key={e.id}
                onClick={() => setSelectedEmailId(e.id)}
                className={`cyber-card p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-cyan-500/80 bg-cyan-950/20 shadow-md shadow-cyan-500/10"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    {e.classification}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      e.severity === "CRITICAL"
                        ? "bg-red-950 text-red-400 border border-red-500/30"
                        : e.severity === "HIGH"
                        ? "bg-orange-950 text-orange-400 border border-orange-500/30"
                        : "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {e.severity}
                  </span>
                </div>
                <div className="text-xs font-bold text-white line-clamp-1">{e.subject}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">From: {e.from_addr}</div>
              </div>
            );
          })}
        </div>

        {/* Live Printable Report Preview Frame */}
        <div className="lg:col-span-2">
          {selectedEmailId ? (
            <div className="cyber-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col h-[700px]">
              <div className="p-3 bg-[#080d1a] border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-400 font-bold">Report Preview Frame</span>
                <span className="text-[10px] text-slate-400 font-mono">A4 Print Standard</span>
              </div>
              <iframe
                src={getReportHtmlUrl(selectedEmailId)}
                className="w-full flex-1 bg-white border-0"
                title="Forensic Incident Report"
              />
            </div>
          ) : (
            <div className="cyber-card p-12 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs font-mono">
              Select an email from the left to view and export its forensic report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
