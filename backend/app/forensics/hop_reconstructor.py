import re
from datetime import datetime
from email.utils import parsedate_to_datetime
from typing import List, Dict, Any, Optional
import math
from backend.app.db.schemas import RelayHop
from backend.app.intel.mock_provider import threat_intel_provider

class HopReconstructor:
    """
    Forensic Hop Relay Reconstructor.
    Parses sequential Received headers, reconstructs the message transit pipeline,
    computes transit delays, flags header anomalies, and tracks relay geolocations.
    """

    IP_REGEX = re.compile(r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b')
    FROM_REGEX = re.compile(r'from\s+([^\s;()]+(?:\s*\([^)]*\))?)', re.IGNORECASE)
    BY_REGEX = re.compile(r'by\s+([^\s;()]+)', re.IGNORECASE)
    WITH_REGEX = re.compile(r'with\s+([^\s;()]+)', re.IGNORECASE)

    @classmethod
    def is_private_ip(cls, ip: str) -> bool:
        if not ip:
            return False
        parts = ip.split(".")
        if len(parts) != 4:
            return False
        try:
            first = int(parts[0])
            second = int(parts[1])
            if first == 10 or first == 127:
                return True
            if first == 192 and second == 168:
                return True
            if first == 172 and 16 <= second <= 31:
                return True
        except ValueError:
            return False
        return False

    @classmethod
    def haversine_distance(cls, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate great-circle distance in kilometers between two coordinates."""
        if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
            return 0.0
        R = 6371.0  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    @classmethod
    def parse_received_headers(cls, received_headers: List[str]) -> List[RelayHop]:
        """
        Received headers in standard emails are listed in reverse chronological order
        (top-most Received header is the final recipient MTA).
        We reverse them to produce sequential sender -> recipient order (Hop 1, 2, 3...).
        """
        if not received_headers:
            return []

        # Chronological order
        chronological_headers = list(reversed(received_headers))
        parsed_hops: List[RelayHop] = []
        hop_datetimes: List[Optional[datetime]] = []

        for idx, header_val in enumerate(chronological_headers, start=1):
            # Extract IP
            ips = cls.IP_REGEX.findall(header_val)
            extracted_ip = ips[0] if ips else None

            # Extract From host
            from_match = cls.FROM_REGEX.search(header_val)
            from_host = from_match.group(1).strip() if from_match else None

            # Extract By host
            by_match = cls.BY_REGEX.search(header_val)
            by_host = by_match.group(1).strip() if by_match else None

            # Extract protocol (ESMTPS, SMTP, etc.)
            with_match = cls.WITH_REGEX.search(header_val)
            protocol = with_match.group(1).upper() if with_match else "SMTP"

            # Extract timestamp after semicolon
            dt_obj: Optional[datetime] = None
            timestamp_str: Optional[str] = None
            if ";" in header_val:
                raw_date = header_val.split(";")[-1].strip()
                try:
                    dt_obj = parsedate_to_datetime(raw_date)
                    timestamp_str = dt_obj.strftime("%Y-%m-%d %H:%M:%S UTC")
                except Exception:
                    timestamp_str = raw_date

            hop_datetimes.append(dt_obj)
            is_priv = cls.is_private_ip(extracted_ip) if extracted_ip else False

            # Query Geo & ASN Intel for IP
            intel = threat_intel_provider.get_ip_intel(extracted_ip) if extracted_ip else None

            risk_flags = []
            if is_priv and idx > 1:
                risk_flags.append("Private RFC1918 address inside intermediate public routing path")

            if intel:
                if intel.is_vpn_proxy_tor:
                    risk_flags.append(f"Originating node is an anonymizing gateway ({intel.node_type})")
                if intel.risk_score > 70:
                    risk_flags.append(f"High risk ASN / hosting infrastructure: {intel.asn_org}")

            hop = RelayHop(
                hop_index=idx,
                by_host=by_host,
                from_host=from_host,
                ip=extracted_ip,
                timestamp=timestamp_str,
                delay_seconds=0.0,
                protocol=protocol,
                is_private_ip=is_priv,
                asn=intel.asn if intel else None,
                asn_org=intel.asn_org if intel else None,
                country=intel.country if intel else None,
                city=intel.city if intel else None,
                lat=intel.lat if intel else None,
                lng=intel.lng if intel else None,
                risk_flags=risk_flags
            )
            parsed_hops.append(hop)

        # Compute transit delays and geographic jump anomalies
        for i in range(1, len(parsed_hops)):
            prev_dt = hop_datetimes[i - 1]
            curr_dt = hop_datetimes[i]
            prev_hop = parsed_hops[i - 1]
            curr_hop = parsed_hops[i]

            if prev_dt and curr_dt:
                delta = (curr_dt - prev_dt).total_seconds()
                curr_hop.delay_seconds = max(-9999.0, round(delta, 1))

                if delta < 0:
                    curr_hop.risk_flags.append(f"Negative delay anomaly ({delta}s): Potential header clock skew or forged received header")
                elif delta > 300:
                    curr_hop.risk_flags.append(f"Excessive transit delay ({int(delta)}s) at intermediate relay")

                # Check geographic jump
                if prev_hop.lat and prev_hop.lng and curr_hop.lat and curr_hop.lng and not prev_hop.is_private_ip and not curr_hop.is_private_ip:
                    dist_km = cls.haversine_distance(prev_hop.lat, prev_hop.lng, curr_hop.lat, curr_hop.lng)
                    if dist_km > 3000 and 0 <= delta < 5:
                        curr_hop.risk_flags.append(f"Geographically implausible transit jump: {int(dist_km)} km traversed in {int(delta)}s")

        return parsed_hops
