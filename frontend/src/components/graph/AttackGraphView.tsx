"use client";

import { useEffect, useRef, useState } from "react";
import cytoscape, { Core } from "cytoscape";
import { Network, X, Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

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
  const cyRef = useRef<Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  const filteredNodes = filterType === "ALL"
    ? nodes
    : nodes.filter((n) => n.type.toLowerCase() === filterType.toLowerCase());

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = edges.filter(
    (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
  );

  const getNodeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "email":
        return "#EF4444";
      case "domain":
        return "#F97316";
      case "ip":
        return "#4F46E5";
      case "asn":
        return "#8B5CF6";
      case "url":
        return "#F59E0B";
      case "campaign":
        return "#6366F1";
      case "attachment":
        return "#EC4899";
      default:
        return "#64748B";
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing instance
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    const elements = [
      ...filteredNodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label.length > 22 ? n.label.substring(0, 20) + "..." : n.label,
          fullLabel: n.label,
          type: n.type,
          nodeColor: getNodeColor(n.type),
          raw: n.data,
        },
      })),
      ...filteredEdges.map((e, idx) => ({
        data: {
          id: e.id || `edge-${idx}`,
          source: e.source,
          target: e.target,
          label: e.label || "",
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      boxSelectionEnabled: false,
      autounselectify: false,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "data(nodeColor)",
            label: "data(label)",
            "font-size": "11px",
            "font-weight": "bold",
            "font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            color: "#0F172A",
            "text-valign": "bottom",
            "text-margin-y": 6,
            "text-background-color": "#ffffff",
            "text-background-opacity": 0.85,
            "text-background-padding": "3px",
            "text-background-shape": "roundrectangle",
            width: 32,
            height: 32,
            "border-width": 3,
            "border-color": "#ffffff",
            "overlay-padding": 4,
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#CBD5E1",
            "target-arrow-color": "#94A3B8",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "arrow-scale": 1.2,
            label: "data(label)",
            "font-size": "9px",
            "font-family": "monospace",
            color: "#64748B",
            "text-background-color": "#F8FAFC",
            "text-background-opacity": 0.9,
            "text-background-padding": "2px",
            "text-background-shape": "roundrectangle",
            "text-rotation": "autorotate",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 4,
            "border-color": "#4F46E5",
            width: 38,
            height: 38,
          },
        },
        {
          selector: ".highlighted",
          style: {
            "line-color": "#4F46E5",
            "target-arrow-color": "#4F46E5",
            width: 3,
          },
        },
        {
          selector: ".dimmed",
          style: {
            opacity: 0.25,
          },
        },
      ],
      layout: {
        name: "cose",
        animate: false,
        padding: 50,
        nodeOverlap: 20,
        idealEdgeLength: () => 100,
        nodeRepulsion: () => 400000,
      },
    });

    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      const nodeObj = filteredNodes.find((n) => n.id === node.id());
      if (nodeObj) {
        setSelectedNode(nodeObj);
      }

      // Highlight neighborhood
      cy.elements().removeClass("highlighted dimmed");
      const neighborhood = node.neighborhood().add(node);
      cy.elements().not(neighborhood).addClass("dimmed");
      neighborhood.addClass("highlighted");
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        cy.elements().removeClass("highlighted dimmed");
      }
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [filteredNodes.length, filteredEdges.length, filterType]);

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 30);
    }
  };

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.25);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  };

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.layout({ name: "cose", padding: 50 }).run();
      cyRef.current.fit(undefined, 30);
    }
  };

  return (
    <div className="relative w-full h-[540px] clean-card overflow-hidden flex flex-col shadow-sm">
      {/* Header Toolbar */}
      <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#4F46E5]" />
          <span className="text-xs font-bold text-[#0F172A]">Interactive Entity Matrix Graph</span>
          <span className="text-[11px] text-[#64748B] font-medium">
            ({filteredNodes.length} Nodes, {filteredEdges.length} Edges)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom & Fit Controls */}
          <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] p-1 rounded-xl shadow-2xs">
            <button
              onClick={handleZoomIn}
              className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFit}
              className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
              title="Fit Graph to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
              title="Reset Graph Layout"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-xs font-medium">
            {["ALL", "EMAIL", "DOMAIN", "IP", "URL", "ASN", "CAMPAIGN"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
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
      </div>

      {/* Main Cytoscape Canvas */}
      <div className="flex-1 relative overflow-hidden bg-white select-none">
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none z-0"
          style={{
            backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        <div ref={containerRef} className="w-full h-full relative z-10" />

        {/* Node Detail Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bottom-4 w-80 bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xl z-30 flex flex-col justify-between overflow-y-auto">
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
                      <div className="text-[10px] text-[#64748B] uppercase font-bold">
                        {key.replace(/_/g, " ")}
                      </div>
                      <div className="font-semibold text-xs text-[#0F172A] break-all mt-0.5">
                        {String(val)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] mt-3 text-[10px] text-[#94A3B8] font-mono">
              Entity ID: {selectedNode.id}
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B] flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span> Email
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span> Domain
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]"></span> IP Node
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]"></span> ASN
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> URL
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]"></span> Campaign
          </div>
        </div>
        <span className="font-medium">Interactive Cytoscape Matrix • Drag nodes or click to inspect</span>
      </div>
    </div>
  );
}
