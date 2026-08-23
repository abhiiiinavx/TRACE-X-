"use client";

import { useState } from "react";
import { Network, X } from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  type: string;
  data: Record<string, any>;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  weight?: number;
}

interface AttackGraphViewProps {
  graphData: {
    nodes: NodeData[];
    edges: EdgeData[];
  };
}

export default function AttackGraphView({ graphData }: AttackGraphViewProps) {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  const filteredNodes = filterType === "ALL" 
    ? nodes 
    : nodes.filter((n) => n.type.toLowerCase() === filterType.toLowerCase());

  const getNodeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "email":
        return { dot: "#E5484D", bg: "rgba(229,72,77,0.12)", border: "rgba(229,72,77,0.3)" };
      case "domain":
        return { dot: "#F0883E", bg: "rgba(240,136,62,0.12)", border: "rgba(240,136,62,0.3)" };
      case "ip":
        return { dot: "#2DD4BF", bg: "rgba(45,212,191,0.12)", border: "rgba(45,212,191,0.3)" };
      case "asn":
        return { dot: "#A78BFA", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)" };
      case "url":
        return { dot: "#E8C547", bg: "rgba(232,197,71,0.12)", border: "rgba(232,197,71,0.3)" };
      case "campaign":
        return { dot: "#34C795", bg: "rgba(52,199,149,0.12)", border: "rgba(52,199,149,0.3)" };
      default:
        return { dot: "#7C8896", bg: "#161D26", border: "#1F2933" };
    }
  };

  return (
    <div className="relative w-full h-[460px] soc-card overflow-hidden flex flex-col">
      {/* Header Toolbar */}
      <div className="p-3 bg-[#0B0F14] border-b border-[#1F2933] flex items-center justify-between z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#2DD4BF]" strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[#E6EBF0] font-mono">Entity Attack Graph</span>
          <span className="text-[10px] text-[#7C8896] font-mono">
            ({filteredNodes.length} Nodes, {edges.length} Edges)
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[10px] font-mono">
          {["ALL", "EMAIL", "DOMAIN", "IP", "URL", "ASN", "CAMPAIGN"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                filterType === t
                  ? "bg-[#161D26] text-[#2DD4BF] font-semibold"
                  : "text-[#7C8896] hover:text-[#E6EBF0]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative p-4 flex items-center justify-center overflow-hidden bg-[#0B0F14] select-none">
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(to right, #1F2933 1px, transparent 1px), linear-gradient(to bottom, #1F2933 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        ></div>

        <div className="relative w-full h-full flex flex-wrap items-center justify-around gap-4 p-2 overflow-auto">
          {filteredNodes.map((node) => {
            const colors = getNodeBadgeColor(node.type);
            const isSelected = selectedNode?.id === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-2.5 rounded-md border bg-[#10161D] cursor-pointer transition-colors max-w-[200px] text-left flex items-start gap-2 ${
                  isSelected ? "border-[#2DD4BF] ring-1 ring-[#2DD4BF]" : "border-[#1F2933] hover:border-[#7C8896]"
                }`}
              >
                <span
                  style={{ backgroundColor: colors.dot }}
                  className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                ></span>
                <div className="overflow-hidden">
                  <div className="text-[9px] uppercase font-mono font-medium text-[#7C8896]">
                    {node.type}
                  </div>
                  <div className="text-xs font-mono font-semibold text-[#E6EBF0] truncate mt-0.5">
                    {node.label}
                  </div>
                  {node.data?.risk_score !== undefined && (
                    <div className="text-[10px] font-mono text-[#7C8896] mt-0.5">
                      Score: <strong className="text-[#E6EBF0]">{node.data.risk_score}</strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Node Detail Drawer */}
        {selectedNode && (
          <div className="absolute top-3 right-3 bottom-3 w-72 bg-[#10161D] border border-[#1F2933] rounded-md p-3.5 shadow-xl z-20 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-[#1F2933] pb-2 mb-2.5">
                <div>
                  <span className="text-[9px] uppercase font-mono text-[#2DD4BF]">
                    {selectedNode.type} Inspection
                  </span>
                  <h4 className="text-xs font-mono font-bold text-[#E6EBF0] truncate max-w-[180px]">
                    {selectedNode.label}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-[#7C8896] hover:text-[#E6EBF0] p-1 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                {Object.entries(selectedNode.data || {}).map(([key, val]) => {
                  if (typeof val === "object" || val === null || val === undefined) return null;
                  return (
                    <div key={key} className="bg-[#0B0F14] p-2 rounded border border-[#1F2933]">
                      <div className="text-[9px] text-[#7C8896] uppercase font-mono">{key.replace(/_/g, " ")}</div>
                      <div className="font-mono text-xs text-[#E6EBF0] break-all mt-0.5">
                        {String(val)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-[#1F2933] mt-2 text-[9px] text-[#7C8896] font-mono">
              ID: {selectedNode.id}
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="px-3 py-2 bg-[#0B0F14] border-t border-[#1F2933] flex items-center justify-between text-[10px] text-[#7C8896] flex-wrap gap-2 font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]"></span> Email</div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F0883E]"></span> Domain</div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"></span> IP Node</div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]"></span> ASN</div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#E8C547]"></span> URL</div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#34C795]"></span> Campaign</div>
        </div>
        <span>Click node to inspect attributes</span>
      </div>
    </div>
  );
}
