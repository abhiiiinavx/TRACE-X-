"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export interface StageItem {
  id: string;
  tab: string;
  name: string;
  href: string;
  icon: any;
  description: string;
}

export const STAGES: StageItem[] = [
  { id: "ingest", tab: "ingest", name: "Ingest", href: "/analyze?tab=ingest", icon: FileSearch, description: "RFC 5322 MIME & Payload Intake" },
  { id: "auth", tab: "overview", name: "Auth Validate", href: "/analyze?tab=overview", icon: ShieldCheck, description: "DMARC, SPF, DKIM & Alignment" },
  { id: "explain", tab: "explain", name: "NLP / Heuristics", href: "/analyze?tab=explain", icon: Brain, description: "Explainable AI Scoring Breakdown" },
  { id: "trace", tab: "trace", name: "Hop Forensics", href: "/analyze?tab=trace", icon: Route, description: "Sequential MTA Relay Hop Reconstruction" },
  { id: "geolocate", tab: "geolocate", name: "Geo Matrix", href: "/analyze?tab=geolocate", icon: MapPin, description: "Physical IP Coordinates & ISP Attribution" },
  { id: "intel", tab: "correlate", name: "Domain Intel", href: "/threat-intel", icon: Globe, description: "Lookalike Typosquatting & URL Analysis" },
  { id: "graph", tab: "visualize", name: "Attack Graph", href: "/attack-graph", icon: Network, description: "Entity-Relationship Threat Topology" },
  { id: "campaign", tab: "cluster", name: "Campaign DNA", href: "/campaigns", icon: Dna, description: "Multi-Signal Cluster Association" },
  { id: "timeline", tab: "timeline", name: "Timeline", href: "/analyze?tab=timeline", icon: Clock, description: "Chronological Incident Telemetry" },
  { id: "actions", tab: "actions", name: "Actions", href: "/cases", icon: CheckSquare, description: "Automated Containment Workflows" },
  { id: "evidence", tab: "evidence", name: "Evidence Vault", href: "/reports", icon: Lock, description: "Cryptographic SHA-256 Chain of Custody" }
];

interface PipelineRibbonProps {
  activeStage?: string;
  currentEmailId?: string;
  onSelectStage?: (tab: string, stageId: string, href: string) => void;
  className?: string;
}

function RibbonInner({
  activeStage = "",
  currentEmailId = "",
  onSelectStage,
  className = ""
}: PipelineRibbonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailId = currentEmailId || searchParams?.get("id") || "";

  const handleStageClick = (stage: StageItem) => {
    if (onSelectStage) {
      onSelectStage(stage.tab, stage.id, stage.href);
      return;
    }

    // Preserve active email ID if navigating between analyze stages
    if (stage.href.startsWith("/analyze")) {
      const targetUrl = emailId
        ? `/analyze?id=${encodeURIComponent(emailId)}&tab=${stage.tab}`
        : stage.href;
      router.push(targetUrl);
    } else {
      router.push(stage.href);
    }
  };

  const getIsSelected = (stage: StageItem, index: number) => {
    if (!activeStage || activeStage === "dashboard") return false;

    const normalized = activeStage.toLowerCase().trim();

    // Direct ID or Tab match
    if (normalized === stage.id.toLowerCase() || normalized === stage.tab.toLowerCase()) {
      return true;
    }

    // Stage Name match
    if (normalized === stage.name.toLowerCase()) {
      return true;
    }

    // Contextual alias mappings
    switch (normalized) {
      case "ingest":
      case "upload":
      case "sample":
      case "samples":
      case "paste":
        return stage.id === "ingest";

      case "auth":
      case "overview":
      case "envelope":
      case "authentication":
        return stage.id === "auth";

      case "explain":
      case "weights":
      case "nlp":
      case "heuristics":
        return stage.id === "explain";

      case "trace":
      case "hops":
      case "hop":
      case "relays":
        return stage.id === "trace";

      case "geolocate":
      case "geo":
      case "map":
      case "matrix":
        return stage.id === "geolocate";

      case "intel":
      case "correlate":
      case "domain":
      case "domains":
      case "urls":
        return stage.id === "intel";

      case "graph":
      case "visualize":
      case "topology":
      case "attack-graph":
        return stage.id === "graph";

      case "campaign":
      case "cluster":
      case "campaigns":
      case "dna":
        return stage.id === "campaign";

      case "timeline":
      case "events":
        return stage.id === "timeline";

      case "actions":
      case "cases":
      case "action":
      case "checklist":
        return stage.id === "actions";

      case "evidence":
      case "reports":
      case "report":
      case "vault":
      case "immutable":
        return stage.id === "evidence";

      default:
        return false;
    }
  };

  return (
    <div
      className={`w-full bg-white border border-[#E2E8F0] rounded-2xl p-2.5 shadow-sm overflow-x-auto select-none no-scrollbar transition-all ${className}`}
      role="navigation"
      aria-label="Forensic Pipeline Stepper"
    >
      <div className="flex items-center min-w-max gap-1">
        {STAGES.map((stage, idx) => {
          const isSelected = getIsSelected(stage, idx);
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex items-center">
              <button
                type="button"
                onClick={() => handleStageClick(stage)}
                title={`Stage ${idx + 1}: ${stage.name} — ${stage.description}`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isSelected
                    ? "bg-[#EEF2FF] text-[#4F46E5] shadow-xs ring-1 ring-[#C7D2FE]"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-extrabold transition-colors flex-shrink-0 ${
                    isSelected
                      ? "bg-[#4F46E5] text-white shadow-xs"
                      : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  {idx + 1}
                </div>
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-[#4F46E5]" : "text-[#64748B]"}`} />
                <span className="font-semibold">{stage.name}</span>
              </button>

              {idx < STAGES.length - 1 && (
                <div className="w-2.5 h-0.5 bg-[#E2E8F0] mx-0.5 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PipelineRibbon(props: PipelineRibbonProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-2.5 shadow-sm overflow-x-auto select-none no-scrollbar">
          <div className="flex items-center min-w-max gap-1">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div key={stage.id} className="flex items-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#64748B]">
                    <div className="w-5 h-5 rounded-lg bg-[#F1F5F9] text-[#64748B] flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <Icon className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>{stage.name}</span>
                  </div>
                  {idx < STAGES.length - 1 && (
                    <div className="w-2.5 h-0.5 bg-[#E2E8F0] mx-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      }
    >
      <RibbonInner {...props} />
    </Suspense>
  );
}
