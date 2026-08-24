from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: str
    email: str
    full_name: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    role: str = "analyst"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# Feature breakdown & MITRE
class FeatureImpact(BaseModel):
    feature: str
    evidence: str
    impact: int  # e.g., +25, -10
    confidence: int  # percentage 0-100
    category: str = "General"  # Domain, Auth, NLP, Intel, Graph, Header

class MitreTechnique(BaseModel):
    id: str
    name: str
    tactic: str
    description: str

# Hop Item
class RelayHop(BaseModel):
    hop_index: int
    by_host: Optional[str] = None
    from_host: Optional[str] = None
    ip: Optional[str] = None
    timestamp: Optional[str] = None
    delay_seconds: Optional[float] = None
    protocol: Optional[str] = None
    is_private_ip: bool = False
    asn: Optional[str] = None
    asn_org: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    risk_flags: List[str] = []

# Domain Intel
class DomainIntel(BaseModel):
    domain: str
    registrar: Optional[str] = None
    created_date: Optional[str] = None
    expiry_date: Optional[str] = None
    nameservers: List[str] = []
    mx_records: List[str] = []
    a_records: List[str] = []
    age_days: int = 0
    brand_similarity_score: float = 0.0
    is_lookalike: bool = False
    impersonated_brand: Optional[str] = None
    lookalike_technique: Optional[str] = None
    reputation_score: int = 50
    risk_score: int = 0
    reason_summary: Optional[str] = None

# IP Intel
class IPIntel(BaseModel):
    ip: str
    country: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    isp: Optional[str] = None
    asn: Optional[str] = None
    asn_org: Optional[str] = None
    hosting_provider: Optional[str] = None
    is_vpn_proxy_tor: bool = False
    node_type: str = "Public Host"
    attribution_confidence: int = 70
    attribution_notes: str = "Probable infrastructure location based on BGP routing."
    reputation_score: int = 50
    risk_score: int = 0

# URL Intel
class URLIntel(BaseModel):
    original_url: str
    final_url: Optional[str] = None
    redirect_chain: List[str] = []
    domain: Optional[str] = None
    resolved_ip: Optional[str] = None
    is_https: bool = False
    risk_score: int = 0
    is_credential_harvester: bool = False
    suspicious_reasons: List[str] = []

# Attachment Schema
class AttachmentInfo(BaseModel):
    id: Optional[str] = None
    filename: str
    mime_type: Optional[str] = None
    size_bytes: int = 0
    sha256: str
    is_malicious: bool = False
    threat_name: Optional[str] = None

# Email Analysis Results
class EmailAnalysisResponse(BaseModel):
    id: str
    case_id: Optional[str] = None
    from_addr: str
    from_display_name: Optional[str] = None
    to_addr: str
    reply_to: Optional[str] = None
    return_path: Optional[str] = None
    subject: Optional[str] = None
    message_id: Optional[str] = None
    date_header: Optional[str] = None
    sha256: str
    risk_score: int
    severity: str
    classification: str
    explanation_summary: Optional[str] = None
    feature_breakdown: List[FeatureImpact] = []
    mitre_techniques: List[MitreTechnique] = []
    auth_results: Dict[str, Any] = {}
    nlp_signals: Dict[str, Any] = {}
    score_calculation_breakdown: Dict[str, Any] = {}
    body_plain_snippet: Optional[str] = None
    body_html_sanitized: Optional[str] = None
    urls: List[URLIntel] = []
    attachments: List[AttachmentInfo] = []
    hops: List[RelayHop] = []
    domains_intel: List[DomainIntel] = []
    ips_intel: List[IPIntel] = []
    campaign_association: Optional[Dict[str, Any]] = None
    trace_available: bool = True
    trace_explanation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Copilot Request & Response
class CopilotQuery(BaseModel):
    case_id: Optional[str] = None
    email_id: Optional[str] = None
    question: str

class CopilotResponse(BaseModel):
    answer: str
    evidence_sources: List[str] = []
    confidence: int = 90
    mitre_refs: List[str] = []
    query_id: str

# Case Schemas
class CaseActionItem(BaseModel):
    id: str
    title: str
    priority: str  # HIGH, MEDIUM, LOW
    reason: str
    evidence_pointer: str
    is_completed: bool = False

class ForensicCaseCreate(BaseModel):
    title: str
    severity: str = "HIGH"
    investigator_name: Optional[str] = "Lead Forensic Analyst"
    notes: Optional[str] = None

class ForensicCaseResponse(BaseModel):
    id: str
    case_number: str
    title: str
    severity: str
    status: str
    investigator_name: Optional[str] = None
    action_items: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    email_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Graph Schemas
class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # email, domain, ip, url, asn, sender, campaign, attachment
    data: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str  # SENT_BY, CONTAINS_URL, RESOLVES_TO, HOSTED_ON, BELONGS_TO, RELAYS_THROUGH
    weight: float = 1.0

class EntityGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# Dashboard Stats
class DashboardStats(BaseModel):
    total_analyzed: int
    threats_detected: int
    critical_threats: int
    phishing_attempts: int
    bec_attempts: int
    malicious_urls: int
    suspicious_domains: int
    active_campaigns: int
    high_risk_infrastructure: int
    threats_over_time: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    top_domains: List[Dict[str, Any]]
    top_ips: List[Dict[str, Any]]
    country_distribution: List[Dict[str, Any]]

class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    username: str
    action: str
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    details: Dict[str, Any] = {}
    ip_addr: Optional[str] = "127.0.0.1"
    created_at: datetime

    class Config:
        from_attributes = True

# Unified Search Result
class SearchItem(BaseModel):
    id: str
    type: str  # email, domain, ip, url, attachment, case, campaign
    title: str
    subtitle: Optional[str] = None
    risk_score: Optional[int] = None
    severity: Optional[str] = None
    link: str
    metadata: Dict[str, Any] = {}

class UnifiedSearchResult(BaseModel):
    query: str
    total_count: int
    results: List[SearchItem]
    categories: Dict[str, int]
