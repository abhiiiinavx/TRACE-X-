"use client";

interface PipelineRibbonProps {
  activeStage?: string;
  onSelectStage?: (stage: string) => void;
}

const STAGES = [
  { id: "detect", name: "Detect" },
  { id: "explain", name: "Explain" },
  { id: "trace", name: "Trace" },
  { id: "geolocate", name: "Geolocate" },
  { id: "correlate", name: "Correlate" },
  { id: "cluster", name: "Cluster" },
  { id: "visualize", name: "Visualize" },
  { id: "investigate", name: "Investigate" },
  { id: "report", name: "Report" },
];

export default function PipelineRibbon({ activeStage, onSelectStage }: PipelineRibbonProps) {
  return (
    <div className="w-full bg-[#0B0F14] border-b border-[#1F2933] px-6 py-2 overflow-x-auto select-none">
      <div className="flex items-center justify-between min-w-[700px] gap-1">
        {STAGES.map((stage, idx) => {
          const isActive = activeStage?.toLowerCase() === stage.id;
          return (
            <div key={stage.id} className="flex items-center flex-1">
              <button
                onClick={() => onSelectStage && onSelectStage(stage.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors cursor-pointer w-full ${
                  isActive
                    ? "bg-[#161D26] text-[#2DD4BF] font-semibold"
                    : "text-[#7C8896] hover:text-[#E6EBF0] hover:bg-[#10161D]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold ${
                    isActive
                      ? "bg-[#2DD4BF] text-[#0B0F14]"
                      : "bg-[#161D26] text-[#7C8896]"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate">{stage.name}</span>
              </button>
              {idx < STAGES.length - 1 && (
                <span className="text-[#1F2933] text-xs px-1 select-none">/</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
