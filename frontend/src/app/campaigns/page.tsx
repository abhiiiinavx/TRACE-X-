"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, Mail, ArrowRight, CheckCircle2, Dna } from "lucide-react";
import { listCampaigns, getCampaignDetail } from "@/lib/api";
import PipelineRibbon from "@/components/layout/PipelineRibbon";

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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
          Campaign DNA — Multi-Signal Correlation
        </h1>
        <p className="text-xs md:text-sm text-[#64748B] mt-1">
          Deterministic correlation linking subject regex patterns, lookalike domains, ASN infrastructure, and payload hash signatures
        </p>
      </div>

      {/* Interactive Pipeline Ribbon Stepper */}
      <PipelineRibbon activeStage="campaign" />

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {campaigns.map((c) => {
          const isSelected = selectedCampaign?.id === c.id;
          return (
            <div
              key={c.id}
              onClick={() => handleSelectCampaign(c.id)}
              className={`clean-card p-5 cursor-pointer transition-all card-hover ${
                isSelected
                  ? "border-[#4F46E5] ring-2 ring-[#EEF2FF] bg-white shadow-md shadow-indigo-50"
                  : "hover:border-[#CBD5E1]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#8B5CF6] uppercase">
                  {c.primary_threat_type}
                </span>
                <span className="text-xs font-semibold text-[#16A34A] bg-[#F0FDF4] px-2.5 py-0.5 rounded-full">
                  {c.confidence}% Conf
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#0F172A] line-clamp-1 mb-1">
                {c.name}
              </h3>
              <p className="text-xs text-[#64748B] line-clamp-2 mb-4 leading-relaxed">
                {c.description}
              </p>

              <div className="grid grid-cols-4 gap-2 text-center bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0] text-xs">
                <div>
                  <span className="block font-bold text-[#0F172A] text-sm">{c.email_count || 0}</span>
                  <span className="text-[10px] text-[#64748B]">Emails</span>
                </div>
                <div>
                  <span className="block font-bold text-[#0F172A] text-sm">{c.domain_count || 0}</span>
                  <span className="text-[10px] text-[#64748B]">Domains</span>
                </div>
                <div>
                  <span className="block font-bold text-[#0F172A] text-sm">{c.ip_count || 0}</span>
                  <span className="text-[10px] text-[#64748B]">IPs</span>
                </div>
                <div>
                  <span className="block font-bold text-[#0F172A] text-sm">{c.asn_count || 0}</span>
                  <span className="text-[10px] text-[#64748B]">ASNs</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Campaign Detail */}
      {selectedCampaign && (
        <div className="clean-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
            <div>
              <div className="text-xs font-bold uppercase text-[#8B5CF6]">
                Campaign Signature Vector
              </div>
              <h2 className="text-base font-bold text-[#0F172A] mt-0.5">{selectedCampaign.name}</h2>
            </div>
            <span className="text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] px-3.5 py-1 rounded-full self-start sm:self-auto">
              Attribution Confidence: {selectedCampaign.confidence}%
            </span>
          </div>

          <p className="text-xs md:text-sm text-[#475569] leading-relaxed">
            {selectedCampaign.description}
          </p>

          {/* Member Incident Emails Table */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#4F46E5]" />
              <span>Correlated Incidents ({selectedCampaign.member_emails?.length || 0})</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
              <table className="w-full text-left text-xs text-[#64748B]">
                <thead className="bg-[#F8FAFC] uppercase text-[10px] font-bold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Sender</th>
                    <th className="px-4 py-3">Similarity</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {selectedCampaign.member_emails?.map((m: any) => (
                    <tr key={m.email_id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 font-bold text-[#0F172A]">{m.subject}</td>
                      <td className="px-4 py-3 font-mono text-[#334155]">{m.from_addr}</td>
                      <td className="px-4 py-3 font-bold text-[#8B5CF6]">
                        {Math.round((m.similarity_score || 0.9) * 100)}%
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#EF4444]">
                          {m.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        <Link
                          href={`/analyze?id=${m.email_id}`}
                          className="text-[#4F46E5] hover:underline inline-flex items-center gap-1 text-xs font-bold"
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
