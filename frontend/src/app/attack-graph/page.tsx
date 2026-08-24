"use client";

import { useEffect, useState } from "react";
import { getGlobalGraph } from "@/lib/api";
import AttackGraphView from "@/components/graph/AttackGraphView";
import PipelineRibbon from "@/components/layout/PipelineRibbon";

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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
          Attack Graph Matrix
        </h1>
        <p className="text-xs md:text-sm text-[#64748B] mt-1">
          Interactive entity-relationship graph connecting emails, lookalike domains, IPs, and campaign nodes
        </p>
      </div>

      {/* Interactive Pipeline Ribbon Stepper */}
      <PipelineRibbon activeStage="graph" />

      <AttackGraphView graphData={graphData || { nodes: [], edges: [] }} />
    </div>
  );
}
