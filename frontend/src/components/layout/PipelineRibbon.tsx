"use client";

import {
  Scan,
  Sparkles,
  Route,
  MapPin,
  GitMerge,
  Layers,
  Network,
  MessageSquareCode,
  FileCheck2
} from "lucide-react";

interface PipelineRibbonProps {
  activeStage?: string;
  onSelectStage?: (stage: string) => void;
}

const STAGES = [
  { id: "detect", name: "DETECT", desc: "MIME & Auth", icon: Scan },
  { id: "explain", name: "EXPLAIN", desc: "Feature Weights", icon: Sparkles },
  { id: "trace", name: "TRACE", desc: "Hop Relay", icon: Route },
  { id: "geolocate", name: "GEOLOCATE", desc: "Infrastructure Map", icon: MapPin },
  { id: "correlate", name: "CORRELATE", desc: "Domain & URL", icon: GitMerge },
  { id: "cluster", name: "CLUSTER", desc: "Campaign DNA", icon: Layers },
  { id: "visualize", name: "VISUALIZE", desc: "Attack Graph", icon: Network },
  { id: "investigate", name: "INVESTIGATE", desc: "AI Copilot", icon: MessageSquareCode },
  { id: "report", name: "REPORT", desc: "Forensic PDF", icon: FileCheck2 },
];

export default function PipelineRibbon({ activeStage, onSelectStage }: PipelineRibbonProps) {
  return (
    <div className="w-full bg-[#080d1a] border-b border-slate-800/80 px-6 py-2.5 overflow-x-auto select-none">
      <div className="flex items-center justify-between min-w-[760px] gap-2">
        {STAGES.map((stage, idx) => {
          const isActive = activeStage?.toLowerCase() === stage.id;
          const Icon = stage.icon;
          return (
            <div key={stage.id} className="flex items-center flex-1">
              <button
                onClick={() => onSelectStage && onSelectStage(stage.id)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-md transition-all w-full ${
                  isActive
                    ? "bg-cyan-500/15 border border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold font-mono ${
                    isActive ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-extrabold tracking-wider leading-none flex items-center gap-1">
                    <span>{stage.name}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 leading-tight mt-0.5">{stage.desc}</div>
                </div>
              </button>
              {idx < STAGES.length - 1 && (
                <div className="px-1 text-slate-700 text-xs font-bold select-none">→</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
