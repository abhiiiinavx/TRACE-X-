"use client";

import { useEffect, useRef, useState } from "react";
import {
  Network,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  X,
  Layers,
  Globe,
  Server,
  Mail,
  Link as LinkIcon,
  ShieldAlert
} from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  const filteredNodes = filterType === "ALL" 
    ? nodes 
    : nodes.filter((n) => n.type.toLowerCase() === filterType.toLowerCase());

  // Assign distinct theme colors per entity type
  const getNodeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "email":
        return { bg: "#ef4444", border: "#f87171", glow: "rgba(239,68,68,0.5)" };
      case "domain":
        return { bg: "#f59e0b", border: "#fbbf24", glow: "rgba(245,158,11,0.5)" };
      case "ip":
        return { bg: "#00f2fe", border: "#38bdf8", glow: "rgba(0,242,254,0.5)" };
      case "asn":
        return { bg: "#a855f7", border: "#c084fc", glow: "rgba(168,85,247,0.5)" };
      case "url":
        return { bg: "#ec4899", border: "#f472b6", glow: "rgba(236,72,153,0.5)" };
      case "campaign":
        return { bg: "#10b981", border: "#34d399", glow: "rgba(16,185,129,0.5)" };
      default:
        return { bg: "#64748b", border: "#94a3b8", glow: "rgba(100,116,139,0.5)" };
    }
  };

  return (
    <div className="relative w-full h-[520px] bg-[#080d1a] border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
      {/* Top Graph Control Toolbar */}
      <div className="p-3.5 bg-[#060913]/90 border-b border-slate-800 flex items-center justify-between z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white font-mono">TRACE-X ATTACK GRAPH MATRIX</span>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
            {filteredNodes.length} Entities • {edges.length} Edges
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[10px] font-mono">
          {["ALL", "EMAIL", "DOMAIN", "IP", "URL", "ASN", "CAMPAIGN"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                filterType === t
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-[#111a30] text-slate-400 hover:text-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Graph Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative cyber-grid p-6 flex items-center justify-center overflow-hidden select-none"
      >
        {/* Node-Link Layout Rendering */}
        <div className="relative w-full h-full flex flex-wrap items-center justify-around gap-6 p-4 overflow-auto">
          {filteredNodes.map((node) => {
            const colors = getNodeColor(node.type);
            const isSelected = selectedNode?.id === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{
                  borderColor: isSelected ? "#ffffff" : colors.border,
                  boxShadow: isSelected ? `0 0 25px ${colors.glow}` : `0 0 10px ${colors.glow}`,
                }}
                className={`p-3 rounded-xl border bg-[#0c1222]/90 backdrop-blur-md cursor-pointer transition-all transform hover:scale-105 active:scale-95 max-w-[220px] text-left flex items-start gap-2.5 ${
                  isSelected ? "ring-2 ring-white" : ""
                }`}
              >
                <div
                  style={{ backgroundColor: colors.bg }}
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                ></div>
                <div className="overflow-hidden">
                  <div className="text-[9px] uppercase font-mono font-bold tracking-wider" style={{ color: colors.border }}>
                    {node.type}
                  </div>
                  <div className="text-xs font-bold text-slate-100 truncate mt-0.5">
                    {node.label}
                  </div>
                  {node.data?.risk_score !== undefined && (
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Risk: <strong className="text-cyan-300">{node.data.risk_score}/100</strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Entity Inspection Drawer (Opens on Click) */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bottom-4 w-80 bg-[#0c1222]/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl p-4 shadow-2xl z-20 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right-4 duration-200">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold text-cyan-400">
                    {selectedNode.type} Entity Inspection
                  </span>
                  <h4 className="text-sm font-extrabold text-white truncate max-w-[220px]">
                    {selectedNode.label}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Data fields */}
              <div className="space-y-2 text-xs">
                {Object.entries(selectedNode.data || {}).map(([key, val]) => {
                  if (typeof val === "object" || val === null || val === undefined) return null;
                  return (
                    <div key={key} className="bg-[#111a30] p-2 rounded-lg border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">{key.replace(/_/g, " ")}</div>
                      <div className="font-semibold text-slate-100 font-mono break-all mt-0.5">
                        {String(val)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 mt-3 text-[10px] text-slate-500 font-mono">
              Entity ID: {selectedNode.id}
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="px-4 py-2.5 bg-[#060913] border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-300">Entity Types:</span>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Email</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Domain</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> IP Node</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span> ASN</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500"></span> URL</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Campaign</div>
        </div>
        <div className="font-mono text-cyan-400">Click any entity to inspect attributes</div>
      </div>
    </div>
  );
}
