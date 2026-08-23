from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from backend.app.db.schemas import IPIntel, DomainIntel, URLIntel

class ThreatIntelProvider(ABC):
    """
    Abstract Threat Intelligence Provider Interface.
    Enforces clean separation between forensic detection and external intel sources.
    Allows zero-cost offline demo execution via MockProvider and live provider pluggability.
    """

    @abstractmethod
    def get_ip_intel(self, ip: str) -> IPIntel:
        """Retrieve geolocation, ASN, ISP, VPN/Tor, and reputation intelligence for an IP."""
        pass

    @abstractmethod
    def get_domain_intel(self, domain: str) -> DomainIntel:
        """Retrieve registrar, age, DNS records, brand similarity, and reputation for a domain."""
        pass

    @abstractmethod
    def get_url_intel(self, url: str) -> URLIntel:
        """Analyze URL structure, redirect hops, resolved IP/domain, and credential harvesting status."""
        pass

    @abstractmethod
    def get_hash_reputation(self, sha256_hash: str) -> Dict[str, Any]:
        """Check SHA-256 hash against threat databases / malware families."""
        pass
