"use client";

import { useEffect, useRef, useState } from "react";
import { Info, MapPin, Globe, ShieldAlert } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface GeoMapProps {
  ips: Array<{
    ip: string;
    country?: string;
    city?: string;
    lat?: number;
    lng?: number;
    asn?: string;
    asn_org?: string;
    isp?: string;
    hosting_provider?: string;
    is_vpn_proxy_tor?: boolean;
    attribution_confidence?: number;
    risk_score?: number;
  }>;
}

export default function GeoMap({ ips }: GeoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedIp, setSelectedIp] = useState<any>(null);

  const validIps = (ips || []).filter(
    (ip) =>
      typeof ip.lat === "number" &&
      typeof ip.lng === "number" &&
      !isNaN(ip.lat) &&
      !isNaN(ip.lng) &&
      (ip.lat !== 0 || ip.lng !== 0)
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !mapContainerRef.current) return;

    let isSubscribed = true;

    // Dynamically import Leaflet client-side
    import("leaflet").then((L) => {
      if (!isSubscribed || !mapContainerRef.current) return;

      // Clean up previous map instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map
      const initialLat = validIps.length > 0 ? (validIps[0].lat as number) : 20.0;
      const initialLng = validIps.length > 0 ? (validIps[0].lng as number) : 0.0;
      const initialZoom = validIps.length > 0 ? 3 : 2;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: true,
        attributionControl: false,
      });

      // Carto Light tiles matching the clean design system
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      const markerBounds: [number, number][] = [];

      validIps.forEach((node) => {
        const isHigh = (node.risk_score || 0) > 70;
        const color = isHigh ? "#EF4444" : "#4F46E5";

        const customIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
              <span style="position: absolute; width: 22px; height: 22px; border-radius: 9999px; background-color: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <span style="position: relative; width: 12px; height: 12px; border-radius: 9999px; background-color: ${color}; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></span>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -12],
        });

        const popupContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #0F172A; min-width: 220px; line-height: 1.4;">
            <div style="font-family: monospace; font-weight: 700; font-size: 13px; color: #4F46E5; margin-bottom: 2px;">
              ${node.ip}
            </div>
            <div style="color: #64748B; font-weight: 600; margin-bottom: 6px;">
              ${node.city ? `${node.city}, ` : ""}${node.country || "Unknown Region"}
            </div>
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 8px; margin-bottom: 6px;">
              <div style="color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: 700;">Network / ASN</div>
              <div style="font-weight: 600; color: #0F172A; word-break: break-all;">${node.asn || "AS-Unknown"} ${node.asn_org || ""}</div>
              ${node.isp || node.hosting_provider ? `<div style="color: #64748B; font-size: 10px; margin-top: 2px;">Hosting: ${node.hosting_provider || node.isp}</div>` : ""}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-weight: 600;">
              <span>Attribution Confidence:</span>
              <span style="color: #16A34A; font-weight: 700;">${node.attribution_confidence || 75}%</span>
            </div>
            <div style="font-size: 9.5px; color: #94A3B8; border-top: 1px solid #F1F5F9; padding-top: 4px; line-height: 1.3;">
              Coordinates represent probable network infrastructure and do not establish the physical location of an attacker.
            </div>
          </div>
        `;

        const marker = L.marker([node.lat as number, node.lng as number], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);

        marker.on("click", () => {
          setSelectedIp(node);
        });

        markerBounds.push([node.lat as number, node.lng as number]);
      });

      if (markerBounds.length > 1) {
        map.fitBounds(markerBounds, { padding: [30, 30], maxZoom: 8 });
      } else if (markerBounds.length === 1) {
        map.setView(markerBounds[0], 5);
      }

      mapInstanceRef.current = map;
    });

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMounted, ips]);

  if (!isMounted) {
    return (
      <div className="h-72 w-full clean-card flex items-center justify-center text-xs text-[#64748B] font-medium">
        Initializing Geolocation Matrix...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Probabilistic Attribution Standard Notice */}
      <div className="clean-card p-4 text-xs flex items-start gap-3 bg-[#F8FAFC]">
        <Info className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-[#0F172A] font-bold">Probabilistic Infrastructure Attribution:</span>
          <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
            Coordinates represent probable network/hosting infrastructure and do not establish the physical location or identity of an attacker. BGP routing hubs, hosting providers, and intermediate relay infrastructure are derived from deterministic network telemetry.
          </p>
        </div>
      </div>

      {/* Map Display & IP Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Canvas */}
        <div className="lg:col-span-2 h-[420px] clean-card flex flex-col justify-between p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 z-10">
            <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#4F46E5]" />
              <span>Interactive Infrastructure Geolocation Map</span>
            </span>
            <span className="text-xs font-bold bg-[#EEF2FF] text-[#4F46E5] px-2.5 py-0.5 rounded-full">
              {validIps.length} {validIps.length === 1 ? "Node" : "Nodes"} Mapped
            </span>
          </div>

          {validIps.length === 0 ? (
            <div className="flex-1 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-8 flex flex-col items-center justify-center text-center space-y-2">
              <Globe className="w-10 h-10 text-[#94A3B8]" />
              <div className="text-xs font-bold text-[#0F172A]">Routing Coordinates Unavailable</div>
              <p className="text-[11px] text-[#64748B] max-w-sm leading-relaxed">
                No public geographic coordinates could be reliably extracted from the observed relay hops in this message. TRACE-X never fabricates mock coordinates.
              </p>
            </div>
          ) : (
            <div className="relative w-full flex-1 rounded-2xl border border-[#E2E8F0] overflow-hidden z-0">
              <div ref={mapContainerRef} className="w-full h-full min-h-[320px]" />
            </div>
          )}

          <div className="text-[11px] text-[#64748B] flex items-center justify-between font-medium mt-3">
            <span>Projection: WGS84 Geodetic</span>
            <span>BGP Routing Matrix</span>
          </div>
        </div>

        {/* IP Nodes List */}
        <div className="space-y-2.5 overflow-y-auto max-h-[420px]">
          {validIps.length === 0 ? (
            <div className="clean-card p-6 text-center text-xs text-[#64748B] space-y-1">
              <ShieldAlert className="w-6 h-6 text-[#94A3B8] mx-auto mb-1" />
              <div className="font-semibold text-[#0F172A]">No IP Geolocation Records</div>
              <p className="text-[11px]">No public sender hops were observed.</p>
            </div>
          ) : (
            validIps.map((ip, idx) => {
              const isSelected = selectedIp?.ip === ip.ip;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedIp(ip)}
                  className={`clean-card p-3.5 text-xs space-y-1.5 cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#4F46E5] ring-2 ring-[#EEF2FF] bg-white shadow-sm"
                      : "hover:border-[#CBD5E1]"
                  }`}
                >
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
                    <span className="font-bold text-[#16A34A]">{ip.attribution_confidence || 75}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
