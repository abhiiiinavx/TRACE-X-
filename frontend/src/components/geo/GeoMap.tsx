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
      <div className="h-72 w-full soc-card flex items-center justify-center text-xs text-[#7C8896] font-mono">
        Initializing Geolocation Matrix...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Attribution Standard Caveat Banner */}
      <div className="soc-card p-3 text-xs flex items-start gap-2.5 bg-[#161D26] border-[#1F2933]">
        <Info className="w-4 h-4 text-[#2DD4BF] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <span className="text-[#E6EBF0] font-semibold">Probabilistic Infrastructure Attribution Standard:</span>
          <p className="text-[11px] text-[#7C8896] mt-0.5">
            Geographic coordinates denote probable BGP routing hubs, hosting facilities, and intermediate relay infrastructure. 
            TRACE-X does not claim confirmed physical residence of individual threat actors.
          </p>
        </div>
      </div>

      {/* Map Display & IP Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Map Canvas */}
        <div className="lg:col-span-2 h-80 soc-card flex flex-col justify-between p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-semibold text-[#E6EBF0] flex items-center gap-1.5 font-mono">
              <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" strokeWidth={1.5} />
              <span>INFRASTRUCTURE PLOT</span>
            </span>
            <span className="text-[10px] bg-[#161D26] px-2 py-0.5 rounded text-[#7C8896] font-mono">
              {validIps.length} Nodes Mapped
            </span>
          </div>

          {/* Coordinates Grid */}
          <div className="relative w-full h-56 rounded bg-[#0B0F14] border border-[#1F2933] p-3 overflow-hidden">
            {/* World grid background lines */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(to right, #1F2933 1px, transparent 1px), linear-gradient(to bottom, #1F2933 1px, transparent 1px)",
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
                        isHighRisk ? "bg-[#E5484D]" : "bg-[#2DD4BF]"
                      }`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isHighRisk ? "bg-[#E5484D]" : "bg-[#2DD4BF]"
                      } border border-[#0B0F14]`}
                    ></span>
                  </div>

                  {/* Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#10161D] border border-[#1F2933] p-2.5 rounded text-[10px] text-[#E6EBF0] min-w-[180px] z-30 pointer-events-none shadow-lg">
                    <div className="font-mono font-bold text-[#2DD4BF]">{ip.ip}</div>
                    <div className="text-[#7C8896]">{ip.city}, {ip.country}</div>
                    <div className="text-[9px] text-[#7C8896] mt-0.5 truncate">{ip.asn_org}</div>
                    <div className="mt-1 pt-1 border-t border-[#1F2933] flex justify-between font-mono">
                      <span className="text-[#7C8896]">Attribution:</span>
                      <span className="text-[#E6EBF0] font-semibold">{ip.attribution_confidence || 75}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-[#7C8896] font-mono flex items-center justify-between">
            <span>Projection: WGS84 Geodetic</span>
            <span>BGP Routing Matrix</span>
          </div>
        </div>

        {/* IP Nodes List */}
        <div className="space-y-2 overflow-y-auto max-h-80">
          {validIps.map((ip, idx) => (
            <div key={idx} className="soc-card p-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-[#E6EBF0]">{ip.ip}</span>
                <span
                  className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                    (ip.risk_score || 0) > 70
                      ? "bg-[rgba(229,72,77,0.12)] text-[#E5484D]"
                      : "bg-[#161D26] text-[#7C8896]"
                  }`}
                >
                  {(ip.risk_score || 0) > 70 ? "HIGH RISK" : "ROUTING"}
                </span>
              </div>
              <div className="text-[#7C8896] text-[11px]">
                {ip.city ? `${ip.city}, ` : ""}{ip.country || "Unknown"}
              </div>
              <div className="text-[10px] text-[#7C8896] font-mono truncate">
                {ip.asn} • {ip.asn_org}
              </div>
              <div className="pt-1.5 border-t border-[#1F2933] flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#7C8896]">Attribution Conf:</span>
                <span className="font-semibold text-[#E6EBF0]">{ip.attribution_confidence || 75}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
