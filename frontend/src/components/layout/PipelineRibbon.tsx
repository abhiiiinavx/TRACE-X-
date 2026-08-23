"use client";

import { useRouter } from "next/navigation";
import {
  FileSearch,
  ShieldCheck,
  Brain,
  Route,
  MapPin,
  Globe,
  Network,
  Dna,
  Clock,
  CheckSquare,
  Lock
} from "lucide-react";

interface PipelineRibbonProps {
  activeStage?: string;
  onSelectStage?: (stageId: string) => void;
}

const STAGES = [
  { id: "ingest", name: "Ingest", href: "/analyze?tab=overview", icon: FileSearch },
  { id: "auth", name: "Auth Validate", href: "/analyze?tab=overview", icon: ShieldCheck },
  { id: "explain", name: "NLP / Heuristics", href: "/analyze?tab=explain", icon: Brain },
  { id: "trace", name: "Hop Forensics", href: "/analyze?tab=trace", icon: Route },
  { id: "geolocate", name: "Geo Matrix", href: "/analyze?tab=geolocate", icon: MapPin },
  { id: "intel", name: "Domain Intel", href: "/threat-intel", icon: Globe },
  { id: "graph", name: "Attack Graph", href: "/attack-graph", icon: Network },
  { id: "campaign", name: "Campaign DNA", href: "/campaigns", icon: Dna },
  { id: "timeline", name: "Timeline", href: "/analyze?tab=timeline", icon: Clock },
  { id: "actions", name: "Actions", href: "/cases", icon: CheckSquare },
  { id: "evidence", name: "Evidence Vault", href: "/reports", icon: Lock }
];

export default function PipelineRibbon({ activeStage = "ingest", onSelectStage }: PipelineRibbonProps) {
  const router = useRouter();

  const handleStageClick = (stage: typeof STAGES[0]) => {
    if (onSelectStage) {
      onSelectStage(stage.id);
    } else {
      router.push(stage.href);
    }
  };

  return (
    <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-2.5 shadow-2xs overflow-x-auto select-none">
      <div className="flex items-center min-w-max">
        {STAGES.map((stage, idx) => {
          const isSelected = activeStage === stage.id || activeStage === stage.name.toLowerCase();
          const Icon = stage.icon;

          return (
            <div key={idx} className="flex items-center">
              <button
                onClick={() => handleStageClick(stage)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#EEF2FF] text-[#4F46E5] shadow-2xs"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    isSelected
                      ? "bg-[#4F46E5] text-white"
                      : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  {idx + 1}
                </div>
                <Icon className="w-3.5 h-3.5" />
                <span>{stage.name}</span>
              </button>

              {idx < STAGES.length - 1 && (
                <div className="w-3 h-0.5 bg-[#E2E8F0] mx-1"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
