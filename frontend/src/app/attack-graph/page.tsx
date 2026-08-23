"use client";

import { useEffect, useState } from "react";
import { Network, Share2, Info, Sparkles } from "lucide-react";
import { getGlobalGraph } from "@/lib/api";
import AttackGraphView from "@/components/graph/AttackGraphView";

export default function AttackGraphPage() {
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGlobalGraph()
      .then(setGraphData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-cyan-400" />
            <span>Multi-Entity Threat Attack Graph</span>
          </h1>
          <p className="text-xs text-slate-400">
            Interactive visual correlation of emails, lookalike domains, resolved IPs, autonomous systems, and campaign clusters
          </p>
        </div>
      </div>

      <div className="cyber-card p-2 rounded-2xl border border-slate-800">
        <AttackGraphView graphData={graphData || { nodes: [], edges: [] }} />
      </div>
    </div>
  );
}
