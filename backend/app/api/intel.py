import re
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.intel.mock_provider import threat_intel_provider
from backend.app.detection.brand_impersonation import BrandImpersonationDetector

router = APIRouter()

@router.get("/search")
def universal_intel_search(
    q: str = Query(..., description="Query: IP, Domain, URL, Hash, or ASN"),
    db: Session = Depends(get_db)
):
    query_str = q.strip()
    if not query_str:
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")

    # 1. Check if IP address
    if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', query_str):
        ip_intel = threat_intel_provider.get_ip_intel(query_str)
        return {
            "type": "IP",
            "query": query_str,
            "intel": ip_intel.model_dump(),
            "attribution_standard": "Probable infrastructure location based on BGP routing telemetry and ASN registry."
        }

    # 2. Check if URL
    if query_str.startswith("http://") or query_str.startswith("https://"):
        url_intel = threat_intel_provider.get_url_intel(query_str)
        return {
            "type": "URL",
            "query": query_str,
            "intel": url_intel.model_dump()
        }

    # 3. Check if Hash (MD5, SHA1, SHA256)
    if re.match(r'^[a-fA-F0-9]{32,64}$', query_str):
        hash_intel = threat_intel_provider.get_hash_reputation(query_str)
        return {
            "type": "HASH",
            "query": query_str,
            "intel": hash_intel
        }

    # 4. Check if ASN
    if query_str.upper().startswith("AS") and query_str[2:].isdigit():
        return {
            "type": "ASN",
            "query": query_str.upper(),
            "intel": {
                "asn": query_str.upper(),
                "org": f"{query_str.upper()} Autonomous System Network",
                "reputation": "Commercial Transit Network",
                "risk_score": 45,
                "announcing_prefixes": 128
            }
        }

    # 5. Default to Domain
    clean_domain = query_str.lower().strip()
    if "/" in clean_domain:
        clean_domain = clean_domain.split("/")[0]
    
    domain_intel = threat_intel_provider.get_domain_intel(clean_domain)
    brand_check = BrandImpersonationDetector.analyze_domain(clean_domain)
    
    return {
        "type": "DOMAIN",
        "query": clean_domain,
        "intel": domain_intel.model_dump(),
        "brand_analysis": brand_check
    }
