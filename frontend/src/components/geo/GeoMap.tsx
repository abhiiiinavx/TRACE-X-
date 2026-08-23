"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { ShieldAlert, Info, MapPin } from "lucide-react";

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
      <div className="h-80 w-full bg-[#090e1a] rounded-xl flex items-center justify-center text-xs text-slate-500 font-mono">
        Initializing Geolocation Matrix...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Attribution Standard Caveat Banner */}
      <div className="bg-blue-950/40 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-cyan-300 font-semibold">Probabilistic Infrastructure Attribution Standard:</strong>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Geographic coordinates denote probable BGP routing hubs, hosting providers, and intermediate relay infrastructure. 
            TRACE-X does not claim confirmed physical residence of individual threat actors.
          </p>
        </div>
      </div>

      {/* Map Display & IP Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interactive Simulated Map Canvas / Visualizer */}
        <div className="lg:col-span-2 h-96 bg-[#080d1a] border border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-between p-4 cyber-dots">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>GLOBAL INFRASTRUCTURE PLOT</span>
            </span>
            <span className="text-[10px] bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
              {validIps.length} Nodes Mapped
            </span>
          </div>

          {/* Graphical Nodes on World Coordinates Canvas */}
          <div className="relative w-full h-64 border border-slate-800/60 rounded-lg bg-[#060913]/90 p-3 overflow-hidden">
            {/* World Grid Lines */}
            <div className="absolute inset-0 cyber-grid opacity-50 pointer-events-none"></div>

            {validIps.map((ip, idx) => {
              // Normalize lat/lng to percentage on canvas
              const topPercent = Math.max(10, Math.min(85, ((90 - (ip.lat || 0)) / 180) * 100));
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
                      className={`animate-ping absolute inline-flex h-6 w-6 rounded-full opacity-75 ${
                        isHighRisk ? "bg-red-500" : "bg-cyan-500"
                      }`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-3 w-3 ${
                        isHighRisk ? "bg-red-500" : "bg-cyan-400"
                      } border-2 border-white shadow-md`}
                    ></span>
                  </div>

                  {/* Tooltip Card */}
                  <div className="hidden group-hover:block absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#0c1222] border border-cyan-500/50 p-2.5 rounded-lg text-[10px] text-white shadow-xl min-w-[200px] z-30 pointer-events-none">
                    <div className="font-bold text-cyan-300 font-mono">{ip.ip}</div>
                    <div className="text-slate-300">{ip.city}, {ip.country}</div>
                    <div className="text-slate-400 text-[9px] mt-1">{ip.asn_org}</div>
                    <div className="mt-1 pt-1 border-t border-slate-800 flex justify-between font-mono">
                      <span className="text-cyan-400">Attribution Conf:</span>
                      <span className="font-bold">{ip.attribution_confidence || 75}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>Projection: WGS84 Geodetic</span>
            <span>OpenStreetMap / MaxMind Telemetry Engine</span>
          </div>
        </div>

        {/* IP Nodes Inspector List */}
        <div className="space-y-2.5 overflow-y-auto max-h-96">
          {validIps.map((ip, idx) => (
            <div key={idx} className="cyber-card p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-cyan-300">{ip.ip}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                    (ip.risk_score || 0) > 70
                      ? "bg-red-950/80 border border-red-500/40 text-red-300"
                      : "bg-cyan-950/80 border border-cyan-500/40 text-cyan-300"
                  }`}
                >
                  {(ip.risk_score || 0) > 70 ? "HIGH RISK INFRA" : "ROUTING NODE"}
                </span>
              </div>
              <div className="text-slate-300 font-medium">
                {ip.city ? `${ip.city}, ` : ""}{ip.country || "Unknown Location"}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {ip.asn} — {ip.asn_org}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Attribution Confidence:</span>
                <span className="font-bold text-cyan-400">{ip.attribution_confidence || 75}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
