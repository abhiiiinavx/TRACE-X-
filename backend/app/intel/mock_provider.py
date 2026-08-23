import hashlib
import re
from typing import Dict, Any, List
from urllib.parse import urlparse
from backend.app.intel.provider import ThreatIntelProvider
from backend.app.db.schemas import IPIntel, DomainIntel, URLIntel

class MockThreatIntelProvider(ThreatIntelProvider):
    """
    High-fidelity, deterministic mock threat intelligence provider.
    Guarantees reproducible, consistent responses across demos without requiring any paid APIs.
    """

    KNOWN_IPS: Dict[str, Dict[str, Any]] = {
        "185.220.101.5": {
            "country": "Germany", "country_code": "DE", "region": "Hesse", "city": "Frankfurt",
            "lat": 50.1109, "lng": 8.6821, "isp": "Zwiebelfreunde e.V.", "asn": "AS205100",
            "asn_org": "Tor Exit Node Relay Network", "hosting_provider": "F3 Netze e.V.",
            "is_vpn_proxy_tor": True, "node_type": "Tor Exit Node", "attribution_confidence": 95,
            "reputation_score": 12, "risk_score": 88
        },
        "194.36.189.44": {
            "country": "Russia", "country_code": "RU", "region": "Moscow", "city": "Moscow",
            "lat": 55.7558, "lng": 37.6173, "isp": "Bulletproof Hosting Services LLC", "asn": "AS48282",
            "asn_org": "BalkanHost & FastFlux Infrastructure", "hosting_provider": "DarkHost B.V.",
            "is_vpn_proxy_tor": False, "node_type": "Bulletproof VPS Host", "attribution_confidence": 88,
            "reputation_score": 8, "risk_score": 92
        },
        "45.142.214.78": {
            "country": "Netherlands", "country_code": "NL", "region": "North Holland", "city": "Amsterdam",
            "lat": 52.3676, "lng": 4.9041, "isp": "Serverius Holding B.V.", "asn": "AS50673",
            "asn_org": "Serverius Network Infrastructures", "hosting_provider": "Offshore VPS Provider",
            "is_vpn_proxy_tor": True, "node_type": "VPN Gateway / Proxy", "attribution_confidence": 82,
            "reputation_score": 25, "risk_score": 75
        },
        "103.251.167.22": {
            "country": "Nigeria", "country_code": "NG", "region": "Lagos", "city": "Lagos",
            "lat": 6.5244, "lng": 3.3792, "isp": "MainOne Cable Company", "asn": "AS37282",
            "asn_org": "MainOne Telecommunications", "hosting_provider": "West Africa Cloud",
            "is_vpn_proxy_tor": False, "node_type": "Commercial ISP Relay", "attribution_confidence": 80,
            "reputation_score": 35, "risk_score": 65
        },
        "198.51.100.23": {
            "country": "United States", "country_code": "US", "region": "Virginia", "city": "Ashburn",
            "lat": 39.0438, "lng": -77.4874, "isp": "Amazon Data Services NoVA", "asn": "AS16509",
            "asn_org": "Amazon.com Inc.", "hosting_provider": "AWS EC2 Cloud",
            "is_vpn_proxy_tor": False, "node_type": "Public Cloud Instance", "attribution_confidence": 75,
            "reputation_score": 60, "risk_score": 40
        },
        "142.250.190.46": {
            "country": "United States", "country_code": "US", "region": "California", "city": "Mountain View",
            "lat": 37.4220, "lng": -122.0841, "isp": "Google LLC", "asn": "AS15169",
            "asn_org": "Google Enterprise Network", "hosting_provider": "Google Cloud",
            "is_vpn_proxy_tor": False, "node_type": "Enterprise MTA", "attribution_confidence": 99,
            "reputation_score": 98, "risk_score": 2
        }
    }

    KNOWN_DOMAINS: Dict[str, Dict[str, Any]] = {
        "paypa1-security.com": {
            "registrar": "NameCheap Inc. (Privacy Protected)", "created_date": "2026-07-15",
            "expiry_date": "2027-07-15", "nameservers": ["ns1.offshoredns.ru", "ns2.offshoredns.ru"],
            "mx_records": ["mail.paypa1-security.com (10)"], "a_records": ["194.36.189.44"],
            "age_days": 39, "brand_similarity_score": 0.94, "is_lookalike": True,
            "impersonated_brand": "PayPal", "lookalike_technique": "Homoglyph '1' substitution for 'l'",
            "reputation_score": 6, "risk_score": 94,
            "reason_summary": "Domain impersonates PayPal using number '1' substitution. Registered recently (<60 days) via privacy shield; hosted on bulletproof ASN."
        },
        "auth-microsoft365-verify.com": {
            "registrar": "Porkbun LLC", "created_date": "2026-08-01",
            "expiry_date": "2027-08-01", "nameservers": ["dns1.cloudflare.com", "dns2.cloudflare.com"],
            "mx_records": [], "a_records": ["45.142.214.78"],
            "age_days": 22, "brand_similarity_score": 0.91, "is_lookalike": True,
            "impersonated_brand": "Microsoft 365", "lookalike_technique": "Brand keyword combination + suspicious verify action modifier",
            "reputation_score": 10, "risk_score": 90,
            "reason_summary": "Combines brand name 'Microsoft 365' with 'auth' and 'verify'. High probability OAuth/credential harvester."
        },
        "fedex-tracking-doc.xyz": {
            "registrar": "Hostinger Operations, UAB", "created_date": "2026-08-10",
            "expiry_date": "2027-08-10", "nameservers": ["ns1.hostinger.com", "ns2.hostinger.com"],
            "mx_records": ["smtp.fedex-tracking-doc.xyz (10)"], "a_records": ["185.220.101.5"],
            "age_days": 13, "brand_similarity_score": 0.88, "is_lookalike": True,
            "impersonated_brand": "FedEx", "lookalike_technique": "Brand + fake invoice/tracking lure with cheap .xyz TLD",
            "reputation_score": 14, "risk_score": 86,
            "reason_summary": "Suspicious .xyz TLD with FedEx branding used for payload distribution."
        },
        "paypal.com": {
            "registrar": "MarkMonitor Inc.", "created_date": "1999-07-15",
            "expiry_date": "2030-10-30", "nameservers": ["ns1.paypal.com", "ns2.paypal.com"],
            "mx_records": ["mx1.paypal.com (10)", "mx2.paypal.com (10)"], "a_records": ["151.101.65.140"],
            "age_days": 9900, "brand_similarity_score": 1.0, "is_lookalike": False,
            "impersonated_brand": None, "lookalike_technique": None,
            "reputation_score": 99, "risk_score": 1,
            "reason_summary": "Authentic, established PayPal corporate domain with valid enterprise security controls."
        }
    }

    KNOWN_HASHES: Dict[str, Dict[str, Any]] = {
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855": {
            "is_malicious": False, "threat_name": "Clean Document", "reputation": "Known Clean"
        },
        "8f4c2b98e1a537f02d41864b9123456789abcdef0123456789abcdef01234567": {
            "is_malicious": True, "threat_name": "Trojan.AgentTesla.Stealer", "reputation": "High Confidence Malicious",
            "detection_ratio": "58/72 AV Engines", "c2_servers": ["194.36.189.44:8080"]
        },
        "4a1c5d92e8b73f112e45876a9876543210fedcba9876543210fedcba98765432": {
            "is_malicious": True, "threat_name": "Dropper.VBS.Emotet", "reputation": "High Confidence Malicious",
            "detection_ratio": "64/72 AV Engines", "c2_servers": ["185.220.101.5:443"]
        }
    }

    def _hash_seed(self, text: str) -> int:
        return int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:8], 16)

    def get_ip_intel(self, ip: str) -> IPIntel:
        ip = ip.strip("[] ()")
        if ip in self.KNOWN_IPS:
            data = self.KNOWN_IPS[ip]
            return IPIntel(ip=ip, **data)

        # RFC1918 Private IP check
        if ip.startswith("10.") or ip.startswith("192.168.") or (ip.startswith("172.") and 16 <= int(ip.split(".")[1] if len(ip.split(".")) > 1 and ip.split(".")[1].isdigit() else 0) <= 31) or ip == "127.0.0.1":
            return IPIntel(
                ip=ip,
                country="Internal Network",
                country_code="LOCAL",
                region="Private Subnet",
                city="Private Enclave",
                lat=0.0,
                lng=0.0,
                isp="Enterprise LAN / RFC1918",
                asn="AS0",
                asn_org="Private Non-Routable IP Space",
                hosting_provider="Internal MTA",
                is_vpn_proxy_tor=False,
                node_type="Private Subnet (RFC1918)",
                attribution_confidence=100,
                attribution_notes="Internal non-routable address space. Not geolocatable on public internet.",
                reputation_score=75,
                risk_score=10
            )

        # Deterministic generation for unknown public IPs
        seed = self._hash_seed(ip)
        cities = [
            ("United States", "US", "Virginia", "Ashburn", 39.0438, -77.4874, "DigitalOcean LLC", "AS14061"),
            ("Germany", "DE", "Hesse", "Frankfurt", 50.1109, 8.6821, "Hetzner Online GmbH", "AS24940"),
            ("United Kingdom", "GB", "London", "London", 51.5074, -0.1278, "Linode LLC", "AS63949"),
            ("Singapore", "SG", "Singapore", "Singapore", 1.3521, 103.8198, "OVH SAS", "AS16276"),
            ("France", "FR", "Île-de-France", "Paris", 48.8566, 2.3522, "Scaleway S.A.S.", "AS12876"),
            ("Russia", "RU", "Saint Petersburg", "Saint Petersburg", 59.9343, 30.3351, "Selectel LLC", "AS49505"),
            ("Brazil", "BR", "São Paulo", "São Paulo", -23.5505, -46.6333, "Claro Brasil", "AS28573"),
            ("India", "IN", "Maharashtra", "Mumbai", 19.0760, 72.8777, "Reliance Jio Infocomm", "AS55836")
        ]
        loc = cities[seed % len(cities)]
        is_vpn = (seed % 5 == 0)
        rep = 30 + (seed % 60)
        risk = 100 - rep

        return IPIntel(
            ip=ip,
            country=loc[0],
            country_code=loc[1],
            region=loc[2],
            city=loc[3],
            lat=loc[4] + ((seed % 100) - 50) * 0.005,
            lng=loc[5] + ((seed % 100) - 50) * 0.005,
            isp=loc[6],
            asn=loc[7],
            asn_org=f"{loc[6]} Autonomous System",
            hosting_provider=loc[6],
            is_vpn_proxy_tor=is_vpn,
            node_type="VPN Gateway" if is_vpn else "Commercial Cloud Host",
            attribution_confidence=75 + (seed % 20),
            attribution_notes="Probable infrastructure location based on BGP routing and ASN registry.",
            reputation_score=rep,
            risk_score=risk
        )

    def get_domain_intel(self, domain: str) -> DomainIntel:
        domain_lower = domain.strip().lower()
        if domain_lower in self.KNOWN_DOMAINS:
            data = self.KNOWN_DOMAINS[domain_lower]
            return DomainIntel(domain=domain_lower, **data)

        # Check for lookalike patterns deterministically
        seed = self._hash_seed(domain_lower)
        is_suspicious_tld = any(domain_lower.endswith(tld) for tld in [".xyz", ".top", ".club", ".icu", ".work", ".cfd", ".gq"])
        has_hyphen_brand = any(brand in domain_lower for brand in ["paypal", "microsoft", "google", "apple", "netflix", "amazon", "dhl", "fedex", "chase", "bank"])
        
        is_lookalike = False
        brand = None
        technique = None
        if has_hyphen_brand:
            is_lookalike = True
            for b in ["paypal", "microsoft", "google", "apple", "netflix", "amazon", "dhl", "fedex", "chase"]:
                if b in domain_lower:
                    brand = b.capitalize()
                    break
            technique = "Brand name pairing with suspicious token"

        age_days = 15 + (seed % 120) if (is_lookalike or is_suspicious_tld) else 300 + (seed % 2000)
        rep = 15 + (seed % 35) if (is_lookalike or is_suspicious_tld) else 65 + (seed % 30)
        risk = 100 - rep

        reason = None
        if is_lookalike:
            reason = f"Domain matches known brand token '{brand}' with suspicious modifiers. Young domain ({age_days} days old)."
        elif is_suspicious_tld:
            reason = f"High-risk top level domain ({domain_lower.split('.')[-1]}), frequently abused for credential phishing."

        return DomainIntel(
            domain=domain_lower,
            registrar="NameCheap, Inc." if (seed % 2 == 0) else "GoDaddy.com, LLC",
            created_date=f"2026-0{(seed % 8) + 1}-10",
            expiry_date=f"2027-0{(seed % 8) + 1}-10",
            nameservers=[f"ns1.{domain_lower}", f"ns2.{domain_lower}"],
            mx_records=[f"mail.{domain_lower} (10)"],
            a_records=[f"194.36.189.{10 + (seed % 80)}"],
            age_days=age_days,
            brand_similarity_score=0.88 if is_lookalike else 0.12,
            is_lookalike=is_lookalike,
            impersonated_brand=brand,
            lookalike_technique=technique,
            reputation_score=rep,
            risk_score=risk,
            reason_summary=reason
        )

    def get_url_intel(self, url: str) -> URLIntel:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if ":" in domain:
            domain = domain.split(":")[0]

        is_https = parsed.scheme == "https"
        suspicious_reasons = []

        # Check for URL shorteners or multi-hop redirects
        is_shortener = domain in ["bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "rb.gy"]
        is_credential_path = any(token in parsed.path.lower() for token in ["login", "signin", "auth", "verify", "secure", "account", "update", "banking", "invoice", "session"])
        
        redirect_chain = [url]
        final_url = url

        if is_shortener:
            target_domain = "auth-microsoft365-verify.com" if "ms" in url else "paypa1-security.com/login"
            final_url = f"https://{target_domain}"
            redirect_chain = [url, f"https://cdn.redirect-gateway.net/hop", final_url]
            suspicious_reasons.append("URL shortener obscures destination phishing landing page")
            domain = target_domain.split("/")[0]

        if not is_https:
            suspicious_reasons.append("Insecure plain HTTP connection utilized")

        if is_credential_path:
            suspicious_reasons.append("URI path structure matches credential harvesting endpoint")

        domain_intel = self.get_domain_intel(domain)
        if domain_intel.is_lookalike:
            suspicious_reasons.append(f"Destination domain impersonates {domain_intel.impersonated_brand}")

        risk_score = min(98, 30 + (25 if is_shortener else 0) + (20 if not is_https else 0) + (25 if is_credential_path else 0) + (domain_intel.risk_score // 3))

        return URLIntel(
            original_url=url,
            final_url=final_url,
            redirect_chain=redirect_chain,
            domain=domain,
            resolved_ip=domain_intel.a_records[0] if domain_intel.a_records else "194.36.189.44",
            is_https=is_https,
            risk_score=risk_score,
            is_credential_harvester=is_credential_path or domain_intel.is_lookalike,
            suspicious_reasons=suspicious_reasons
        )

    def get_hash_reputation(self, sha256_hash: str) -> Dict[str, Any]:
        if sha256_hash in self.KNOWN_HASHES:
            return self.KNOWN_HASHES[sha256_hash]

        seed = self._hash_seed(sha256_hash)
        is_mal = (seed % 3 == 0)
        return {
            "is_malicious": is_mal,
            "threat_name": "Trojan.GenericKD.Payload" if is_mal else "Known Clean Artifact",
            "reputation": "Suspicious / Malicious Signature" if is_mal else "Clean Artifact",
            "detection_ratio": f"{45 + (seed % 25)}/72 AV Engines" if is_mal else "0/72 AV Engines"
        }

threat_intel_provider = MockThreatIntelProvider()
