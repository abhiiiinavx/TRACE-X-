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
        return { dot: "#EF4444", bg: "#FEF2F2", border: "#FEE2E2", text: "#DC2626" };
      case "domain":
        return { dot: "#F97316", bg: "#FFF7ED", border: "#FFEDD5", text: "#EA580C" };
      case "ip":
        return { dot: "#4F46E5", bg: "#EEF2FF", border: "#C7D2FE", text: "#4338CA" };
      case "asn":
        return { dot: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE", text: "#7C3AED" };
      case "url":
        return { dot: "#F59E0B", bg: "#FFFBEB", border: "#FEF3C7", text: "#D97706" };
      case "campaign":
        return { dot: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE", text: "#4F46E5" };
      default:
        return { dot: "#64748B", bg: "#F8FAFC", border: "#E2E8F0", text: "#334155" };
    }
  };

  return (
    <div className="relative w-full h-[520px] clean-card overflow-hidden flex flex-col shadow-sm">
      {/* Header Toolbar */}
      <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#4F46E5]" />
          <span className="text-xs font-bold text-[#0F172A]">Entity Matrix Canvas</span>
          <span className="text-[11px] text-[#64748B] font-medium">
            ({filteredNodes.length} Nodes, {edges.length} Edges)
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {["ALL", "EMAIL", "DOMAIN", "IP", "URL", "ASN", "CAMPAIGN"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === t
                  ? "bg-[#4F46E5] text-white font-bold shadow-sm"
                  : "bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative p-6 flex items-center justify-center overflow-hidden bg-white select-none">
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        ></div>

        <div className="relative w-full h-full flex flex-wrap items-center justify-around gap-4 p-4 overflow-auto">
          {filteredNodes.map((node) => {
            const colors = getNodeBadgeColor(node.type);
            const isSelected = selectedNode?.id === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all duration-150 transform hover:scale-105 max-w-[210px] text-left flex items-start gap-2.5 shadow-sm ${
                  isSelected
                    ? "border-[#4F46E5] ring-2 ring-[#EEF2FF] bg-white shadow-md"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1] bg-white"
                }`}
              >
                <span
                  style={{ backgroundColor: colors.dot }}
                  className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                ></span>
                <div className="overflow-hidden">
                  <div className="text-[10px] uppercase font-bold text-[#64748B]">
                    {node.type}
                  </div>
                  <div className="text-xs font-bold text-[#0F172A] truncate mt-0.5">
                    {node.label}
                  </div>
                  {node.data?.risk_score !== undefined && (
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      Score: <strong className="text-[#0F172A]">{node.data.risk_score}</strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Node Detail Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bottom-4 w-80 bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xl z-20 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#4F46E5]">
                    {selectedNode.type} Inspection
                  </span>
                  <h4 className="text-sm font-bold text-[#0F172A] truncate max-w-[200px]">
                    {selectedNode.label}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {Object.entries(selectedNode.data || {}).map(([key, val]) => {
                  if (typeof val === "object" || val === null || val === undefined) return null;
                  return (
                    <div key={key} className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] uppercase font-bold">{key.replace(/_/g, " ")}</div>
                      <div className="font-semibold text-xs text-[#0F172A] break-all mt-0.5">
                        {String(val)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] mt-3 text-[10px] text-[#94A3B8] font-mono">
              ID: {selectedNode.id}
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B] flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> Email</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F97316]"></span> Domain</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#4F46E5]"></span> IP Node</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span> ASN</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> URL</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#6366F1]"></span> Campaign</div>
        </div>
        <span className="font-medium">Click node to inspect forensic attributes</span>
      </div>
    </div>
  );
}
