"use client";

import { useEffect, useState } from "react";
import { Info, MapPin } from "lucide-react";

interface GeoMapProps {
  ips: Array<{
    ip: string;
    country?: string;
    city?: string;
    lat?: number;
    lng?: number;
    asn?: string;
    asn_org?: string;
    is_vpn_proxy_tor?: boolean;
    attribution_confidence?: number;
    risk_score?: number;
  }>;
}

export default function GeoMap({ ips }: GeoMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const validIps = ips.filter((ip) => ip.lat && ip.lng && ip.lat !== 0 && ip.lng !== 0);

  if (!isMounted) {
    return (
      <div className="h-72 w-full clean-card flex items-center justify-center text-xs text-[#64748B] font-medium">
        Initializing Geolocation Matrix...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Attribution Standard Caveat Banner */}
      <div className="clean-card p-4 text-xs flex items-start gap-3 bg-[#F8FAFC]">
        <Info className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-[#0F172A] font-bold">Probabilistic Infrastructure Attribution Standard:</span>
          <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
            Geographic coordinates denote probable BGP routing hubs, hosting facilities, and intermediate relay infrastructure. 
            TRACE-X does not claim confirmed physical residence of individual threat actors.
          </p>
        </div>
      </div>

      {/* Map Display & IP Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Canvas */}
        <div className="lg:col-span-2 h-88 clean-card flex flex-col justify-between p-4 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#4F46E5]" />
              <span>Infrastructure Plot Canvas</span>
            </span>
            <span className="text-xs font-bold bg-[#EEF2FF] text-[#4F46E5] px-2.5 py-0.5 rounded-full">
              {validIps.length} Nodes Mapped
            </span>
          </div>

          {/* Coordinates Grid */}
          <div className="relative w-full h-64 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 overflow-hidden">
            {/* World grid background lines */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
                backgroundSize: "24px 24px"
              }}
            ></div>

            {validIps.map((ip, idx) => {
              const topPercent = Math.max(12, Math.min(85, ((90 - (ip.lat || 0)) / 180) * 100));
              const leftPercent = Math.max(10, Math.min(90, (((ip.lng || 0) + 180) / 360) * 100));
              const isHighRisk = (ip.risk_score || 0) > 70;

              return (
                <div
                  key={idx}
                  style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                >
                  <div className="relative flex items-center justify-center">
                    <span
                      className={`animate-ping absolute inline-flex h-4 w-4 rounded-full opacity-60 ${
                        isHighRisk ? "bg-[#EF4444]" : "bg-[#4F46E5]"
                      }`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-3 w-3 ${
                        isHighRisk ? "bg-[#EF4444]" : "bg-[#4F46E5]"
                      } border-2 border-white shadow-sm`}
                    ></span>
                  </div>

                  {/* Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-5 left-1/2 -translate-x-1/2 bg-white border border-[#E2E8F0] p-3 rounded-xl text-xs text-[#0F172A] min-w-[200px] z-30 pointer-events-none shadow-xl">
                    <div className="font-mono font-bold text-[#4F46E5]">{ip.ip}</div>
                    <div className="text-[#64748B] text-[11px] mt-0.5">{ip.city}, {ip.country}</div>
                    <div className="text-[10px] text-[#94A3B8] mt-0.5 truncate">{ip.asn_org}</div>
                    <div className="mt-2 pt-1.5 border-t border-[#F1F5F9] flex justify-between font-semibold">
                      <span className="text-[#64748B]">Confidence:</span>
                      <span className="text-[#16A34A]">{ip.attribution_confidence || 75}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-[#64748B] flex items-center justify-between font-medium">
            <span>Projection: WGS84 Geodetic</span>
            <span>BGP Routing Matrix</span>
          </div>
        </div>

        {/* IP Nodes List */}
        <div className="space-y-2.5 overflow-y-auto max-h-88">
          {validIps.map((ip, idx) => (
            <div key={idx} className="clean-card p-3.5 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#0F172A]">{ip.ip}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    (ip.risk_score || 0) > 70
                      ? "bg-[#FEF2F2] text-[#EF4444]"
                      : "bg-[#F0FDF4] text-[#16A34A]"
                  }`}
                >
                  {(ip.risk_score || 0) > 70 ? "HIGH RISK" : "ROUTING"}
                </span>
              </div>
              <div className="text-[#64748B] text-xs">
                {ip.city ? `${ip.city}, ` : ""}{ip.country || "Unknown"}
              </div>
              <div className="text-[11px] text-[#94A3B8] font-mono truncate">
                {ip.asn} • {ip.asn_org}
              </div>
              <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Attribution Confidence:</span>
                <span className="font-bold text-[#0F172A]">{ip.attribution_confidence || 75}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
