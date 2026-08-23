"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dna,
  Layers,
  Globe,
  Server,
  Mail,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { listCampaigns, getCampaignDetail } from "@/lib/api";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCampaigns()
      .then((data) => {
        setCampaigns(data);
        if (data.length > 0) {
          getCampaignDetail(data[0].id).then(setSelectedCampaign);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelectCampaign = async (id: string) => {
    try {
      const detail = await getCampaignDetail(id);
      setSelectedCampaign(detail);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Dna className="w-6 h-6 text-purple-400" />
          <span>Campaign DNA & Multi-Signal Clustering</span>
        </h1>
        <p className="text-xs text-slate-400">
          Automated multi-vector threat clustering linking shared domains, ASNs, infrastructure, and payload signatures
        </p>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {campaigns.map((c) => {
          const isSelected = selectedCampaign?.id === c.id;
          return (
            <div
              key={c.id}
              onClick={() => handleSelectCampaign(c.id)}
              className={`cyber-card p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? "border-purple-500/80 bg-purple-950/20 shadow-lg shadow-purple-500/10"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-400 bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 rounded">
                  {c.primary_threat_type}
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {c.confidence}% Conf
                </span>
              </div>

              <h3 className="text-sm font-extrabold text-white line-clamp-1 mb-1">
                {c.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {c.description}
              </p>

              {/* Infrastructure Counter Badges */}
              <div className="grid grid-cols-4 gap-1 text-center bg-[#080d1a] p-2 rounded-xl border border-slate-800 text-[10px] font-mono">
                <div>
                  <span className="block font-bold text-white text-xs">{c.email_count || 1}</span>
                  <span className="text-slate-500">Emails</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-xs">{c.domain_count || 4}</span>
                  <span className="text-slate-500">Domains</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-xs">{c.ip_count || 3}</span>
                  <span className="text-slate-500">IPs</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-xs">{c.asn_count || 2}</span>
                  <span className="text-slate-500">ASNs</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Campaign Detailed DNA Panel */}
      {selectedCampaign && (
        <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-purple-400">
                Campaign Signature Vector
              </div>
              <h2 className="text-lg font-black text-white">{selectedCampaign.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-purple-950 text-purple-300 px-3 py-1 rounded-full border border-purple-500/40">
                Attribution Confidence: {selectedCampaign.confidence}%
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedCampaign.description}
          </p>

          {/* Member Incident Emails Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase font-mono text-cyan-400 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Correlated Member Incidents ({selectedCampaign.member_emails?.length || 0})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#080d1a] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 font-mono">
                  <tr>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Sender Envelope</th>
                    <th className="px-4 py-3">Similarity</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedCampaign.member_emails?.map((m: any) => (
                    <tr key={m.email_id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-bold text-white">{m.subject}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{m.from_addr}</td>
                      <td className="px-4 py-3 font-mono text-purple-300 font-bold">
                        {Math.round((m.similarity_score || 0.9) * 100)}%
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30">
                          {m.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/analyze?id=${m.email_id}`}
                          className="text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
