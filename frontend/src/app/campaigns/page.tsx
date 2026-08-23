"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dna, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
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
    <div className="space-y-5">
      <div className="border-b border-[#1F2933] pb-4">
        <h1 className="text-xl font-semibold text-[#E6EBF0] tracking-tight">
          Campaign DNA & Multi-Signal Clustering
        </h1>
        <p className="text-xs text-[#7C8896] mt-0.5">
          Correlated threat clusters linking shared domains, ASNs, infrastructure, and payload signatures.
        </p>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {campaigns.map((c) => {
          const isSelected = selectedCampaign?.id === c.id;
          return (
            <div
              key={c.id}
              onClick={() => handleSelectCampaign(c.id)}
              className={`soc-card p-4 cursor-pointer transition-colors ${
                isSelected
                  ? "border-[#2DD4BF] bg-[#161D26]"
                  : "hover:border-[#7C8896]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#A78BFA] uppercase">
                  {c.primary_threat_type}
                </span>
                <span className="text-xs font-mono text-[#7C8896]">
                  {c.confidence}% Conf
                </span>
              </div>

              <h3 className="text-xs font-bold text-[#E6EBF0] line-clamp-1 mb-1">
                {c.name}
              </h3>
              <p className="text-xs text-[#7C8896] line-clamp-2 mb-3 leading-relaxed">
                {c.description}
              </p>

              <div className="grid grid-cols-4 gap-1 text-center bg-[#0B0F14] p-1.5 rounded border border-[#1F2933] text-[10px] font-mono">
                <div>
                  <span className="block font-bold text-[#E6EBF0] text-xs">{c.email_count || 1}</span>
                  <span className="text-[#7C8896]">Emails</span>
                </div>
                <div>
                  <span className="block font-bold text-[#E6EBF0] text-xs">{c.domain_count || 4}</span>
                  <span className="text-[#7C8896]">Domains</span>
                </div>
                <div>
                  <span className="block font-bold text-[#E6EBF0] text-xs">{c.ip_count || 3}</span>
                  <span className="text-[#7C8896]">IPs</span>
                </div>
                <div>
                  <span className="block font-bold text-[#E6EBF0] text-xs">{c.asn_count || 2}</span>
                  <span className="text-[#7C8896]">ASNs</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Campaign Detailed DNA Panel */}
      {selectedCampaign && (
        <div className="soc-card p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F2933] pb-3">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#A78BFA]">
                Campaign Signature Vector
              </div>
              <h2 className="text-sm font-bold text-[#E6EBF0]">{selectedCampaign.name}</h2>
            </div>
            <span className="text-xs font-mono text-[#E6EBF0] bg-[#161D26] px-2.5 py-1 rounded">
              Attribution: {selectedCampaign.confidence}%
            </span>
          </div>

          <p className="text-xs text-[#7C8896] leading-relaxed">
            {selectedCampaign.description}
          </p>

          {/* Member Incident Emails Table */}
          <div className="space-y-2.5">
            <div className="soc-label flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Correlated Incidents ({selectedCampaign.member_emails?.length || 0})</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#7C8896]">
                <thead className="bg-[#0B0F14] uppercase text-[10px] font-semibold border-b border-[#1F2933] font-mono">
                  <tr>
                    <th className="px-3 py-2">Subject</th>
                    <th className="px-3 py-2">Sender</th>
                    <th className="px-3 py-2">Similarity</th>
                    <th className="px-3 py-2">Severity</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2933]">
                  {selectedCampaign.member_emails?.map((m: any) => (
                    <tr key={m.email_id} className="hover:bg-[#161D26]/50">
                      <td className="px-3 py-2.5 font-medium text-[#E6EBF0]">{m.subject}</td>
                      <td className="px-3 py-2.5 font-mono text-[#E6EBF0]">{m.from_addr}</td>
                      <td className="px-3 py-2.5 font-mono text-[#A78BFA]">
                        {Math.round((m.similarity_score || 0.9) * 100)}%
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[rgba(229,72,77,0.12)] text-[#E5484D]">
                          {m.severity}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">
                        <Link
                          href={`/analyze?id=${m.email_id}`}
                          className="text-[#2DD4BF] hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
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
