"use client";

import { useEffect, useState } from "react";
import { Network } from "lucide-react";
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
      <div className="border-b border-[#1F2933] pb-4">
        <h1 className="text-xl font-semibold text-[#E6EBF0] tracking-tight">
          Multi-Entity Threat Attack Graph
        </h1>
        <p className="text-xs text-[#7C8896] mt-0.5">
          Consolidated entity-relationship matrix linking emails, domains, IPs, ASNs, and campaign clusters.
        </p>
      </div>

      <AttackGraphView graphData={graphData || { nodes: [], edges: [] }} />
    </div>
  );
}
